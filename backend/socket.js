import { Server } from 'socket.io';

let io;
const userSockets = new Map(); // userId -> Set of socket IDs

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('getOnlineUsers', () => {
      const onlineUsersList = Array.from(userSockets.keys());
      socket.emit('onlineUsersList', onlineUsersList);
    });

    // Join a user-specific room for global notifications
    socket.on('joinUserRoom', (userId) => {
      if (!userId) return;
      socket.join(`user_${userId}`);
      socket.userId = userId;
      console.log(`User ${userId} joined their personal room`);
      
      if (!userSockets.has(userId)) {
        userSockets.set(userId, new Set());
        // Broadcast that user is online
        socket.broadcast.emit('userOnline', userId);
      }
      userSockets.get(userId).add(socket.id);
      
      // Send current list of online users to the newly connected user
      const onlineUsersList = Array.from(userSockets.keys());
      socket.emit('onlineUsersList', onlineUsersList);
    });

    // Join a specific chat room for an lead
    socket.on('joinChatRoom', (leadId) => {
      socket.join(`lead_${leadId}`);
      console.log(`Socket ${socket.id} joined lead chat ${leadId}`);
    });

    // Leave a specific chat room
    socket.on('leaveChatRoom', (leadId) => {
      socket.leave(`lead_${leadId}`);
      console.log(`Socket ${socket.id} left lead chat ${leadId}`);
    });

    // Typing events
    socket.on('typing', ({ leadId, userId }) => {
      socket.to(`lead_${leadId}`).emit('userTyping', { leadId, userId });
    });

    socket.on('stopTyping', ({ leadId, userId }) => {
      socket.to(`lead_${leadId}`).emit('userStopTyping', { leadId, userId });
    });

    socket.on('disconnect', () => {
      if (socket.userId && userSockets.has(socket.userId)) {
        const sockets = userSockets.get(socket.userId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(socket.userId);
          // Broadcast that user is offline
          io.emit('userOffline', socket.userId);
        }
      }
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized');
  }
  return io;
};
