import React, { useState } from "react";
import styles from "./Sidebar.module.scss";
import SidebarTabs from "./Sections/SidebarTabs";
import SearchBarWithActions from "./Sections/SearchBarWithActions";
import FriendRequestsSection from "./Sections/FriendRequestsSection";
import CurrentFriendsSection from "./Sections/CurrentFriendsSection";
import BlockedUsersSection from "./Sections/BlockedUsersSection";

const Sidebar = ({
  friends = [],
  blockedUsers = [],
  loggedInUserId,
  onCreateGroup,
  onSelectUser,
  requests = [],
  handleAccept,
  handleDecline,
  handleAddFriend,
  handleUnfriend,
  handleBlock,
  handleUnblock,
  inputValue = "",
  setInputValue,
  message,
  messageType = "success",
  expandedSections = {},
  toggleSection,
  getLatestMessageTime = () => new Date(),
}) => {
  const [activeTab, setActiveTab] = useState("messages");

  const filteredFriends = friends.filter((user) =>
    user.username.toLowerCase().includes(inputValue.toLowerCase())
  );

  const filteredRequests = requests.filter((user) =>
    user.username.toLowerCase().includes(inputValue.toLowerCase())
  );

  const filteredBlocked = blockedUsers.filter((user) =>
    user.username.toLowerCase().includes(inputValue.toLowerCase())
  );

  const sortedFriends = [...filteredFriends].sort((a, b) => {
    return (
      new Date(getLatestMessageTime(b)) - new Date(getLatestMessageTime(a))
    );
  });

  return (
    <div className={styles.sidebar}>
      <SidebarTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <SearchBarWithActions
        activeTab={activeTab}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleAddFriend={handleAddFriend}
        onCreateGroup={onCreateGroup}
      />

      {message && (
        <div
          className={`${styles.message} ${
            message ? styles[messageType] : styles.hidden
          }`}
        >
          {message || ''}
        </div>
      )}

      <div className={styles.userList}>
        {activeTab === "messages" && (
          <CurrentFriendsSection
            friends={sortedFriends}
            onSelectUser={onSelectUser}
            onUnfriend={handleUnfriend}
            onBlock={handleBlock}
          />
        )}

        {activeTab === "contacts" && (
          <>
            <FriendRequestsSection
              expanded={expandedSections.requests}
              toggle={() => toggleSection("requests")}
              requests={filteredRequests}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />

            <CurrentFriendsSection
              friends={filteredFriends}
              onSelectUser={onSelectUser}
              expanded={expandedSections.current}
              toggle={() => toggleSection("current")}
              onUnfriend={handleUnfriend}
              onBlock={handleBlock}
            />


            <BlockedUsersSection
              blockedUsers={filteredBlocked}
              onSelectUser={onSelectUser}
              expanded={expandedSections.blocked}
              toggle={() => toggleSection("blocked")}
              onUnblock={handleUnblock}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
