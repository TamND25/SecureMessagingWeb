import { io } from "socket.io-client";

const token = localStorage.getItem("token");

const socket = io({
  auth: {
    token,
  },
  transports: ["websocket"],
  autoConnect: false,
});

export default socket;
