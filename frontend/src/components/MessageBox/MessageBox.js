import React, { useState } from "react";
import styles from "./MessageBox.module.scss";

const MessageBox = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const newMsg = {
      text: newMessage,
      sender: "me",
      timestamp: new Date().toISOString(),
    };
    setMessages([...messages, newMsg]);
    setNewMessage("");

  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>
        Chatting with <strong>{user.name}</strong>
      </div>

      <div className={styles.messages}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.message} ${
              msg.sender === "me" ? styles.sent : styles.received
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default MessageBox;