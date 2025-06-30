import axios from 'axios';
import {
  decryptAESGCM,
  importPrivateKey,
  base64ToArrayBuffer
} from '../utils/secureClient';

const API_URL = import.meta.env.VITE_API_URL;

export const useLogin = () => {
  const loginUser = async ({ username, password }) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, {
      username,
      password,
    });

    const { token, user } = res.data;
    const { encryptedPrivateKey, encryptedKey, iv, salt } = user;

    if (!encryptedPrivateKey || !encryptedKey || !iv || !salt) {
      throw new Error("Missing encryption fields in user record");
    }

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
        salt: base64ToArrayBuffer(salt),
        iterations: 100000,
        hash: "SHA-256",
      },
      passwordKeyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );

    const privateKeyPEM = await decryptAESGCM(aesKey, encryptedPrivateKey, iv);
    const privateKey = await importPrivateKey(privateKeyPEM);
    

    localStorage.setItem('token', token);
    localStorage.setItem('privateKeyPEM', privateKeyPEM);
    localStorage.setItem('publicKey', user.publicKey);
    return { token, user, privateKey };
  };

  return { loginUser };
};
