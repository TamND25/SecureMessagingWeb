import React, { useState } from "react";
import styles from "./MessageBox.module.scss";
import useMessages from "../../hooks/useMessages";
import MessageList from "./MessageList";

const MessageBox = ({ user, socket, loggedInUserId }) => {
  const [newMessage, setNewMessage] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const { messages, sendMessage, deleteMessage, editMessage } = useMessages({
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
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default MessageBox;
