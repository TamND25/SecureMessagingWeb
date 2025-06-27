import React, { useRef, useState } from "react";
import styles from "./SendBar.module.scss";
import { FaPaperclip } from "react-icons/fa";

const MAX_FILE_SIZE_MB = 5;

const SendBar = ({ sendMessage, sendFile, selectedUser }) => {
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleSend = async () => {
    if (selectedFile) {
      await handleEncryptedFileUpload(selectedFile);
      setSelectedFile(null);
    }

    if (messageText.trim()) {
      await sendMessage(messageText.trim());
      setMessageText("");
    }
  };

  const handleEncryptedFileUpload = async (file) => {
    try {
      // Let the sendFile function handle encryption + sending
      await sendFile(file);
    } catch (err) {
      console.error("Failed to encrypt and send file:", err);
      alert("File encryption failed.");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File size exceeds ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setSelectedFile(file);
  };

  return (
    <div className={styles.inputArea}>
      <input
        type="text"
        placeholder="Type a message..."
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
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

      {selectedFile && (
        <div className={styles.preview}>
          <span className={styles.fileName}>📎 {selectedFile.name}</span>
          <button
            className={styles.removeButton}
            onClick={() => setSelectedFile(null)}
          >
            ✖
          </button>
        </div>
      )}

      <button className={styles.sendButton} onClick={handleSend}>
        Send
      </button>
    </div>
  );
};

export default SendBar;
