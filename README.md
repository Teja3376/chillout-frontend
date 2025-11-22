# Chillout App

A real-time chat application with a modern glassmorphism UI, allowing users to create or join chat rooms, communicate instantly with friends, and make group audio calls. Built with modern web technologies for a seamless and engaging experience.

## Overview

Chillout App is a Next.js-based frontend application that provides a modern, sleek chat platform with real-time audio calling capabilities. Users can enter a username, specify a room ID to join an existing room or create a new one, and start chatting in real-time. The app features a contemporary glassmorphism design with flowing particle animations, smooth transitions powered by Framer Motion, and Tailwind CSS.

The backend handles room management, real-time messaging, and WebRTC signaling via Socket.io, with data persisted through a REST API.

## Tech Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Real-time Communication**: Socket.io Client
- **WebRTC**: Native browser APIs for peer-to-peer audio
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **UI Components**: Radix UI (Dropdown Menu, Slot)
- **Database**: Firebase (for authentication/storage)
- **Build Tool**: Turbopack (via Next.js)
- **Linting**: ESLint
- **Deployment**: Vercel (Frontend), Render (Backend)

## Features

- **Room Creation/Joining**: Enter a room ID to join or create a new room.
- **Real-time Messaging**: Instant message delivery using Socket.io.
- **Voice Messages**: Record and send voice messages with playback controls.
- **Group Audio Calls**: WebRTC-based peer-to-peer audio calls with multiple participants.
  - Join/leave calls with one click
  - Mute/unmute microphone
  - Draggable call modal (desktop) or fullscreen (mobile)
  - Call persistence across page refreshes
  - Conference-style UI on mobile with circular participant layout
- **Call Notifications**: In-chat notifications when users join or leave calls.
- **User Management**: Display online users in a modal.
- **Responsive Design**: Mobile-friendly UI with adaptive layouts.
- **Modern UI Theme**: Glassmorphism design with flowing dots background, neon accents, and smooth animations.
- **Username Support**: Optional username input for personalization.
- **Message History**: Load previous messages when joining a room via API.
- **Smooth Animations**: Framer Motion-powered transitions and effects.

## Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/your-username/chillout-frontend.git
   cd chillout-frontend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables** (if needed):

   - The app uses hardcoded URLs for the backend. For local development, update `lib/apiClient.ts` and `components/SocketProvider.tsx` to point to your local backend (e.g., `http://localhost:5000`).

4. **Run the development server**:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for production**:
   ```bash
   npm run build
   npm run start
   ```

## Usage

1. **Home Page**: Enter your username (optional) and a room ID. Click "Create / Join Room" to proceed.
2. **Room Page**: Chat in real-time. View online users by clicking the users icon. Messages are displayed with animations.
3. **URLs**:
   - Home: `/`
   - Room: `/room/{roomId}?username={username}`

## API Endpoints

The app communicates with a backend API for room data. Key endpoints (handled via `lib/apiClient.ts`):

- **GET /api/room/{roomId}**: Retrieves room data, including message history. Creates the room if it doesn't exist.
  - Response: `{ _id: string, roomId: string, messages: Message[] }`
  - Message: `{ username: string, message: string, type: string, createdAt: string }`

Socket.io events:

- `join_room`: Join a room with roomId and username.
- `send_message`: Send a message to the room.
- `receive_message`: Receive incoming messages.
- `send_voice_message`: Send a voice message to the room.
- `receive_voice_message`: Receive incoming voice messages.
- `online_users`: Get list of online users.
- `join_call`: Join an audio call in the room.
- `leave_call`: Leave an audio call.
- `user_joined_call`: Notification when a user joins the call.
- `user_left_call`: Notification when a user leaves the call.
- `call_notification`: Chat notification when someone joins a call.
- `call_ended_notification`: Chat notification when someone leaves a call.
- `offer`, `answer`, `ice_candidate`: WebRTC signaling events.

Backend URL: `https://chillout-backend-v2.onrender.com`

## Project Structure

```
chillout-frontend/
├── app/
│   ├── layout.tsx          # Root layout with SocketProvider
│   ├── page.tsx            # Home page for room entry
│   └── room/[roomId]/
│       └── page.tsx        # Room chat page with audio calls
├── components/
│   ├── ui/                 # Reusable UI components (Button, Input, etc.)
│   ├── CallModal.tsx       # Audio call modal with WebRTC
│   ├── CallProvider.tsx    # WebRTC and call state management
│   ├── HeaderBar.tsx       # Room header with call controls
│   ├── InputBar.tsx        # Message input with voice recording
│   ├── MessageBubble.tsx   # Message display with call notifications
│   ├── OnlineUsersModal.tsx # Modal for online users
│   ├── SocketProvider.tsx  # Socket.io context provider
│   ├── ThemeProvider.tsx   # Theme context provider
│   ├── ThemeToggle.tsx     # Dark/light mode toggle
│   └── VoiceMessagePlayer.tsx # Voice message playback
├── lib/
│   ├── apiClient.ts        # Axios setup and API methods
│   ├── hooks.ts            # Custom hooks for API calls
│   └── utils.ts            # Utility functions
├── public/                 # Static assets (favicon, etc.)
├── styles/
│   └── globals.css         # Global styles and animations
└── ...
```

## Deployment

- **Frontend**: Deployed on Vercel. Use `npm run build` and push to your Vercel-connected repository.
- **Backend**: Hosted on Render. Ensure the backend is running and accessible at the configured URL.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Commit changes: `git commit -m 'Add your feature'`.
4. Push to the branch: `git push origin feature/your-feature`.
5. Open a Pull Request.

## Acknowledgments

- Built with Next.js, Socket.io, WebRTC, and modern React practices.
- Designed with glassmorphism and contemporary UI principles.
