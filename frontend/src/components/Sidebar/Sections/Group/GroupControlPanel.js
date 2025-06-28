import React from "react";
import styles from "./GroupControlPanel.module.scss";

const GroupControlPanel = ({ group, isOwner, onAddUser, onShareOwnership, onKickUser, onDeleteGroup }) => {
  return (
    <div className={styles.panel}>
      <h4>{group.name} - Control</h4>
      <button onClick={onAddUser}>Add User</button>
      {isOwner && (
        <>
          <button onClick={onShareOwnership}>Share Ownership</button>
          <button onClick={onKickUser}>Kick User</button>
          <button className={styles.delete} onClick={onDeleteGroup}>
            Delete Group
          </button>
        </>
      )}
    </div>
  );
};

export default GroupControlPanel;
