# Architecture Documentation

## System Overview

The Real-Time Chat Application is a full-stack web application that enables real-time text messaging and peer-to-peer video communication. The system is built using Node.js for the backend and vanilla JavaScript for the frontend, with Socket.IO for real-time communication and WebRTC for video calls.

---

## Architecture Layers

### 1. Presentation Layer (Frontend)

**Location**: `public/`

**Components**:

- `index.html` - Landing page with navigation
- `Message.html` - Chat interface
- `Video.html` - Video call interface

**Technologies**:

- HTML5
- CSS3 (Custom properties, Flexbox)
- JavaScript (ES6+)
- Bootstrap 5 (UI framework)
- Socket.IO Client

**Responsibilities**:

- User interface rendering
- User input handling
- Real-time UI updates
- WebRTC peer connection management
- Media stream handling

---

### 2. Application Layer (Backend)

**Location**: `src/`

**Components**:

#### Server (`src/server.js`)

- Express.js HTTP server
- Socket.IO server initialization
- Static file serving
- Health check endpoint
- Connection management

#### Handlers (`src/handlers/`)

**Chat Handler** (`chatHandler.js`):

- User pairing logic
- Message routing
- Disconnection handling
- Waiting queue management

**Video Handler** (`videoHandler.js`):

- Room creation and management
- WebRTC signaling
- Random pairing for video calls
- Peer connection coordination

#### Configuration (`src/config/`)

- Application constants
- Event names
- Server configuration
- RTC configuration

---

## Communication Flow

### Chat Communication Flow

```
Client A                    Server                    Client B
   |                          |                          |
   |-- setName("Alice") ----> |                          |
   |                          |-- Waiting...             |
   |                          |                          |
   |                          |<-- setName("Bob") -------|
   |                          |                          |
   |<-- Paired with Bob ------|-- Paired with Alice ---->|
   |                          |                          |
   |-- chatMessage("Hi") ---->|                          |
   |                          |-- chatMessage("Hi") ---->|
   |                          |                          |
```

### Video Communication Flow

```
Client A                    Server                    Client B
   |                          |                          |
   |-- joinRandom() --------->|                          |
   |                          |-- Waiting...             |
   |                          |                          |
   |                          |<-- joinRandom() ---------|
   |                          |                          |
   |<-- joined(room, peerId) -|-- joined(room, peerId) ->|
   |                          |                          |
   |-- signal(offer) -------->|-- signal(offer) -------->|
   |                          |                          |
   |<-- signal(answer) -------|-- signal(answer) --------|
   |                          |                          |
   |<-- signal(ice) ----------|-- signal(ice) ---------->|
   |                          |                          |
   | [P2P Connection Established]                        |
```

---

## Data Structures

### Socket Data

```javascript
socket.data = {
  username: string,
  partner: string (socket.id),
  room: string
}
```

### Room Settings

```javascript
io.roomSettings = {
  [roomName]: {
    maxPeers: number
  }
}
```

### Waiting Queue

```javascript
io.waitingQueue = [socket1, socket2, ...]
```

---

## Event System

### Socket.IO Events

#### Client → Server

- `setName` - Set user display name
- `chatMessage` - Send text message
- `create` - Create video room
- `join` - Join video room
- `joinRandom` - Join random pairing queue
- `signal` - WebRTC signaling data

#### Server → Client

- `system` - System notifications
- `chatMessage` - Incoming message
- `created` - Room created confirmation
- `joined` - Room joined confirmation
- `waiting` - Waiting for partner
- `room_full` - Room capacity reached
- `peer_left` - Peer disconnected
- `error` - Error notification
- `signal` - WebRTC signaling data

---

## WebRTC Signaling

The application uses a signaling server (Socket.IO) to exchange WebRTC offer/answer and ICE candidates between peers.

### Signaling Types

1. **offer** - Initial connection offer
2. **answer** - Response to offer
3. **ice-candidate** - Network candidate information

### STUN Server

- Google's public STUN server: `stun:stun.l.google.com:19302`
- Used for NAT traversal

---

## Security Considerations

### Current Implementation

- Input validation on server-side
- Message sanitization
- Room name validation
- Connection state validation

### Recommendations for Production

- Authentication and authorization
- Rate limiting
- Message encryption
- HTTPS/WSS for secure connections
- Content moderation
- User session management

---

## Scalability

### Current Architecture

- Single Node.js process
- In-memory data structures
- Suitable for small to medium scale

### Scaling Options

1. **Horizontal Scaling**

   - Use Redis adapter for Socket.IO
   - Load balancer for multiple server instances
   - Shared session storage
2. **Vertical Scaling**

   - Increase server resources
   - Optimize database queries (if added)
3. **Microservices**

   - Separate chat and video services
   - Independent scaling per service

---

## Error Handling

### Client-Side

- Connection status indicators
- Error message display
- Graceful degradation
- Retry mechanisms

### Server-Side

- Try-catch blocks in handlers
- Error event emission
- Logging for debugging
- Validation before processing

---

## Performance Optimizations

1. **Message Batching** - Group multiple messages
2. **Lazy Loading** - Load components on demand
3. **Connection Pooling** - Reuse connections
4. **Caching** - Cache frequently accessed data
5. **Compression** - Compress large payloads

---

## Future Enhancements

1. **Database Integration**

   - User accounts
   - Message history
   - Room persistence
2. **Advanced Features**

   - File sharing
   - Screen sharing
   - Group video calls
   - Message reactions
   - Typing indicators
3. **Infrastructure**

   - Docker containerization
   - CI/CD pipeline
   - Monitoring and logging
   - Automated testing

---

## Dependencies

### Production

- `express` - Web framework
- `socket.io` - Real-time communication

### Development

- `nodemon` - Development server

---

## Deployment Considerations

1. **Environment Variables**

   - PORT
   - CORS_ORIGIN
   - NODE_ENV
2. **Server Requirements**

   - Node.js 18+
   - Sufficient memory for concurrent connections
   - Network bandwidth for video streaming
3. **Monitoring**

   - Connection count
   - Message throughput
   - Error rates
   - Server resources
