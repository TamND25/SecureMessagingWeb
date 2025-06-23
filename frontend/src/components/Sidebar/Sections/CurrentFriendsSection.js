import React from "react";
import styles from "./CurrentFriendsSection.module.scss";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import UserRow from "./UserRow";

const CurrentFriendsSection = ({ expanded = true, toggle = () => {}, friends, onSelectUser, onUnfriend, onBlock }) => (
  <div className={styles.section}>
    <div className={styles.sectionHeader} onClick={toggle}>
      {expanded ? <FaChevronDown /> : <FaChevronRight />} Current Friends
    </div>
    {expanded &&
      friends.map((user) => (
        <UserRow
          key={`friend-${user.id}`}
          user={user}
          onClick={() => onSelectUser(user)}
          options={[
            { label: "Unfriend", action: () => onUnfriend(user) },
            { label: "Block", action: () => onBlock(user) }
          ]}
        />
      ))}
  </div>
);

export default CurrentFriendsSection;
