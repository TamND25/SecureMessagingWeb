import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  encryptFileWithGroupKey,
  encryptMessage,
  importPrivateKey,
  base64ToArrayBuffer,
} from "../utils/secureClient";

const useGroupMessages = (groupId, socket, loggedInUserId) => {
  const [messages, setMessages] = useState([]);
  const [groupAESKey, setGroupAESKey] = useState(null);
  const token = localStorage.getItem("token");

  const fetchGroupAESKey = useCallback(async () => {
    try {
      const privateKeyPEM = localStorage.getItem("privateKeyPEM");
      const privateKey = await importPrivateKey(privateKeyPEM);

      const res = await axios.get(`/api/secure/getGroupKeys/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const encryptedKey = res.data?.encryptedKey;
      if (!encryptedKey || typeof encryptedKey !== "string") {
        throw new Error("Missing or invalid encryptedKey");
      }

      const decryptedKey = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        base64ToArrayBuffer(encryptedKey)
      );

      const aesKey = await window.crypto.subtle.importKey(
        "raw",
        decryptedKey,
        { name: "AES-GCM" },
        true,
        ["encrypt", "decrypt"]
      );

      setGroupAESKey(aesKey);
    } catch (err) {
      console.error("Failed to fetch/decrypt group AES key:", err);
    }
  }, [groupId, token]);

  const loadMessages = useCallback(async () => {
    try {
      const res = await axios.get(`/api/group/messages/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load group messages:", err);
    }
  }, [groupId, token]);

  const sendMessage = async (text) => {
    if (!groupAESKey || !text.trim()) return;

    try {
      const { ciphertext, iv } = await encryptMessage(groupAESKey, text);

      const payload = {
        groupId,
        content: ciphertext,
        iv,
        type: "text",
      };

      const res = await axios.post(`/api/group/messages/${groupId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newMsg = res.data;
      socket.emit("send_group_message", newMsg);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      console.error("Failed to send group message:", err);
    }
  };

  const sendFile = async (file) => {
    if (!groupAESKey || !file) return;

    try {
      const {
        encryptedFile,
        iv,
        originalName,
        mimeType,
      } = await encryptFileWithGroupKey(file, groupAESKey);
      
      const secureFile = new File([encryptedFile], originalName, { type: mimeType });
      const formData = new FormData();
      formData.append("file", secureFile);  
      formData.append("iv", iv);
      formData.append("originalName", originalName);
      formData.append("mimeType", mimeType);

      const res = await axios.post(`/api/group/messages/${groupId}/file`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const newMsg = res.data.messageData;
      socket.emit("send_group_message", newMsg);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      console.error("Failed to send group file:", err);
    }
  };

  const editMessage = async (messageId, newText) => {
    try {
      if (!groupAESKey || !newText.trim()) throw new Error("Missing group AES key or text");

      const { ciphertext, iv } = await encryptMessage(groupAESKey, newText);

      await axios.put(
        `/api/group/messages/${messageId}`,
        { content: ciphertext, iv },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, content: ciphertext, iv } : msg
        )
      );
    } catch (err) {
      console.error("Edit group message failed:", err);
    }
  };

  const receiveSocketMessage = useCallback(
    (msg) => {
      if (msg.groupId === groupId) {
        setMessages((prev) => [...prev, msg]);
      }
    },
    [groupId]
  );

  const deleteMessage = async (messageId, forEveryone = true) => {
    try {
      await axios.delete(`/api/group/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { forEveryone },
      });

      if (forEveryone) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } else {
        setMessages((prev) => prev.map((m) => {
          if (m.id === messageId) {
            return { ...m, hidden: true };
          }
          return m;
        }));
      }
    } catch (err) {
      console.error("Failed to delete group message:", err);
    }
  };

  useEffect(() => {
    fetchGroupAESKey();
    loadMessages();
  }, [fetchGroupAESKey, loadMessages]);

  useEffect(() => {
    socket.on("receive_group_message", receiveSocketMessage);
    return () => socket.off("receive_group_message", receiveSocketMessage);
  }, [socket, receiveSocketMessage]);

  return {
    messages,
    sendMessage,
    sendFile,
    loadMessages,
    editMessage,
    deleteMessage,
    groupAESKey,
  };
};

export default useGroupMessages;
