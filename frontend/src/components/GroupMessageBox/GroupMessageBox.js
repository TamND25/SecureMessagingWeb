import React, { useEffect, useState } from "react";
import styles from "./GroupMessageBox.module.scss";

import useFriendData from "../../hooks/useFriendData";
import useGroupMessages from "../../hooks/useGroupMessages";

import GroupControlPanel from "./GroupControlPanel/GroupControlPanel";
import GroupSendBar from "./GroupSendBar";
import GroupMessageItem from "../Message/GroupMessageItem";

const GroupMessageBox = ({ group, socket, loggedInUserId }) => {
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [showControlPanel, setShowControlPanel] = useState(true);

  const { users: friends } = useFriendData();

  const {
    messages,
    sendMessage,
    sendFile,
    loadMessages,
    deleteMessage,
    editMessage,
    groupAESKey,
  } = useGroupMessages(group.id, socket, loggedInUserId);

  useEffect(() => {
    loadMessages();
  }, [group.id]);

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
          {messages
          .filter(m => !m.hidden)
          .map((msg) => (
            <GroupMessageItem
              key={msg.id}
              message={msg}
              groupAESKey={groupAESKey}
              loggedInUserId={loggedInUserId}
              onDelete={deleteMessage}
              onEdit={editMessage}
              openDropdownId={openDropdownId}
              setOpenDropdownId={setOpenDropdownId}
            />
          ))}
        </div>

        <GroupSendBar sendMessage={sendMessage} sendFile={sendFile} />
      </div>

      {showControlPanel && (
        <GroupControlPanel
          group={group}
          loggedInUserId={loggedInUserId}
          friends={friends}
        />
      )}
    </div>
  );
};

export default GroupMessageBox;
