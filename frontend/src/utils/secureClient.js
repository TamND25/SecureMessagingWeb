const subtle = window.crypto.subtle;

export const arrayBufferToBase64 = (buf) =>
  btoa(String.fromCharCode(...new Uint8Array(buf)));

export const base64ToArrayBuffer = (b64) =>
  Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)).buffer;

function base64ToPEM(b64) {
  const lines = b64.match(/.{1,64}/g).join("\n");
  return `-----BEGIN PRIVATE KEY-----\n${lines}\n-----END PRIVATE KEY-----`;
}

function pemToBase64(pem) {
  return pem.replace(/-----[^-]+-----|\s+/g, "");
}

export async function generateRSAKeyPair() {
  const keyPair = await subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const publicKey = await subtle.exportKey("spki", keyPair.publicKey);
  const privateKey = await subtle.exportKey("pkcs8", keyPair.privateKey);

  return {
    publicKey: arrayBufferToBase64(publicKey),
    privateKeyPEM: base64ToPEM(arrayBufferToBase64(privateKey)),
  };
}

export async function importPrivateKey(pem) {
  if (!pem) {
    throw new Error("PEM is null or undefined during importPrivateKey()");
  }
  const base64 = pemToBase64(pem);
  return await subtle.importKey(
    "pkcs8",
    base64ToArrayBuffer(base64),
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  );
}

export async function importPublicKey(b64) {
  return await subtle.importKey(
    "spki",
    base64ToArrayBuffer(b64),
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"]
  );
}

export async function generateAESKey() {
  return await subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptMessage(aesKey, plaintext) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder().encode(plaintext);

  const ciphertext = await subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    enc
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv),
  };
}

export async function decryptMessage(aesKey, ciphertext, iv) {
  const decrypted = await subtle.decrypt(
    { name: "AES-GCM", iv: base64ToArrayBuffer(iv) },
    aesKey,
    base64ToArrayBuffer(ciphertext)
  );
  return new TextDecoder().decode(decrypted);
}

export async function encryptAESKeyWithPublicKey(aesKey, publicKey) {
  const rawKey = await subtle.exportKey("raw", aesKey);
  const encrypted = await subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawKey
  );
  return arrayBufferToBase64(encrypted);
}

export async function decryptAESKeyWithPrivateKey(encryptedKeyB64, privateKey) {
    try {
        const rawKey = await subtle.decrypt(
            { name: "RSA-OAEP" },
            privateKey,
            base64ToArrayBuffer(encryptedKeyB64)
        );
        return await subtle.importKey("raw", rawKey, "AES-GCM", true, [
            "encrypt",
            "decrypt",  
        ]);
    } catch (err) {
        console.error("Failed to decrypt AES key:", err);
        throw err;
    }
}

export async function encryptFile(file) {
  const aesKey = await generateAESKey();


  const fileBuffer = await file.arrayBuffer();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    fileBuffer
  );

  return {
    encryptedFile: new Uint8Array(encrypted),
    iv: arrayBufferToBase64(iv),
    aesKey,
    originalName: file.name,
    mimeType: file.type,
  };
}

export async function encryptAESGCM(key, plaintext) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv),
  };
}

export async function decryptAESGCM(key, ciphertextBase64, ivBase64) {
  const ciphertext = Uint8Array.from(atob(ciphertextBase64), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(decrypted);
}

export async function encryptFileWithGroupKey(file, groupAESKey) {
  if (!groupAESKey) throw new Error("Missing group AES key");

  const fileBuffer = await file.arrayBuffer();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await subtle.encrypt(
    { name: "AES-GCM", iv },
    groupAESKey,
    fileBuffer
  );

  return {
    encryptedFile: new Uint8Array(encrypted),
    iv: arrayBufferToBase64(iv),
    originalName: file.name,
    mimeType: file.type,
  };
}
