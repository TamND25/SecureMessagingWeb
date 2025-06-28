import React, { useRef, useEffect } from "react";
import MessageItem from "../Message/MessageItem";
import styles from "./MessageList.module.scss";

const MessageList = ({ messages, loggedInUserId, onDelete, onEdit, openDropdownId, setOpenDropdownId }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setOpenDropdownId(null);
    const current = containerRef.current;
    current?.addEventListener("scroll", handleScroll);
    return () => current?.removeEventListener("scroll", handleScroll);
  }, [setOpenDropdownId]);

  return (
    <div ref={containerRef} className={styles.messages}>
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isSender={message.senderId === loggedInUserId}
          onDelete={onDelete}
          onEdit={onEdit}
          openDropdownId={openDropdownId}
          setOpenDropdownId={setOpenDropdownId}
        />
      ))}
    </div>
  );
};

export default MessageList;
