import { useEffect, useState } from "react";
import axios from "axios";
import {
  generateAESKey,
  encryptAESKeyWithPublicKey,
  importPublicKey,
} from "../utils/secureClient";

const useGroupChat = () => {
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/group/my-groups", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGroups(res.data || []);
      return res.data || [];
    } catch (err) {
      console.error("Failed to fetch groups:", err);
      setGroups([]);
      return [];
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const createGroup = async (groupName, selectedUserIds, loggedInUserId) => {
    if (!groupName || selectedUserIds.length < 2) {
      throw new Error("Group must include at least 3 users including creator");
    }

    try {
      const token = localStorage.getItem("token");
      const groupAESKey = await generateAESKey();
      const allUserIds = [...new Set([...selectedUserIds, loggedInUserId])];
      const groupKeyMap = {};

      for (const userId of allUserIds) {
        if (!userId) {
          console.warn("Missing user ID:", userId);
          continue;
        }

        const res = await axios.get(`/api/secure/getUserKey/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const publicKey = await importPublicKey(res.data.publicKey);
        const encryptedKey = await encryptAESKeyWithPublicKey(groupAESKey, publicKey);
        groupKeyMap[userId] = encryptedKey;
      }

      const res = await axios.post(
        "/api/group/createGroup",
        {
          name: groupName,
          memberIds: selectedUserIds,
          groupKeyMap,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      await fetchGroups();
      return res.data;
    } catch (err) {
      console.error("Group creation failed:", err);
      throw err;
    }
  };

  const leaveGroup = async (groupId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/group/leave/${groupId}`,
        { },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      await fetchGroups();
    } catch (err) {
      console.error("Failed to leave group:", err);
      throw err;
    }
  };

  return {
    groups,
    loadingGroups,
    fetchGroups,
    createGroup,
    leaveGroup,
    setGroups,
  };
};

export default useGroupChat;
