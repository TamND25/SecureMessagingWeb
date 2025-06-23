import React from "react";
import styles from "./FriendRequestsSection.module.scss";
import { FaChevronDown, FaChevronRight, FaCheck, FaTimes } from "react-icons/fa";

const FriendRequestsSection = ({ expanded, toggle, requests, onAccept, onDecline }) => (
  <div className={styles.section}>
    <div className={styles.sectionHeader} onClick={toggle}>
      {expanded ? <FaChevronDown /> : <FaChevronRight />} Friend Requests
      {requests.length > 0 && <span className={styles.requestCount}> ({requests.length})</span>}
    </div>

    {expanded && requests.length > 0 && (
      <div className={styles.requestsList}>
        {requests.map((user) => (
          <div key={`request-${user.id}`} className={styles.requestRow}>
            <div className={styles.requestText}>
              <strong>{user.username}</strong> sent you a friend request
            </div>
            <div className={styles.requestActions}>
              <FaCheck
                className={styles.icon}
                onClick={() => onAccept(user)}
                title="Accept"
              />
              <FaTimes
                className={styles.icon}
                onClick={() => onDecline(user)}
                title="Decline"
              />
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default FriendRequestsSection;
