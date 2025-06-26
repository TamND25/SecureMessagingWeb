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
      setMessages(res.data || []);
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

      const aesKey = await generateAESKey();
      const { ciphertext, iv } = await encryptMessage(aesKey, text);

      if (!ciphertext || !iv) {
        throw new Error("Encryption failed — missing ciphertext or IV");
      }

      const encryptedKey = await encryptAESKeyWithPublicKey(aesKey, recipientPublicKey);

      if (!encryptedKey) {
        throw new Error("AES key encryption failed");
      }

      const payload = {
        receiverId: selectedUser.id,
        content: ciphertext,
        iv,
        encryptedKey,
        type: "text",
      };

      console.log("Sending secure message payload:", payload);

      const res = await axios.post("/api/secure/sendMessage", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Recipient's public key (Base64):", recipientPublicKeyB64);

      const newMsg = res.data;
      const localCopy = {
        ...newMsg,
        content: text,  
        iv, 
        encryptedKey, 
      };
      socket.emit("send_message", newMsg);
      setMessages((prev) => [...prev, localCopy]);
    } catch (err) {
      console.error("Secure send failed:", err);
    }
  };

  const sendFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("receiverId", selectedUser.id);

    try {
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
      console.error("Failed to send file:", err);
    }
  };

  const receiveSocketMessage = useCallback((msg) => {
    const isRelevant =
      (msg.senderId === selectedUser.id && msg.receiverId === loggedInUserId) ||
      (msg.senderId === loggedInUserId && msg.receiverId === selectedUser.id);
    if (isRelevant) {
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
      const res = await editMessageApi(id, newText, token);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...res.data } : m))
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
