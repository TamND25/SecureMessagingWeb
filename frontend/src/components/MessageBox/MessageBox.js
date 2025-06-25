import React, { useState, useRef } from "react";
import styles from "./MessageBox.module.scss";
import useMessages from "../../hooks/useMessages";
import MessageList from "./MessageList";
import { FaPaperclip } from "react-icons/fa";

const MAX_FILE_SIZE_MB = 5;

const MessageBox = ({ user, socket, loggedInUserId }) => {
  const [newMessage, setNewMessage] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const fileInputRef = useRef(null);

  const { messages, sendMessage, sendFile, deleteMessage, editMessage } = useMessages({
    selectedUser: user,
    loggedInUserId,
    socket,
  });

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File size exceeds ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    sendFile(file);
  };

  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>
        Chatting with <strong>{user.username}</strong>
      </div>

      <MessageList
        messages={messages}
        loggedInUserId={loggedInUserId}
        onDelete={deleteMessage}
        onEdit={editMessage}
        openDropdownId={openDropdownId}
        setOpenDropdownId={setOpenDropdownId}
      />

      <div className={styles.inputArea}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button
          className={styles.fileButton}
          onClick={() => fileInputRef.current.click()}
        >
          <FaPaperclip />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default MessageBox;
