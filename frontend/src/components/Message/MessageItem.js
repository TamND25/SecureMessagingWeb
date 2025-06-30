import React, { useState, useRef, useEffect } from "react";
import styles from "./MessageItem.module.scss";
import useDecryptedMessage from "../../hooks/useDecryptedMessage";

const MessageItem = ({
  message,
  isSender,
  onDelete,
  onEdit,
  openDropdownId,
  setOpenDropdownId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState("");
  const [showTimerInput, setShowTimerInput] = useState(false);
  const [minutes, setMinutes] = useState("");
  const timerRef = useRef(null);

  const isMenuOpen = openDropdownId === message.id;
  const { content, error } = useDecryptedMessage(message, isSender);

  useEffect(() => {
    setText(content || error || "");
  }, [content, error]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleEditConfirm = () => {
    onEdit(message.id, text);
    setIsEditing(false);
  };

  const handleSetTimer = () => {
    const parsedMinutes = parseFloat(minutes);
    if (!isNaN(parsedMinutes) && parsedMinutes > 0) {
      const seconds = parsedMinutes * 60;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onDelete(message.id, true);
      }, seconds * 1000);
      setShowTimerInput(false);
      setOpenDropdownId(null);
      setMinutes("");
    }
  };

  const renderFilePreview = (url, mimeType) => {
    if (!url) return <span>[No preview]</span>;
    if (!mimeType) return <a href={url}>Download File</a>;

    if (mimeType.startsWith("image/")) {
      return <img src={url} alt="File preview" className={styles.previewImage} />;
    }

    if (mimeType.startsWith("video/")) {
      return (
        <video controls className={styles.previewVideo}>
          <source src={url} type={mimeType} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (mimeType === "application/pdf") {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
          📄 View PDF
        </a>
      );
    }

    return (
      <a href={url} download={message.originalName || "file"} className={styles.fileLink}>
        📎 Download File
      </a>
    );
  };

  const renderBubble = () => {
    if (isEditing) {
      return (
        <>
          <input value={text} onChange={(e) => setText(e.target.value)} />
          <button onClick={handleEditConfirm}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </>
      );
    }

    if (message.type === "file") {
      return renderFilePreview(text, message.mimeType);
    }

    return <span>{text}</span>;
  };

  return (
    <div className={`${styles.messageRow} ${isSender ? styles.sentRow : styles.receivedRow}`}>
      <div className={styles.messageContainer}>
        <div className={styles.senderName}>
          {isSender ? "You" : message.senderName || "Friend"}
        </div>

        <div className={styles.messageContentWrapper}>
          {isSender && (
            <>
              <div className={styles.menuWrapper}>
                <button
                  className={styles.menuButton}
                  onClick={() => {
                    setOpenDropdownId(isMenuOpen ? null : message.id);
                    setShowTimerInput(false);
                  }}
                >
                  ⋮
                </button>
                {isMenuOpen && (
                  <div className={`${styles.dropdown} ${styles.dropdownLeft}`}>
                    <div onClick={() => setIsEditing(true)}>Edit</div>
                    <div onClick={() => onDelete(message.id, true)}>Delete for Everyone</div>
                    <div onClick={() => setShowTimerInput((prev) => !prev)}>Self-destruct...</div>
                    {showTimerInput && (
                      <div className={styles.timerInput}>
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={minutes}
                          onChange={(e) => setMinutes(e.target.value)}
                          placeholder="Minutes"
                        />
                        <button onClick={handleSetTimer}>Start</button>
                      </div>
                    )}
                    <div onClick={() => onDelete(message.id, false)}>Hide for Me</div>
                  </div>
                )}
              </div>
              <div className={`${styles.bubble} ${styles.sent}`}>{renderBubble()}</div>
            </>
          )}

          {!isSender && (
            <>
              <div className={`${styles.bubble} ${styles.received}`}>{renderBubble()}</div>
              <div className={styles.menuWrapper}>
                <button
                  className={styles.menuButton}
                  onClick={() => {
                    setOpenDropdownId(isMenuOpen ? null : message.id);
                    setShowTimerInput(false);
                  }}
                >
                  ⋮
                </button>
                {isMenuOpen && (
                  <div className={`${styles.dropdown} ${styles.dropdownRight}`}>
                    <div onClick={() => onDelete(message.id, false)}>Hide for Me</div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
