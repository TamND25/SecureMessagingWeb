import { useEffect, useState, useCallback } from "react";
import axios from "axios";

import {
  softDeleteMessage,
  hardDeleteMessage,
  editMessage as editMessageApi,
} from "../services/messageApi";

import {
  generateAESKey,
  encryptMessage,
  importPublicKey,
  encryptAESKeyWithPublicKey,
  encryptFile
} from "../utils/secureClient";

const useMessages = ({ selectedUser, loggedInUserId, socket }) => {
  const [messages, setMessages] = useState([]);
  const token = localStorage.getItem("token");

  const fetchMessages = useCallback(async () => {
    if (!selectedUser?.id || !token) return;
    try {
      const res = await axios.get(`/api/message/conversation/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filtered = (res.data || []).filter(
        (msg) => !msg.deletedFor?.includes(loggedInUserId)
      );

      setMessages(filtered);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, [selectedUser, token]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const privateKeyPEM = localStorage.getItem("privateKeyPEM");
      

      if (!token || !privateKeyPEM) {
        console.error("Missing auth token or private key.");
        return;
      }

      const keyRes = await axios.get(`/api/secure/getUserKey/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const recipientPublicKeyB64 = keyRes.data?.publicKey;
      if (!recipientPublicKeyB64) {
        throw new Error("Recipient public key not found");
      }

      const recipientPublicKey = await importPublicKey(recipientPublicKeyB64);

      const senderPublicKeyB64 = localStorage.getItem("publicKey");
      if (!senderPublicKeyB64) {
        throw new Error("Sender public key not found");
      }

      const senderPublicKey = await importPublicKey(senderPublicKeyB64);

      const aesKey = await generateAESKey();
      const { ciphertext, iv } = await encryptMessage(aesKey, text);

      if (!ciphertext || !iv) {
        throw new Error("Encryption failed — missing ciphertext or IV");
      }

      const encryptedKeyForSender = await encryptAESKeyWithPublicKey(aesKey, senderPublicKey);
      const encryptedKeyForReceiver = await encryptAESKeyWithPublicKey(aesKey, recipientPublicKey);

      const payload = {
        receiverId: selectedUser.id,
        content: ciphertext,
        iv,
        encryptedKeyForSender,
        encryptedKeyForReceiver,
        type: "text",
      };

      const res = await axios.post("/api/secure/sendMessage", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newMsg = res.data;
      socket.emit("send_message", newMsg);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      console.error("Secure send failed:", err);
    }
  };

  const sendFile = async (file) => {
  try {
    const token = localStorage.getItem("token");

    const {
      encryptedFile,
      iv,
      aesKey,
      originalName,
      mimeType,
    } = await encryptFile(file);

    const keyRes = await axios.get(`/api/secure/getUserKey/${selectedUser.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const recipientPublicKey = await importPublicKey(keyRes.data?.publicKey);
    const senderPublicKey = await importPublicKey(localStorage.getItem("publicKey"));

    const encryptedKeyForSender = await encryptAESKeyWithPublicKey(aesKey, senderPublicKey);
    const encryptedKeyForReceiver = await encryptAESKeyWithPublicKey(aesKey, recipientPublicKey);

    const formData = new FormData();
    formData.append("file", new Blob([encryptedFile]), originalName);
    formData.append("receiverId", selectedUser.id);
    formData.append("iv", iv);
    formData.append("encryptedKeyForSender", encryptedKeyForSender);
    formData.append("encryptedKeyForReceiver", encryptedKeyForReceiver);
    formData.append("originalName", originalName);
    formData.append("mimeType", mimeType);

    const uploadRes = await axios.post("/api/message/file", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    const fileMsg = uploadRes.data.messageData;
    socket.emit("send_message", fileMsg);
    setMessages((prev) => [...prev, fileMsg]);
  } catch (err) {
    console.error("Encrypted file upload failed:", err);
  }
};

  const receiveSocketMessage = useCallback((msg) => {
    const isRelevant =
      (msg.senderId === selectedUser.id && msg.receiverId === loggedInUserId) ||
      (msg.senderId === loggedInUserId && msg.receiverId === selectedUser.id);

    const isVisible = !msg.deletedFor?.includes?.(loggedInUserId);

    if (isRelevant && isVisible) {
      setMessages((prev) => [...prev, msg]);
    }
  }, [selectedUser, loggedInUserId]);

  const deleteMessage = async (id, hard = false) => {
    try {
      if (hard) {
        await hardDeleteMessage(id, token);
        setMessages((prev) => prev.filter((m) => m.id !== id));
      } else {
        await softDeleteMessage(id, token);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === id
              ? {
                  ...m,
                  deletedFor: [...(m.deletedFor || []), loggedInUserId],
                }
              : m
          )
        );
      }
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const editMessage = async (id, newText) => {
    try {
      const privateKeyPEM = localStorage.getItem("privateKeyPEM");
      const publicKeyB64 = localStorage.getItem("publicKey");
      const token = localStorage.getItem("token");

      if (!privateKeyPEM || !publicKeyB64 || !token) {
        console.error("Missing keys or token for editing message");
        return;
      }

      const resKey = await axios.get(`/api/secure/getUserKey/${selectedUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const recipientPublicKey = await importPublicKey(resKey.data.publicKey);
      const senderPublicKey = await importPublicKey(publicKeyB64);

      const aesKey = await generateAESKey();
      const { ciphertext, iv } = await encryptMessage(aesKey, newText);

      const encryptedKeyForSender = await encryptAESKeyWithPublicKey(aesKey, senderPublicKey);
      const encryptedKeyForReceiver = await encryptAESKeyWithPublicKey(aesKey, recipientPublicKey);

      const payload = {
        content: ciphertext,
        iv,
        encryptedKeyForSender,
        encryptedKeyForReceiver,
      };

      const editRes = await axios.put(`/api/message/${id}/edit`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...editRes.data } : m))
      );
    } catch (err) {
      console.error("Edit failed:", err);
    }
  };


  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    socket.on("receive_message", receiveSocketMessage);
    return () => socket.off("receive_message", receiveSocketMessage);
  }, [socket, receiveSocketMessage]);

  return {
    messages,
    sendMessage,
    sendFile,
    deleteMessage,
    editMessage,
  };
};

export default useMessages;
