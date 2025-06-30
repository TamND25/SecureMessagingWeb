import React, { useEffect, useState } from "react";
import GroupRow from "./GroupRow";
import styles from "./CurrentGroupSection.module.scss";
import useGroupChat from "../../../../hooks/useGroupChat";

const CurrentGroupsSection = ({ onSelectGroup, selectedGroupId }) => {
  const [groups, setGroups] = useState([]);
  const { fetchGroups, leaveGroup } = useGroupChat();

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const groupList = await fetchGroups();
        setGroups(groupList);
      } catch (err) {
        console.error("Failed to load groups:", err);
      }
    };
    loadGroups();
  }, [fetchGroups]);

  const handleLeaveGroup = async (groupId) => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        await leaveGroup(groupId);
        setGroups((prevGroups) => prevGroups.filter((g) => g.id !== groupId));
      } catch (err) {
        console.error("Error leaving group:", err);
      }
    }
  };

  return (
    <div className={styles.section}>
      <h3>Groups</h3>
      <div className={styles.groupList}>
        {groups.map((group) => (
          <GroupRow
            key={group.id}
            group={group}
            isSelected={selectedGroupId === group.id}
            onClick={() => onSelectGroup(group)}
            onLeave={handleLeaveGroup}
          />
        ))}
      </div>
    </div>
  );
};

export default CurrentGroupsSection;
