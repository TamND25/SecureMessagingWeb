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


const sendFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("/api/messages/file", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const messageRes = await axios.post(
      "/api/message/send",
      {
        receiverId: selectedUser.id,
        content: data.fileUrl,
        type: "file",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const fileMsg = messageRes.data;

    socket.emit("send_message", fileMsg);

    setMessages((prev) => [...prev, fileMsg]);
  } catch (err) {
    console.error("Failed to send file:", err.message);
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
    sendFile,
  };
};

export default useMessages;
