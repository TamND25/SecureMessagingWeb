import { useEffect, useState, useCallback } from "react";
import axios from "axios";

import {
  softDeleteMessage,
  hardDeleteMessage,
  editMessage as editMessageApi,
} from "../services/messageApi";

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
      const res = await axios.post(
        "/api/message/send",
        {
          receiverId: selectedUser.id,
          content: text,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newMsg = res.data;
      socket.emit("send_message", newMsg);
      setMessages((prev) => [...prev, newMsg]);
    } catch (err) {
      console.error("Sending message failed:", err);
    }
  };

  const receiveSocketMessage = useCallback((msg) => {
    const isRelevant =
      (msg.senderId === selectedUser.id &&
        msg.receiverId === loggedInUserId) ||
      (msg.senderId === loggedInUserId &&
        msg.receiverId === selectedUser.id);
    if (isRelevant) {
      setMessages((prev) => [...prev, msg]);
    }
  }, [selectedUser, loggedInUserId]);

  const deleteMessage = async (id, hard = false) => {
    try {
      if (hard) {
        await hardDeleteMessage(id);
      } else {
        await softDeleteMessage(id);
      }
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const editMessage = async (id, newText) => {
    try {
      await editMessageApi(id, newText);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, content: newText, isEdited: true } : m))
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
    deleteMessage,
    editMessage,
  };
};

export default useMessages;
