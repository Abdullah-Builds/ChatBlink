import { SOCKET_EVENTS, MESSAGES } from "../config/constants.js";

let waitingUser = null;

export default function registerChatHandlers(io, socket) {
  socket.on(SOCKET_EVENTS.SET_NAME, (name) => {
    try {
      socket.data.username = name?.trim() || "Guest";
      
      if (waitingUser && waitingUser.connected) {
        const room = `${socket.id}#${waitingUser.id}`;
        
        socket.join(room);
        waitingUser.join(room);
        
        socket.data.partner = waitingUser.id;
        waitingUser.data.partner = socket.id;
        
        const connectionMessage = MESSAGES.PARTNER_CONNECTED(
          waitingUser.data.username,
          socket.data.username
        );
        
        io.to(room).emit(SOCKET_EVENTS.SYSTEM, connectionMessage);
        
        console.log(`✅ Paired users: ${waitingUser.data.username} ↔ ${socket.data.username}`);
        
        waitingUser = null;
      } else {
        waitingUser = socket;
        socket.emit(SOCKET_EVENTS.SYSTEM, MESSAGES.WAITING_FOR_PARTNER);
        console.log(`⏳ User ${socket.data.username} (${socket.id}) is waiting for a partner`);
      }
    } catch (error) {
      console.error("Error in setName handler:", error);
      socket.emit(SOCKET_EVENTS.ERROR, "Failed to set name. Please try again.");
    }
  });

  socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (msg) => {
    try {
      const partnerId = socket.data.partner;
      
      if (!partnerId) {
        socket.emit(SOCKET_EVENTS.ERROR, "No partner connected.");
        return;
      }
      
      if (!msg || typeof msg !== "string" || msg.trim().length === 0) {
        socket.emit(SOCKET_EVENTS.ERROR, "Invalid message.");
        return;
      }
      
      io.to(partnerId).emit(SOCKET_EVENTS.CHAT_MESSAGE, {
        text: msg.trim(),
        timestamp: new Date().toISOString(),
      });
      
      console.log(`💬 Message from ${socket.data.username} to partner ${partnerId}`);
    } catch (error) {
      console.error("Error in chatMessage handler:", error);
      socket.emit(SOCKET_EVENTS.ERROR, "Failed to send message. Please try again.");
    }
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    try {
      if (waitingUser && waitingUser.id === socket.id) {
        waitingUser = null;
        console.log(`⚠️ Waiting user ${socket.id} disconnected`);
      }

      const partnerId = socket.data.partner;
      if (partnerId) {
        const partnerSocket = io.sockets.sockets.get(partnerId);
        
        if (partnerSocket && partnerSocket.connected) {
          const disconnectMessage = MESSAGES.PARTNER_LEFT(socket.data.username);
          partnerSocket.emit(SOCKET_EVENTS.SYSTEM, disconnectMessage);
          
          partnerSocket.data.partner = null;
          
          if (!waitingUser) {
            waitingUser = partnerSocket;
            partnerSocket.emit(SOCKET_EVENTS.SYSTEM, MESSAGES.WAITING_FOR_PARTNER);
          } else {
            partnerSocket.emit(SOCKET_EVENTS.SYSTEM, "Please refresh to wait again.");
          }
        }
        
        console.log(`👋 User ${socket.data.username} (${socket.id}) disconnected from partner`);
      }
    } catch (error) {
      console.error("Error in disconnect handler:", error);
    }
  });
}

