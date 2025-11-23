# Chillout App

A real-time chat application with a modern glassmorphism UI, allowing users to create or join chat rooms, communicate instantly with text, voice, and images, and make group audio calls. Built with modern web technologies for a seamless and engaging experience.

## Overview

Chillout App is a Next.js-based frontend application that provides a modern, sleek chat platform with real-time audio calling capabilities. Users can enter a username, specify a room ID to join an existing room or create a new one, and start chatting in real-time. The app features a contemporary glassmorphism design with flowing particle animations, smooth transitions, and Tailwind CSS.

The backend handles room management, real-time messaging, image/voice storage via MongoDB GridFS, and WebRTC signaling via Socket.io, with data persisted through a REST API.

## Tech Stack

- **Frontend Framework**: Next.js 15.5.3 (App Router)
- **UI Library**: React 19.1.0
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Real-time Communication**: Socket.io Client 4.8.1
- **WebRTC**: Native browser APIs for peer-to-peer audio
- **HTTP Client**: Axios
- **State Management**: TanStack React Query 5.90.10
- **Icons**: Lucide React
- **UI Components**: Radix UI (Dropdown Menu, Slot)
- **Theme**: next-themes for dark/light mode
- **Build Tool**: Turbopack (via Next.js)
- **Linting**: ESLint 9
- **Deployment**: Vercel (Frontend), Render (Backend)

## Features

### Messaging
- **Real-time Text Messaging**: Instant message delivery using Socket.io
- **Voice Messages**: Record and send voice messages with playback controls and waveform visualization
- **Image Sharing**: Upload and share images with preview and full-screen modal view
- **Message History**: Load previous messages when joining a room via API
- **Message Deletion**: Delete your own messages from the chat

### Communication
- **Group Audio/Video Calls**: WebRTC-based peer-to-peer calls with multiple participants
  - Join audio-only or video calls with one click
  - Mute/unmute microphone with optimized mobile touch support
  - Toggle video on/off during calls
  - Switch between front/back camera (mobile only)
  - Draggable call modal (desktop) or fullscreen (mobile)
  - Call persistence across page refreshes
  - Conference-style UI on mobile with circular participant layout
  - Optimized touch controls with `touch-manipulation` for instant response
- **Call Notifications**: In-chat notifications when users join or leave calls

### User Experience
- **Room Creation/Joining**: Enter a room ID to join or create a new room
- **User Management**: Display online users in a modal
- **Username Support**: Optional username input for personalization
- **Responsive Design**: Mobile-friendly UI with adaptive layouts and optimized touch targets
- **Modern UI Theme**: Glassmorphism design with flowing dots background, neon accents, and smooth animations
- **Dark/Light Mode**: Theme toggle with persistent preferences via ThemeProvider
  - Supports Light, Dark, and System (follows OS preference) modes
  - Theme preference saved in localStorage
  - Smooth transitions between themes
- **Smooth Animations**: Framer Motion-powered transitions and effects
- **Mobile Optimizations**: 
  - Touch-optimized buttons with instant feedback
  - Larger touch targets for better accessibility
  - Active states for visual feedback on tap

### Data Management
- **Automatic Room Cleanup**: Rooms are automatically deleted after 30 days of inactivity
- **Optimized Performance**: React Query for efficient data fetching and caching

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

3. **Set up environment variables**:

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

1. **Home Page**: Enter your username (optional) and a room ID. Click "Enter Room" to proceed.
2. **Room Page**: 
   - Chat in real-time with text, voice, and images
   - View online users by clicking the users icon
   - Join audio calls with the call button
   - Messages are displayed with smooth animations
3. **URLs**:
   - Home: `/`
   - Room: `/room/{roomId}?username={username}`

## API Endpoints

The app communicates with a backend API for room data. Key endpoints (handled via `lib/apiClient.ts`):

### REST API

- **GET /api/room/{roomId}**: Retrieves room data, including message history. Creates the room if it doesn't exist.
  - Response: `{ _id: string, roomId: string, messages: Message[] }`
  - Message: `{ username: string, message: string, type: string, createdAt: string, url?: string }`

- **POST /api/room/{roomId}/voice**: Upload a voice message
  - Body: FormData with `voice` file and `username`
  - Response: `{ url: string }`

- **POST /api/room/{roomId}/image**: Upload an image
  - Body: FormData with `image` file and `username`
  - Response: `{ url: string }`

- **GET /api/voice/{fileId}**: Retrieve a voice message file
- **GET /api/image/{fileId}**: Retrieve an image file
- **DELETE /api/message/{messageId}**: Delete a message

### Socket.io Events

**Client → Server:**
- `join_room`: Join a room with roomId and username
- `send_message`: Send a text message to the room
- `send_voice_message`: Send a voice message to the room
- `send_image_message`: Send an image message to the room
- `delete_message`: Delete a message from the room
- `join_call`: Join an audio call in the room
- `leave_call`: Leave an audio call
- `offer`, `answer`, `ice_candidate`: WebRTC signaling events

**Server → Client:**
- `receive_message`: Receive incoming messages
- `receive_voice_message`: Receive incoming voice messages
- `receive_image_message`: Receive incoming image messages
- `message_deleted`: Notification when a message is deleted
- `online_users`: Get list of online users
- `user_joined_call`: Notification when a user joins the call
- `user_left_call`: Notification when a user leaves the call
- `call_notification`: Chat notification when someone joins a call
- `call_ended_notification`: Chat notification when someone leaves a call
- `offer`, `answer`, `ice_candidate`: WebRTC signaling events

Backend URL: `https://chillout-backend-v2.onrender.com`

## Project Structure

```
chillout-frontend/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Home page for room entry
│   └── room/[roomId]/
│       └── page.tsx        # Room chat page with audio calls
├── components/
│   ├── ui/                 # Reusable UI components (Button, Input, etc.)
│   ├── CallModal.tsx       # Audio call modal with WebRTC
│   ├── CallProvider.tsx    # WebRTC and call state management
│   ├── HeaderBar.tsx       # Room header with call controls
│   ├── ImageModal.tsx      # Full-screen image viewer
│   ├── InputBar.tsx        # Message input with voice/image upload
│   ├── MessageBubble.tsx   # Message display with call notifications
│   ├── OnlineUsersModal.tsx # Modal for online users
│   ├── ReactQueryProvider.tsx # React Query setup
│   ├── SocketProvider.tsx  # Socket.io context provider
│   ├── ThemeToggle.tsx     # Dark/light mode toggle
│   └── VoiceMessagePlayer.tsx # Voice message playback
├── hooks/
│   ├── useImageUpload.ts   # Image upload logic
│   ├── useRoomData.ts      # Room data fetching
│   ├── useSocketMessages.ts # Socket message handling
│   └── useVoicePlayer.ts   # Voice recording/playback
├── lib/
│   ├── apiClient.ts        # Axios setup and API methods
│   └── utils.ts            # Utility functions
├── public/                 # Static assets (images, favicon)
├── styles/
│   └── globals.css         # Global styles and animations
└── ...
```

## Custom Hooks

The app uses custom hooks for clean separation of concerns:

- **useRoomData**: Fetches room data using React Query
- **useSocketMessages**: Handles Socket.io message events and state
- **useVoicePlayer**: Manages voice recording, playback, and upload
- **useImageUpload**: Handles image selection and upload
- **useCall**: Manages WebRTC connections and call state (via CallProvider)

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
- Uses MongoDB GridFS for efficient media storage.
