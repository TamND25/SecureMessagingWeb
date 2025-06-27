import React, { useState } from "react";
import styles from "./CreateGroupModal.module.scss";
import useGroupChat from "../../../../hooks/useGroupChat";

const CreateGroupModal = ({ friends, loggedInUserId, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState([]);
  const [search, setSearch] = useState("");
  const { createGroup } = useGroupChat();

  const handleToggleFriend = (id) => {
    setSelectedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!groupName.trim() || selectedFriendIds.length < 2) {
      alert("Group name and at least 2 members are required.");
      return;
    }

    try {
      await createGroup(groupName.trim(), selectedFriendIds, loggedInUserId);
      alert("Group created successfully!");
      setGroupName("");
      setSelectedFriendIds([]);
      onClose();
    } catch (err) {
      alert("Failed to create group. Check console for details.");
      console.error("Group creation error:", err);
    }
  };

  const filteredFriends = friends.filter((friend) =>
    friend.username.toLowerCase().includes(search.toLowerCase())
  );

  const selectedMembers = friends.filter((friend) =>
    selectedFriendIds.includes(friend.id)
  );

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <span>Create Group</span>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <input
          type="text"
          placeholder="Group name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Search friends..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className={styles.friendList}>
          {filteredFriends.map((friend) => (
            <div className={styles.friendItem} key={friend.id}>
              <input
                type="checkbox"
                checked={selectedFriendIds.includes(friend.id)}
                onChange={() => handleToggleFriend(friend.id)}
              />
              <span>{friend.username}</span>
            </div>
          ))}
        </div>

        {selectedMembers.length > 0 && (
          <div>
            <strong>Selected Members:</strong>
            <ul>
              {selectedMembers.map((member) => (
                <li key={member.id}>{member.username}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.createButton}
            onClick={handleSubmit}
            disabled={!groupName.trim() || selectedFriendIds.length < 2}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
// This component allows users to create a group chat by selecting friends and entering a group name.