import React, { useState, useRef, useEffect } from "react";
import styles from "./GroupRow.module.scss";

const GroupRow = ({ group, isSelected, onClick, onLeave }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRowClick = (e) => {
    if (!dropdownRef.current || !dropdownRef.current.contains(e.target)) {
      onClick?.();
    }
  };

  const handleLeave = async (e) => {
    e.stopPropagation();
    try {
      await onLeave?.(group.id);
    } catch (err) {
      console.error("Failed to leave group:", err);
    }
  };

  return (
    <div
      className={`${styles.groupRow} ${isSelected ? styles.selected : ""}`}
      onClick={handleRowClick}
    >
      <div className={styles.info}>
        <span className={styles.name}>{group.name}</span>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.dropdownButton}
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown((prev) => !prev);
          }}
        >
          &#x22EE; {}
        </button>

        {showDropdown && (
          <div className={styles.dropdown} ref={dropdownRef}>
            <button className={styles.leave} onClick={handleLeave}>
              Leave Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupRow;
