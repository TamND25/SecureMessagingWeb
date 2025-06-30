import { io } from "socket.io-client";

const token = localStorage.getItem("token");

const API_URL = process.env.REACT_APP_API_URL;

const socket = io(API_URL, {
  auth: {
    token,
  },
  transports: ["websocket"],
  autoConnect: false,
});

export default socket;
