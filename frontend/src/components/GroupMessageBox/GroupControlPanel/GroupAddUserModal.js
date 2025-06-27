import React, { useState } from "react";
import styles from "./GroupAddUserModal.module.scss";

const AddUserModal = ({ friends, onAddUsers, onClose }) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const toggleSelection = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onAddUsers(selectedIds);
    onClose();
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modal}>
        <h3>Select users to add</h3>
        <div className={styles.userList}>
          {friends.map((friend) => (
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
          ))}
        </div>
        <div className={styles.actions}>
          <button onClick={handleConfirm}>Add</button>
          <button onClick={onClose} className={styles.cancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
