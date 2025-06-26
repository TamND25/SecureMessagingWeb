import CryptoJS from 'crypto-js';
import axios from 'axios';
import { importPrivateKey } from '../utils/secureClient';

export const useLogin = () => {
  const loginUser = async ({ username, password }) => {
    const res = await axios.post('http://localhost:5000/api/auth/login', {
      username,
      password,
    });

    const { token, user } = res.data;
    const { encryptedPrivateKey, salt, iv } = user;

    const aesKey = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(salt), {
      keySize: 256 / 32,
      iterations: 100000,
    });

    const decryptedPEM = CryptoJS.AES.decrypt(encryptedPrivateKey, aesKey, {
      iv: CryptoJS.enc.Hex.parse(iv),
    }).toString(CryptoJS.enc.Utf8);

    const privateKey = await importPrivateKey(decryptedPEM);

    localStorage.setItem('token', token);
    localStorage.setItem('privateKeyPEM', decryptedPEM);

    return { token, user, privateKey };
  };

  return { loginUser };
};
