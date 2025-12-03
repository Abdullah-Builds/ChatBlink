import { SOCKET_EVENTS, ROOM_CONFIG, MESSAGES } from "../config/constants.js";

export default function registerVideoHandlers(io, socket) {
    if (!io.roomSettings) {
        io.roomSettings = {};
    }
    if (!io.waitingQueue) {
        io.waitingQueue = [];
    }

    console.log(`📹 Video handler ready for socket: ${socket.id}`);

    socket.on(SOCKET_EVENTS.CREATE, ({ room, maxPeers }) => {
        try {
            if (!room || typeof room !== "string" || room.trim().length === 0) {
                socket.emit(SOCKET_EVENTS.ERROR, "Invalid room name.");
                return;
            }

            const roomName = room.trim();
            const existing = io.sockets.adapter.rooms.get(roomName);

            if (existing) {
                socket.emit(SOCKET_EVENTS.ROOM_FULL);
                console.log(`❌ ${MESSAGES.ROOM_ALREADY_EXISTS(roomName)}`);
                return;
            }

            const maxPeersValue = Math.min(
                Math.max(parseInt(maxPeers) || ROOM_CONFIG.DEFAULT_MAX_PEERS, 2),
                ROOM_CONFIG.MAX_PEERS_LIMIT
            );

            io.roomSettings[roomName] = { maxPeers: maxPeersValue };
            socket.join(roomName);
            socket.data.room = roomName;

            console.log(`✅ ${MESSAGES.ROOM_CREATED(roomName, maxPeersValue)}`);
            socket.emit(SOCKET_EVENTS.CREATED, { room: roomName, maxPeers: maxPeersValue });
        } catch (error) {
            console.error("Error in create handler:", error);
            socket.emit(SOCKET_EVENTS.ERROR, "Failed to create room. Please try again.");
        }
    });

    socket.on(SOCKET_EVENTS.JOIN, (room) => {
        try {
            if (!room || typeof room !== "string" || room.trim().length === 0) {
                socket.emit(SOCKET_EVENTS.ERROR, "Invalid room name.");
                return;
            }

            const roomName = room.trim();
            const roomInfo = io.sockets.adapter.rooms.get(roomName);

            if (!roomInfo) {
                socket.emit(SOCKET_EVENTS.ERROR, MESSAGES.ROOM_DOES_NOT_EXIST);
                return;
            }

            const peers = roomInfo.size;
            const limit = io.roomSettings[roomName]?.maxPeers || ROOM_CONFIG.DEFAULT_MAX_PEERS;

            if (peers >= limit) {
                socket.emit(SOCKET_EVENTS.ROOM_FULL);
                console.log(`❌ ${MESSAGES.ROOM_FULL(roomName, peers, limit)}`);
                return;
            }

            socket.join(roomName);
            socket.data.room = roomName;
            socket.emit(SOCKET_EVENTS.JOINED, { room: roomName, peers });

            console.log(`👥 ${MESSAGES.USER_JOINED(socket.id, roomName, peers, limit)}`);
        } catch (error) {
            console.error("Error in join handler:", error);
            socket.emit(SOCKET_EVENTS.ERROR, "Failed to join room. Please try again.");
        }
    });

    socket.on(SOCKET_EVENTS.JOIN_RANDOM, () => {
        try {
            if (io.waitingQueue.length > 0) {
                const partner = io.waitingQueue.shift();

                if (!partner.connected) {
                    socket.emit(SOCKET_EVENTS.WAITING, MESSAGES.WAITING_FOR_PARTNER);
                    io.waitingQueue.push(socket);
                    return;
                }

                const room = `room-${socket.id}-${partner.id}`;

                socket.join(room);
                partner.join(room);
                socket.data.room = room;
                partner.data.room = room;

                socket.emit(SOCKET_EVENTS.JOINED, { room, peerId: partner.id });
                partner.emit(SOCKET_EVENTS.JOINED, { room, peerId: socket.id });

                console.log(`👥 Random pair created: ${socket.id} + ${partner.id} in "${room}"`);
            } else {
                io.waitingQueue.push(socket);
                socket.emit(SOCKET_EVENTS.WAITING, MESSAGES.WAITING_FOR_PARTNER);
                console.log(`⏳ ${socket.id} is waiting for a random partner`);
            }
        } catch (error) {
            console.error("Error in joinRandom handler:", error);
            socket.emit(SOCKET_EVENTS.ERROR, "Failed to join random room. Please try again.");
        }
    });

    socket.on(SOCKET_EVENTS.SIGNAL, ({ room, type, data }) => {
        try {
            if (!room) {
                socket.emit(SOCKET_EVENTS.ERROR, "Room not specified.");
                return;
            }

            socket.to(room).emit(SOCKET_EVENTS.SIGNAL, { type, data });
        } catch (error) {
            console.error("Error in signal handler:", error);
            socket.emit(SOCKET_EVENTS.ERROR, "Failed to send signal. Please try again.");
        }
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
        try {
            io.waitingQueue = io.waitingQueue.filter((s) => s.id !== socket.id);

            const room = socket.data.room;
            if (room) {
                socket.to(room).emit(SOCKET_EVENTS.PEER_LEFT);
                console.log(`⚠️ ${MESSAGES.USER_LEFT(socket.id, room)}`);

                const members = io.sockets.adapter.rooms.get(room);
                if (!members || members.size === 0) {
                    delete io.roomSettings[room];
                    console.log(`🧹 ${MESSAGES.ROOM_DELETED(room)}`);
                }
            }
        } catch (error) {
            console.error("Error in disconnect handler:", error);
        }
    });
}

