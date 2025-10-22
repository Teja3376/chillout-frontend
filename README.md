# Chillout App

A real-time chat application with a Star Wars-themed UI, allowing users to create or join chat rooms and communicate instantly with friends. Built with modern web technologies for a seamless and engaging experience.

## Overview

Chillout App is a Next.js-based frontend application that provides a fun, themed chat platform. Users can enter a username, specify a room ID to join an existing room or create a new one, and start chatting in real-time. The app features a Star Wars-inspired design with animated backgrounds, neon effects, and smooth transitions powered by GSAP and Tailwind CSS.

The backend handles room management and real-time messaging via Socket.io, with data persisted through a REST API.

## Tech Stack

- **Frontend Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: GSAP (@gsap/react), Motion
- **Real-time Communication**: Socket.io Client
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **3D Globe**: Cobe
- **Build Tool**: Turbopack (via Next.js)
- **Linting**: ESLint
- **Deployment**: Vercel (Frontend), Render (Backend)

## Features

- **Room Creation/Joining**: Enter a room ID to join or create a new room.
- **Real-time Messaging**: Instant message delivery using Socket.io.
- **User Management**: Display online users in a modal.
- **Responsive Design**: Mobile-friendly UI with adaptive layouts.
- **Star Wars Theme**: Animated starfield, laser beams, holographic grids, and neon colors.
- **Username Support**: Optional username input for personalization.
- **Message History**: Load previous messages when joining a room via API.
- **Smooth Animations**: GSAP-powered transitions and effects.

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
- `online_users`: Get list of online users.

Backend URL: `https://chillout-backend-v2.onrender.com`

## Project Structure

```
chillout-frontend/
├── app/
│   ├── layout.tsx          # Root layout with SocketProvider
│   ├── page.tsx            # Home page for room entry
│   └── room/[roomId]/
│       └── page.tsx        # Room chat page
├── components/
│   ├── ui/                 # Reusable UI components (Button, Input, etc.)
│   ├── AnimatedMessage.tsx # Message animation component
│   ├── OnlineUsersModal.tsx # Modal for online users
│   ├── SocketProvider.tsx  # Socket.io context provider
│   └── ...
├── lib/
│   ├── apiClient.ts        # Axios setup and API methods
│   └── hooks.ts            # Custom hooks for API calls
├── public/                 # Static assets (logo, favicon, etc.)
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

- Inspired by Star Wars for the theme.
- Built with Next.js, Socket.io, and modern React practices.
