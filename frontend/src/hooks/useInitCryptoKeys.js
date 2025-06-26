// src/hooks/useInitCryptoKeys.js
import { useEffect } from "react";
import { importPrivateKey, importPublicKey } from "../utils/secureClient";

export const useInitCryptoKeys = () => {
  useEffect(() => {
    const init = async () => {
      try {
        const privateKeyPEM = localStorage.getItem("privateKey");
        const publicKeyB64 = localStorage.getItem("publicKey");

        if (!privateKeyPEM || !publicKeyB64) {
          console.warn("Missing RSA keys. Please log in again.");
          return;
        }

        // Try importing to validate
        await importPrivateKey(privateKeyPEM);
        await importPublicKey(publicKeyB64);

        console.log("RSA keys loaded successfully");
      } catch (err) {
        console.error("Failed to load RSA keys:", err);
        // Optional: localStorage.clear(); or redirect to login
      }
    };

    init();
  }, []);
};
