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

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={containerRef} className={styles.messages}>
      {messages
      .filter((m) => !m.deletedFor?.includes(loggedInUserId))
      .map((message) => (
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
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;
