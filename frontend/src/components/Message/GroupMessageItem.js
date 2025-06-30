import React, { useState, useEffect, useRef } from "react";
import styles from "./GroupMessageItem.module.scss";
import { decryptMessage, base64ToArrayBuffer } from "../../utils/secureClient";

const GroupMessageItem = ({
  message,
  groupAESKey,
  loggedInUserId,
  onDelete,
  onEdit,
  openDropdownId,
  setOpenDropdownId,
}) => {
  const [text, setText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showTimerInput, setShowTimerInput] = useState(false);
  const [minutes, setMinutes] = useState("");
  const timerRef = useRef(null);

  const isSender = message.senderId === loggedInUserId;
  const isMenuOpen = openDropdownId === message.id;

    useEffect(() => {
        if (!groupAESKey) return;

        let isCancelled = false;

        const decrypt = async () => {
            try {
            setText("");
            if (message.type === "text") {
                const decrypted = await decryptMessage(groupAESKey, message.content, message.iv);
                if (!isCancelled) setText(decrypted);
            } else if (message.type === "file") {
                const filePath = message.content.startsWith("/uploads/")
                    ? message.content
                    : `/uploads/${message.content}`;
                const ivBytes = base64ToArrayBuffer(message.iv);

                const response = await fetch(`http://localhost:5000${filePath}`);
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);

                const encryptedBuffer = await response.arrayBuffer();

                const decryptedBuffer = await window.crypto.subtle.decrypt(
                {
                    name: "AES-GCM",
                    iv: ivBytes,
                },
                groupAESKey,
                encryptedBuffer
                );

                const blob = new Blob([decryptedBuffer], { type: message.mimeType });
                const url = URL.createObjectURL(blob);
                if (!isCancelled) setText(url);
            }
            } catch (err) {
                console.error("Actual decrypt error:", err);
                if (!isCancelled) setText("[Unable to decrypt]");
            }
        };

        decrypt();

        return () => {
            if (text?.startsWith?.("blob:")) {
            URL.revokeObjectURL(text);
            }
        };
    }, [message, groupAESKey, text]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSetTimer = () => {
    const parsed = parseFloat(minutes);
    if (!isNaN(parsed) && parsed > 0) {
      timerRef.current = setTimeout(() => onDelete(message.id, true), parsed * 60 * 1000);
      setShowTimerInput(false);
      setOpenDropdownId(null);
      setMinutes("");
    }
  };

  const handleEditConfirm = () => {
    onEdit(message.id, text);
    setIsEditing(false);
  };

  const renderFilePreview = () => {
    if (!text || text === "[Unable to decrypt]") {
        return <span>[Unable to decrypt]</span>;
    }

    if (message.mimeType?.startsWith("image/")) {
      return <img src={text} alt="File preview" className={styles.previewImage} />;
    }

    if (message.mimeType?.startsWith("video/")) {
      return (
        <video controls className={styles.previewVideo}>
          <source src={text} type={message.mimeType} />
          Your browser does not support the video tag.
        </video>
      );
    }

    if (message.mimeType === "application/pdf") {
      return (
        <a href={text} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
          View PDF
        </a>
      );
    }

    return (
      <a href={text} download={message.originalName || "file"} className={styles.fileLink}>
        {message.originalName || "Download File"}
      </a>
    );
  };

  const renderBubble = () => {
    if (isEditing && message.type === "text") {
      return (
        <>
          <input value={text} onChange={(e) => setText(e.target.value)} />
          <button onClick={handleEditConfirm}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </>
      );
    }

    return message.type === "file" ? renderFilePreview() : <span>{text}</span>;
  };

  const renderDropdown = () => {
    if (!isMenuOpen) return null;

    if (isSender) {
      return (
        <div className={`${styles.dropdown} ${styles.dropdownLeft}`}>
          {message.type === "text" && <div onClick={() => setIsEditing(true)}>Edit</div>}
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
      );
    }

    return (
      <div className={`${styles.dropdown} ${styles.dropdownRight}`}>
        <div onClick={() => onDelete(message.id, false)}>Hide for Me</div>
      </div>
    );
  };

  return (
    <div className={`${styles.messageRow} ${isSender ? styles.sentRow : styles.receivedRow}`}>
      <div className={styles.messageContainer}>
        <div className={styles.senderName}>{isSender ? "You" : message.senderName || "Member"}</div>
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
                {renderDropdown()}
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
                {renderDropdown()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupMessageItem;
