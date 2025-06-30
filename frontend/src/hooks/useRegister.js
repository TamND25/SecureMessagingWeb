import axios from 'axios';
import {
  generateRSAKeyPair,
  encryptAESGCM,
  encryptAESKeyWithPublicKey,
  importPublicKey,
  arrayBufferToBase64,
} from '../utils/secureClient';

const API_URL = import.meta.env.VITE_API_URL;

export const useRegister = () => {
  const registerUser = async ({ username, email, password }) => {
    const { publicKey, privateKeyPEM } = await generateRSAKeyPair();

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const passwordKeyMaterial = await window.crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(password),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    const aesKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      passwordKeyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt"]
    );

    const { ciphertext: encryptedPrivateKey, iv } = await encryptAESGCM(aesKey, privateKeyPEM);

    const publicKeyObj = await importPublicKey(publicKey);
    const encryptedKey = await encryptAESKeyWithPublicKey(aesKey, publicKeyObj);

    const res = await axios.post(`${API_URL}/api/auth/register`, {
      username,
      email,
      password,
      publicKey,
      encryptedPrivateKey,
      encryptedKey,
      salt: arrayBufferToBase64(salt),
      iv,
    });

    localStorage.setItem('privateKeyPEM', privateKeyPEM);

    return res.data;
  };

  return { registerUser };
};
