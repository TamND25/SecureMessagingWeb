import axios from "axios";

export const softDeleteMessage = (id, token) =>
  axios.delete(`/api/message/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const hardDeleteMessage = (id, token) =>
  axios.delete(`/api/message/${id}?permanent=true`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const editMessage = (id, newText, token) =>
  axios.put(
    `/api/message/${id}/edit`,
    { content: newText },
    { headers: { Authorization: `Bearer ${token}` } }
  );
