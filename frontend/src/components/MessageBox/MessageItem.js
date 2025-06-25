import React, { useState, useEffect, useRef } from "react";
import styles from "./MessageItem.module.scss";

const MessageItem = ({
  message,
  isSender,
  onDelete,
  onEdit,
  openDropdownId,
  setOpenDropdownId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(message.content);
  const [showTimerInput, setShowTimerInput] = useState(false);
  const [minutes, setMinutes] = useState("");
  const timerRef = useRef(null);

  const isMenuOpen = openDropdownId === message.id;

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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const renderFilePreview = (url) => {
    const ext = url.split(".").pop().toLowerCase();
    const fullUrl = url.startsWith("http")
      ? url
      : `http://localhost:5000${url}`;
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
      return <img src={fullUrl} alt="shared" className={styles.previewImage} />;
    }
    if (["mp4", "webm"].includes(ext)) {
      return (
        <video controls className={styles.previewVideo}>
          <source src={fullUrl} type={`video/${ext}`} />
        </video>
      );
    }
    return (
      <a
        href={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.fileLink}
      >
        📎 {url.split("/").pop()}
      </a>
    );
  };

  console.log("🔍 Message received in MessageItem:", message);
  console.log("📎 Is this a file message?", message.type === "file", "Type:", message.type);

  return (
    <div
      className={`${styles.messageRow} ${
        isSender ? styles.sentRow : styles.receivedRow
      }`}
    >
      <div className={styles.messageContainer}>
        <div className={styles.senderName}>
          {isSender ? "You" : message.senderName || "Friend"}
        </div>

        <div className={styles.messageContentWrapper}>
          {!isSender && (
            <>
              <div className={`${styles.bubble} ${styles.received}`}>
                {isEditing ? (
                  <>
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    <button onClick={handleEditConfirm}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                  </>
                ) : message.type === "file" ? (
                  renderFilePreview(message.content)
                ) : (
                  <span>{message.content}</span>
                )}
              </div>
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
                    <div onClick={() => onDelete(message.id, false)}>
                      Hide for Me
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

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
                    <div onClick={() => onDelete(message.id, true)}>
                      Delete for Everyone
                    </div>
                    <div onClick={() => setShowTimerInput((prev) => !prev)}>
                      Self-destruct...
                    </div>
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
                    <div onClick={() => onDelete(message.id, false)}>
                      Hide for Me
                    </div>
                  </div>
                )}
              </div>
              <div className={`${styles.bubble} ${styles.sent}`}>
                {isEditing ? (
                  <>
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                    />
                    <button onClick={handleEditConfirm}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                  </>
                ) : message.type === "file" ? (
                  renderFilePreview(message.content)
                ) : (
                  <span>{message.content}</span>
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
