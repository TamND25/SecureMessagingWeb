import React from "react";
import styles from "./BlockedUsersSection.module.scss";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import UserRow from "./UserRow";

const BlockedUsersSection = ({ expanded, toggle, blockedUsers = [], onSelectUser, onUnblock }) => (
  <div className={styles.section}>
    <div className={styles.sectionHeader} onClick={toggle}>
      {expanded ? <FaChevronDown /> : <FaChevronRight />} Blocked Users
    </div>
    {expanded &&
      blockedUsers.map((user) => (
        <UserRow
          key={`blocked-${user.id}`}
          user={user}
          onClick={() => onSelectUser(user)}
          options={[
            { label: "Unblock", action: () => onUnblock(user) }
          ]}
        />
      ))}
  </div>
);

export default BlockedUsersSection;
