export const SERVER_CONFIG = {
  PORT: process.env.PORT || 3000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
};

export const SOCKET_EVENTS = {
  SET_NAME: "setName",
  CHAT_MESSAGE: "chatMessage",
  SYSTEM: "system",
  
  CREATE: "create",
  JOIN: "join",
  JOIN_RANDOM: "joinRandom",
  SIGNAL: "signal",
  CREATED: "created",
  JOINED: "joined",
  WAITING: "waiting",
  ROOM_FULL: "room_full",
  PEER_LEFT: "peer_left",
  ERROR: "error",
  
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
};

export const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

export const ROOM_CONFIG = {
  DEFAULT_MAX_PEERS: 2,
  MAX_PEERS_LIMIT: 10,
};

export const MESSAGES = {
  WAITING_FOR_PARTNER: "Waiting for a partner...",
  PARTNER_CONNECTED: (user1, user2) => `You are connected: ${user1} ↔ ${user2}`,
  PARTNER_LEFT: (username) => `${username || "Partner"} left.`,
  ROOM_DOES_NOT_EXIST: "Room does not exist.",
  ROOM_ALREADY_EXISTS: (room) => `Room "${room}" already exists`,
  ROOM_FULL: (room, peers, limit) => `Room "${room}" full (${peers}/${limit})`,
  ROOM_CREATED: (room, maxPeers) => `Room "${room}" created (maxPeers=${maxPeers})`,
  USER_JOINED: (socketId, room, peers, limit) => `${socketId} joined "${room}" (${peers + 1}/${limit})`,
  ROOM_DELETED: (room) => `Room "${room}" deleted`,
  USER_LEFT: (socketId, room) => `${socketId} left room "${room}"`,
};

