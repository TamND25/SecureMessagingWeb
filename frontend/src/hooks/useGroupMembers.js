import { useState, useEffect } from "react";
import axios from "axios";

const useGroupMembers = (groupId) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchMembers = async () => {
    try {
      const res = await axios.get(`/api/group/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch group members:", err);
    } finally {
      setLoading(false);
    }
  };

  const promoteOwner = async (userId) => {
    await axios.post(
      `/api/group/promote`,
      { groupId, userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await fetchMembers();
  };

  const demoteOwner = async (userId) => {
    await axios.post(
      `/api/group/demote`,
      { groupId, userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await fetchMembers();
  };

  const kickMember = async (userId) => {
    await axios.post(
      `/api/group/kick`,
      { groupId, targetUserId: userId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    await fetchMembers();
  };

  useEffect(() => {
    if (groupId) fetchMembers();
  }, [groupId]);

  return {
    members,
    loading,
    fetchMembers,
    promoteOwner,
    demoteOwner,
    kickMember,
  };
};

export default useGroupMembers;
