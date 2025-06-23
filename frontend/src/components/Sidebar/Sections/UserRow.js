import React, { useState } from "react";
import styles from "./UserRow.module.scss";

const UserRow = ({ user, onClick, options = [] }) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div className={styles.userRow}>
      <div className={styles.userInfo} onClick={onClick}>
        {user.username}
      </div>
      {options.length > 0 && (
        <div className={styles.optionsWrapper}>
          <button onClick={() => setShowOptions(prev => !prev)}>⋮</button>
          {showOptions && (
            <div className={styles.dropdown}>
              {options.map(opt => (
                <div key={opt.label} onClick={opt.action} className={styles.dropdownItem}>
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserRow;
