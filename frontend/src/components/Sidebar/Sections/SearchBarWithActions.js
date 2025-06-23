import React from "react";
import styles from "./SearchBarWithActions.module.scss";

const SearchBarWithActions = ({
  inputValue,
  setInputValue,
  activeTab,
  handleAddFriend,
  handleCreateGroup,
}) => (
  <div className={styles.header}>
    <input
      type="text"
      placeholder={activeTab === "contacts" ? "Username to add/search" : "Search"}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      className={styles.search}
    />
    {activeTab === "contacts" && (
      <div className={styles.actions}>
        <button onClick={handleAddFriend}>Add Friend</button>
        <button onClick={handleCreateGroup}>Create Group</button>
      </div>
    )}
  </div>
);

export default SearchBarWithActions;
