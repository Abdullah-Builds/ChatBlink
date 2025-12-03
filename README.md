# Real-Time Chat Application

A professional, full-featured real-time chat application with video calling capabilities, built with modern web technologies. This application enables instant messaging and peer-to-peer video communication through WebRTC technology.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Core Features

- **Real-Time Messaging**: Instant one-to-one chat with Socket.IO
- **Random Pairing**: Connect with random users for anonymous chat
- **Video Calling**: Peer-to-peer video communication using WebRTC
- **Room Management**: Create and join custom chat rooms
- **User-Friendly Interface**: Modern, responsive UI with dark theme
- **Connection Status**: Real-time connection status updates
- **Media Controls**: Mute/unmute audio, toggle camera, hide/show self-view

### Technical Features

- **Scalable Architecture**: Modular code structure for easy maintenance
- **Error Handling**: Comprehensive error handling and validation
- **Security**: Input validation and sanitization
- **Cross-Platform**: Works on desktop and mobile browsers
- **Low Latency**: Optimized for real-time communication

---

## Technology Stack

### Backend

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Socket.IO** - Real-time bidirectional event-based communication

### Frontend

- **HTML5** - Markup language
- **CSS3** - Styling with modern CSS features
- **JavaScript (ES6+)** - Client-side scripting
- **Bootstrap 5** - Responsive UI framework

### Real-Time Communication

- **WebRTC** - Peer-to-peer video/audio communication
- **STUN Server** - NAT traversal for WebRTC connections

### Development Tools

- **Nodemon** - Development server with auto-reload

---

## Architecture

### System Architecture

```
┌─────────────────┐
│   Web Browser   │
│   (Client)      │
└────────┬────────┘
         │
         │ HTTP/WebSocket
         │
┌────────▼────────┐
│  Express Server │
│   (Node.js)     │
└────────┬────────┘
         │
         │ Socket.IO
         │
┌────────▼────────┐
│  Socket.IO      │
│  Event Handlers │
└─────────────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────┐
│ Chat  │ │ Video │
│Handler│ │Handler│
└───────┘ └───────┘
```

### Communication Flow

1. **Chat Flow**:

   - Client connects → Server assigns username
   - Server pairs users → Creates chat room
   - Messages exchanged via Socket.IO events
2. **Video Flow**:

   - Client requests room → Server creates/joins room
   - WebRTC signaling via Socket.IO
   - Peer-to-peer connection established
   - Media streams exchanged directly between peers

---

## Installation

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Modern web browser with WebRTC support

### Step-by-Step Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Chat_App
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Configure environment variables** (optional)

   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```
4. **Start the server**

   ```bash
   # Production mode
   npm start

   # Development mode (with auto-reload)
   npm run dev
   ```
5. **Access the application**

   - Open your browser and navigate to `http://localhost:3000`
   - The application will be ready to use!

---

## Usage

### Starting a Chat Session

1. **Open the application** in your web browser
2. **Click "Open Chat"** from the home page
3. **Enter your name** when prompted
4. **Wait for pairing** - The system will automatically pair you with another user
5. **Start chatting** - Type messages and press Enter to send

### Starting a Video Call

1. **Click "Start Video"** from the home page
2. **Click "Join Random Video"** to be paired with a random user
   - OR enter a room name and click "Join Room" to join a specific room
3. **Allow camera/microphone permissions** when prompted
4. **Control your media**:
   - **Mute/Unmute**: Toggle microphone
   - **Camera On/Off**: Toggle camera
   - **Hide My Video**: Hide/show your video preview
   - **Hang Up**: End the call

### Room Management

- **Create Room**: Enter a room name and click "Create Room"
- **Join Room**: Enter an existing room name and click "Join Room"
- **Random Pairing**: Click "Join Random Video" for automatic pairing

---

## Project Structure

```
Chat_App/
├── src/                      # Server-side source code
│   ├── config/              # Configuration files
│   │   └── constants.js     # Application constants
│   ├── handlers/            # Socket.IO event handlers
│   │   ├── chatHandler.js   # Chat functionality handlers
│   │   └── videoHandler.js  # Video call handlers
│   └── server.js            # Main server file
├── public/                   # Frontend files
│   ├── index.html           # Home page
│   ├── Message.html         # Chat interface
│   └── Video.html           # Video call interface
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── LICENSE                  # MIT License
├── package.json             # Project dependencies and scripts
└── README.md                # Project documentation
```

---

## API Documentation

### Socket.IO Events

#### Client → Server Events

| Event           | Description               | Parameters               |
| --------------- | ------------------------- | ------------------------ |
| `setName`     | Set user's display name   | `name` (string)        |
| `chatMessage` | Send a chat message       | `msg` (string)         |
| `create`      | Create a new room         | `{ room, maxPeers }`   |
| `join`        | Join an existing room     | `room` (string)        |
| `joinRandom`  | Join random pairing queue | -                        |
| `signal`      | WebRTC signaling data     | `{ room, type, data }` |

#### Server → Client Events

| Event           | Description               | Payload                                     |
| --------------- | ------------------------- | ------------------------------------------- |
| `system`      | System notification       | `message` (string)                        |
| `chatMessage` | Incoming chat message     | `{ text, timestamp }`                     |
| `created`     | Room created confirmation | `{ room, maxPeers }`                      |
| `joined`      | Room joined confirmation  | `{ room, peers }` or `{ room, peerId }` |
| `waiting`     | Waiting for partner       | `message` (string)                        |
| `room_full`   | Room is full              | -                                           |
| `peer_left`   | Peer disconnected         | -                                           |
| `error`       | Error occurred            | `message` (string)                        |
| `signal`      | WebRTC signaling data     | `{ type, data }`                          |

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
CORS_ORIGIN=*
NODE_ENV=development
```

### Server Configuration

Edit `src/config/constants.js` to modify:

- Default port
- CORS settings
- Room limits
- STUN server configuration

---

## 🔧 Development

### Running in Development Mode

```bash
npm run dev
```

This will start the server with nodemon, which automatically restarts on file changes.

### Code Structure

- **Modular Design**: Each feature is separated into its own handler module
- **Constants**: Centralized configuration in `config/constants.js`
- **Error Handling**: Comprehensive try-catch blocks and error events
- **Validation**: Input validation for all user inputs
