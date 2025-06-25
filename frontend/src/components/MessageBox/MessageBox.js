import React, { useState } from "react";
import styles from "./MessageBox.module.scss";
import useMessages from "../../hooks/useMessages";
import MessageList from "./MessageList";
import SendBar from "./SendBar";

const MessageBox = ({ user, socket, loggedInUserId }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);

  const {
    messages,
    sendMessage,
    sendFile,
    deleteMessage,
    editMessage,
  } = useMessages({
    selectedUser: user,
    loggedInUserId,
    socket,
  });

  return (
    <div className={styles.chatWindow}>
      <div className={styles.header}>
        Chatting with <strong>{user.username}</strong>
      </div>

      <div className={styles.messages}>
        <MessageList
          messages={messages}
          loggedInUserId={loggedInUserId}
          onDelete={deleteMessage}
          onEdit={editMessage}
          openDropdownId={openDropdownId}
          setOpenDropdownId={setOpenDropdownId}
        />
      </div>

      <SendBar sendMessage={sendMessage} sendFile={sendFile} />
    </div>
  );
};

export default MessageBox;
