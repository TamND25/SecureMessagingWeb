import React, { useState } from "react";
import styles from "./Sidebar.module.scss";
import SidebarTabs from "./Sections/SidebarTabs";
import SearchBarWithActions from "./Sections/SearchBarWithActions";
import FriendRequestsSection from "./Sections/Friend/FriendRequestsSection";
import CurrentFriendsSection from "./Sections/Friend/CurrentFriendsSection";
import BlockedUsersSection from "./Sections/Friend/BlockedUsersSection";
import CreateGroupModal from "./Sections/Group/CreateGroupModal";
import CurrentGroupsSection from "./Sections/Group/CurrentGroupSection";
import useGroupChat from "../../hooks/useGroupChat";

const Sidebar = ({
  friends = [],
  blockedUsers = [],
  loggedInUserId,
  onSelectUser,
  setSelectedGroup,
  selectedGroup,
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
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const { createGroup } = useGroupChat();

  const handleCreateGroup = async ({ name, memberIds }) => {
    try {
      await createGroup(name, memberIds, loggedInUserId);
      setIsGroupModalOpen(false);
    } catch (err) {
      console.error("Failed to create group:", err);
    }
  };

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

  const handleSelectGroup = (group) => {
    setSelectedGroup(group);
    onSelectUser(null);
  };

  return (
    <div className={styles.sidebar}>
      <SidebarTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <SearchBarWithActions
        activeTab={activeTab}
        inputValue={inputValue}
        setInputValue={setInputValue}
        handleAddFriend={handleAddFriend}
        handleCreateGroup={() => setIsGroupModalOpen(true)}
      />

      {message && (
        <div
          className={`${styles.message} ${
            message ? styles[messageType] : styles.hidden
          }`}
        >
          {message || ""}
        </div>
      )}

      <div className={styles.userList}>
        {activeTab === "messages" && (
          <>
            <CurrentFriendsSection
              friends={sortedFriends}
              onSelectUser={(user) => {
                onSelectUser(user);
                setSelectedGroup(null);
              }}
              onUnfriend={handleUnfriend}
              onBlock={handleBlock}
            />

            <CurrentGroupsSection
              selectedGroupId={selectedGroup?.id}
              onSelectGroup={handleSelectGroup}
            />
          </>
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

      {isGroupModalOpen && (
        <CreateGroupModal
          friends={filteredFriends || []}
          onClose={() => setIsGroupModalOpen(false)}
          onCreate={handleCreateGroup}
          loggedInUserId={loggedInUserId}
        />
      )}
    </div>
  );
};

export default Sidebar;
