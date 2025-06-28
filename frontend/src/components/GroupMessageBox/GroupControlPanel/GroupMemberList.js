import React, { useState } from "react";
import styles from "./GroupMemberList.module.scss";

const GroupMemberList = ({
  members,
  promoteOwner,
  demoteOwner,
  kickMember,
  loggedInUserId,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [errorText, setErrorText] = useState("");

  const handleAction = async (action, userId) => {
    try {
      if (action === "promote") await promoteOwner(userId);
      if (action === "demote") await demoteOwner(userId);
      if (action === "kick") await kickMember(userId);
    } catch (err) {
      console.error("Action failed:", err);
      setErrorText("You are not an owner to perform this action.");
      setTimeout(() => setErrorText(""), 3000);
    } finally {
      setOpenDropdown(null);
    }
  };

  return (
    <div className={styles.memberList}>
      {members.map((m) => (
        <div key={m.id} className={styles.memberRow}>
          <span>
            {m.username} {m.isOwner && <span className={styles.ownerTag}>(Owner)</span>}
          </span>

          {m.id !== loggedInUserId && (
            <div className={styles.dropdownWrapper}>
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === m.id ? null : m.id)
                }
                className={styles.dropdownBtn}
              >
                ⋮
              </button>
              {openDropdown === m.id && (
                <div className={styles.dropdownMenu}>
                  {m.isOwner ? (
                    <button onClick={() => handleAction("demote", m.id)}>
                      Remove Owner
                    </button>
                  ) : (
                    <button onClick={() => handleAction("promote", m.id)}>
                      Make Owner
                    </button>
                  )}
                  <button onClick={() => handleAction("kick", m.id)}>Kick</button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {errorText && <div className={styles.errorText}>{errorText}</div>}
    </div>
  );
};

export default GroupMemberList;
