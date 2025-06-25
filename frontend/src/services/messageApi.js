import axios from "axios";

export const softDeleteMessage = (id) => axios.post(`/api/message/${id}/soft-delete`);
export const hardDeleteMessage = (id) => axios.delete(`/api/message/${id}`);
export const editMessage = (id, newContent) =>
  axios.put(`/api/message/${id}/edit`, { content: newContent });
