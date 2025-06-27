import { useEffect, useState } from "react";
import axios from "axios";

const useGroupMessages = (groupId, socket) => {
  const [messages, setMessages] = useState([]);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/group/messages/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to load group messages:", err);
    }
  };

  const sendMessage = async (content, file) => {
    const token = localStorage.getItem("token");
    try {
      const formData = new FormData();
      formData.append("content", content);
      if (file) formData.append("file", file);

      const res = await axios.post(`/api/group/messages/${groupId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      socket.emit("new-group-message", res.data);
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Failed to send group message:", err);
    }
  };

  return { messages, sendMessage, loadMessages };
};

export default useGroupMessages;
