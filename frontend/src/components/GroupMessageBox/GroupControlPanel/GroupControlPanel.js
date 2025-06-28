import React, { useState } from "react";
import styles from "./GroupControlPanel.module.scss";
import useGroupMembers from "../../../hooks/useGroupMembers";
import GroupMemberList from "./GroupMemberList";
import GroupAddUserModal from "./GroupAddUserModal";
import axios from "axios";

const GroupControlPanel = ({ group, loggedInUserId, friends = [] }) => {
  const [showModal, setShowModal] = useState(false);
  const {
    members,
    loading,
    promoteOwner,
    demoteOwner,
    kickMember,
    fetchMembers,
  } = useGroupMembers(group?.id);

  const currentUser = Array.isArray(members)
    ? members.find((m) => m.id === loggedInUserId)
    : null;

  const isOwner = currentUser?.isOwner;

  const handleAddMembers = async (userIds) => {
    try {
      await axios.post(
        "/api/group/add-members",
        { groupId: group.id, userIds },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      await fetchMembers();
    } catch (err) {
      console.error("Error adding members:", err);
    }
  };

  const handleDeleteGroup = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this group? This cannot be undone."
    );
    if (!confirmed) return;

    try {
      await axios.delete(`/api/group/delete/${group.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete group:", err);
    }
  };

  const availableFriends =
    Array.isArray(friends) && Array.isArray(members)
      ? friends.filter((f) => !members.some((m) => m.id === f.id))
      : [];

  return (
    <div className={styles.panel}>
      <h3>Group Members</h3>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <GroupMemberList
          members={members}
          promoteOwner={promoteOwner}
          demoteOwner={demoteOwner}
          kickMember={kickMember}
          loggedInUserId={loggedInUserId}
        />
      )}

      {isOwner && (
        <>
          <button
            onClick={() => setShowModal(true)}
            className={styles.actionBtn}
          >
            Add Members
          </button>
          <button onClick={handleDeleteGroup} className={styles.deleteBtn}>
            Delete Group
          </button>
        </>
      )}

      {showModal && (
        <GroupAddUserModal
          friends={availableFriends}
          onAddUsers={handleAddMembers}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default GroupControlPanel;
