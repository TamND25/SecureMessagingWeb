import { io } from "socket.io-client";
const API = import.meta.env.REACT_APP_API_URL;

const token = localStorage.getItem("token");

const socket = io(API, {
  auth: {
    token,
  },
  transports: ["websocket"],
  autoConnect: false,
});

export default socket;
