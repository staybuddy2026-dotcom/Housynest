import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  autoConnect: true,
});

let currentRoomUser = null;

export const joinUserRoom = (userId) => {
  if (!socket.connected) {
    socket.connect();
  }
  if (currentRoomUser !== userId) {
    socket.emit('joinUserRoom', userId);
    currentRoomUser = userId;
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
  currentRoomUser = null;
};

// Also listen for reconnects to re-join the room
socket.on('connect', () => {
  if (currentRoomUser) {
    socket.emit('joinUserRoom', currentRoomUser);
  }
});

export default socket;
