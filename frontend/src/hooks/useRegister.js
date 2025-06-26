// src/hooks/useRegister.js
import {
  generateRSAKeyPair
} from '../utils/secureClient';
import CryptoJS from 'crypto-js';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth/register';

export const useRegister = () => {
  const registerUser = async ({ username, email, password }) => {
    const { publicKey, privateKey } = await generateRSAKeyPair();

    const salt = CryptoJS.lib.WordArray.random(16).toString();
    const iv = CryptoJS.lib.WordArray.random(16).toString();

    const aesKey = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
      keySize: 256 / 32,
      iterations: 100000,
    });

    const encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, aesKey, {
      iv: CryptoJS.enc.Hex.parse(iv),
    }).toString();

    const response = await axios.post(API_URL, {
      username,
      email,
      password,
      publicKey,
      encryptedPrivateKey,
      salt,
      iv,
    });

    return response.data;
  };

  return { registerUser };
};
