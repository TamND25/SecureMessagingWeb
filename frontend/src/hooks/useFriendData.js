import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const useFriendData = () => {
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [expandedSections, setExpandedSections] = useState({
    requests: true,
    current: true,
    blocked: false,
  });

  const token = localStorage.getItem("token");

  const fetchAll = useCallback(async () => {
    if (!token) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };

    //   const messagedRes = await Promise.all([
    //     axios.get("/api/user/messaged", { headers }),
    //   ]);
        const [blockedRes] = await Promise.all([
        axios.get("/api/friendship/blocked", { headers }),
      ]);


      const [acceptedRes, requestsRes] = await Promise.all([
        axios.get("/api/friendship/accepted", { headers }),
        axios.get("/api/friendship/requests", { headers })
      ]);
      setUsers(acceptedRes.data);
      setRequests(requestsRes.data);
      setBlockedUsers(blockedRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setLoggedInUserId(decoded?.id);
        fetchAll();
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  }, [token, fetchAll]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleAddFriend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !token) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(`/api/user/by-username/${trimmed}`, { headers });
      const addresseeId = res.data?.id;

      if (!addresseeId) {
        setMessage(`User "${trimmed}" not found`);
        setMessageType("error");
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      await axios.post(
        "/api/friendship/sendRequest",
        { addresseeId },
        { headers }
      );

      setMessage(`Friend request sent to ${trimmed}`);
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
      setInputValue("");
      await fetchAll();
    } catch (err) {
      console.error("Error sending friend request:", err);
      const serverMessage = err.response?.data?.error;

      if (serverMessage === "You have blocked this user") {
        setMessage(`You have blocked ${trimmed}. Unblock to add as friend.`);
        setTimeout(() => setMessage(""), 3000);
      } else if (serverMessage === "You are blocked by this user") {
        setMessage(`Cannot send friend request. ${trimmed} has blocked you.`);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(serverMessage || "Failed to send friend request");
        setTimeout(() => setMessage(""), 3000);
      }

      setMessageType("error");
    }
  };

  const handleAccept = async (user) => {
    if (!token || !user?.id) return;

    try {
      await axios.post(
        "/api/friendship/accept",
        { requesterId: user.id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(`Accepted ${user.username}'s request`);
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
      await fetchAll();
    } catch (err) {
      console.error("Error accepting request:", err);
      setMessage(err.response?.data?.error || "Failed to accept request");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleDecline = async (user) => {
    if (!token || !user?.id) return;

    try {
      await axios.post(
        "/api/friendship/decline",
        { requesterId: user.id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(`Declined ${user.username}'s request`);
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      await fetchAll();
    } catch (err) {
      console.error("Error declining request:", err);
      setMessage(err.response?.data?.error || "Failed to decline request");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const getLatestMessageTime = (user) => {
    return user.lastMessageTime || "2024-01-01T00:00:00Z";
  };

  const handleUnfriend = async (user) => {
    if (!token || !user?.id) return;

    try {
      await axios.post(
        "/api/friendship/unfriend",
        { friendId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`Unfriended ${user.username}`);
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      await fetchAll();
    } catch (err) {
      console.error("Error unfriending:", err);
      setMessage(err.response?.data?.error || "Failed to unfriend");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleBlock = async (user) => {
    if (!token || !user?.id) return;

    try {
      await axios.post(
        "/api/friendship/block",
        { blockedId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`Blocked ${user.username}`);
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
      await fetchAll();
    } catch (err) {
      console.error("Error blocking:", err);
      setMessage(err.response?.data?.error || "Failed to block");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleUnblock = async (user) => {
    if (!token || !user?.id) return;

    try {
      await axios.post(
        "/api/friendship/unblock",
        { blockedId: user.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`Unblocked ${user.username}`);
      setMessageType("success");
      setTimeout(() => setMessage(""), 3000);
      await fetchAll();
    } catch (err) {
      console.error("Error unblocking:", err);
      setMessage(err.response?.data?.error || "Failed to unblock");
      setMessageType("error");
      setTimeout(() => setMessage(""), 3000);
    }
  };


  return {
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
  };
};

export default useFriendData;
