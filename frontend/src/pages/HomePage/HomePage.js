import React, { useState , useEffect } from 'react';
import socket from '../../socket.js'; 
import styles from './HomePage.module.scss';
import Navbar from '../../components/NavBar/NavBar.js';
import Sidebar from '../../components/Sidebar/Sidebar.js';
import MessageBox from '../../components/MessageBox/MessageBox.js';
import GroupMessageBox from '../../components/GroupMessageBox/GroupMessageBox.js';
import useAuthCheck from '../../hooks/useAuthCheck.js';
import useFriendData from '../../hooks/useFriendData.js';

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  useAuthCheck();

  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  const {
    users,
    requests,
    blockedUsers,
    loggedInUserId,
    inputValue,
    setInputValue,
    message,
    messageType,
    expandedSections,
    toggleSection,
    handleAddFriend,
    handleAccept,
    handleDecline,
    handleUnfriend,
    handleBlock,
    handleUnblock,
    getLatestMessageTime,
  } = useFriendData();

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.wrapper}>
        <Sidebar
          friends={users}
          blockedUsers={blockedUsers}
          requests={requests}
          loggedInUserId={loggedInUserId}
          onCreateGroup={() => {}}
          onSelectUser={setSelectedUser}
          setSelectedGroup={setSelectedGroup}
          selectedGroup={selectedGroup}
          handleAccept={handleAccept}
          handleDecline={handleDecline}
          handleAddFriend={handleAddFriend}
          handleBlock={handleBlock}
          handleUnblock={handleUnblock}
          handleUnfriend={handleUnfriend}
          inputValue={inputValue}
          setInputValue={setInputValue}
          message={message}
          messageType={messageType}
          expandedSections={expandedSections}
          toggleSection={toggleSection}
          getLatestMessageTime={getLatestMessageTime}
        />
        <div className={styles.chatArea}>
          {selectedGroup ? (
            <GroupMessageBox group={selectedGroup} socket={socket} loggedInUserId={loggedInUserId} />
            
          ) : selectedUser ? (
            <MessageBox user={selectedUser} socket={socket} loggedInUserId={loggedInUserId} />
          ) : (
            <div className={styles.placeholder}>Select a user or group to start chatting</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
