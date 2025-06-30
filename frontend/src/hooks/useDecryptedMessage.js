import { useEffect, useState } from "react";
import {
  importPrivateKey,
  decryptAESKeyWithPrivateKey,
  decryptMessage,
  base64ToArrayBuffer,
} from "../utils/secureClient";

const API_URL = "";

const useDecryptedMessage = (message, isSender) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const decrypt = async () => {
      if (!message || (!message.content && message.type !== "text")) return;

      const privateKeyPEM = localStorage.getItem("privateKeyPEM");
      if (!privateKeyPEM) return setError("[Private key not found]");

      try {
        const privateKey = await importPrivateKey(privateKeyPEM);
        const encryptedKey = isSender
          ? message.encryptedKeyForSender
          : message.encryptedKeyForReceiver;

        if (!encryptedKey || !message.iv || !message.content) {
          throw new Error("Missing encrypted key, IV, or content");
        }

        const aesKey = await decryptAESKeyWithPrivateKey(encryptedKey, privateKey);

        if (message.type === "text") {
          const text = await decryptMessage(aesKey, message.content, message.iv);
          setContent(text);
        }

        if (message.type === "file") {
          const response = await fetch(`${API_URL}${message.content}`);
          const encryptedBuffer = await response.arrayBuffer();

          const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
              name: "AES-GCM",
              iv: base64ToArrayBuffer(message.iv),
            },
            aesKey,
            encryptedBuffer
          );

          const blob = new Blob([decryptedBuffer], {type : message.mimeType });
          const url = URL.createObjectURL(blob);
          setContent(url);
        }
      } catch (err) {
        console.error("Decryption error:", err);
        setError("[Unable to decrypt]");
      }
    };

    decrypt();

    return () => {
      if (content?.startsWith?.("blob:")) {
        URL.revokeObjectURL(content);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, isSender]);

  return { content, error };
};

export default useDecryptedMessage;
