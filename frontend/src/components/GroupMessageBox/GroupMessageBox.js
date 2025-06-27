import React, { useEffect, useState } from "react";
import styles from "./GroupMessageBox.module.scss";
import useGroupMessages from "../../hooks/useGroupMessages";
import MessageList from "../MessageBox/MessageList";
import SendBar from "../MessageBox/SendBar";
import GroupControlPanel from "./GroupControlPanel/GroupControlPanel";

const GroupMessageBox = ({ group, socket, loggedInUserId }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showControlPanel, setShowControlPanel] = useState(true);
  const { messages, sendMessage, sendFile, loadMessages, deleteMessage, editMessage } =
    useGroupMessages(group.id, socket);

  useEffect(() => {
    loadMessages();
  }, [group.id]);

  const handleSend = async (content, file) => {
    await sendMessage(content, file);
  };

  return (
    <div className={styles.groupChatWrapper}>
      <div className={styles.chatWindow}>
        <div className={styles.header}>
          Group: <strong>{group.name}</strong>
          <button
            className={styles.toggleBtn}
            onClick={() => setShowControlPanel((prev) => !prev)}
          >
            {showControlPanel ? "Hide Panel" : "Show Panel"}
          </button>
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

        <SendBar sendMessage={handleSend} sendFile={sendFile} />
      </div>

      {showControlPanel && (
        <GroupControlPanel group={group} loggedInUserId={loggedInUserId} />
      )}
    </div>
  );
};

export default GroupMessageBox;
