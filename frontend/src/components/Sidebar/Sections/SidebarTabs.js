import React from "react";
import styles from "./SidebarTabs.module.scss";

const SidebarTabs = ({ activeTab, setActiveTab }) => (
  <div className={styles.tabs}>
    <button
      className={activeTab === "messages" ? styles.activeTab : ""}
      onClick={() => setActiveTab("messages")}
    >
      Messages
    </button>
    <button
      className={activeTab === "contacts" ? styles.activeTab : ""}
      onClick={() => setActiveTab("contacts")}
    >
      Contacts
    </button>
  </div>
);

export default SidebarTabs;
