import React, { useState } from "react";
import styles from "./GroupAddUserModal.module.scss";

const GroupAddUserModal = ({ friends, onAddUsers, onClose }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onAddUsers(selectedIds);
    onClose();
  };

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <h3>Select users to add</h3>

        <input
          type="text"
          placeholder="Search friends..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className={styles.userList}>
          {filteredFriends.length === 0 ? (
            <p className={styles.noResults}>No friends found</p>
          ) : (
            filteredFriends.map((friend) => (
              <div key={friend.id} className={styles.userItem}>
                <label>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(friend.id)}
                    onChange={() => toggleSelection(friend.id)}
                  />
                  {friend.username}
                </label>
              </div>
            ))
          )}
        </div>

        <div className={styles.actions}>
          <button onClick={handleConfirm} disabled={selectedIds.length === 0}>
            Add
          </button>
          <button onClick={onClose} className={styles.cancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupAddUserModal;
