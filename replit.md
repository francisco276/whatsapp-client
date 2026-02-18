# Monday WhatsApp Frontend

## Overview
A React-based frontend application for integrating Monday.com with WhatsApp messaging. This project is built with Vite, React 18, TypeScript, and Tailwind CSS, using the Monday.com Vibe design system.

## Recent Changes
- 2026-02-18: Added server-side Monday.com notifications - backend sends notifications via Monday.com API when WhatsApp messages arrive, even when frontend views are closed
  - New tables: monday_credentials (API token per workspace), monday_user_targets (boardId per user)
  - New backend service: monday-notifications.ts with dispatchMondayNotifications()
  - New endpoint: POST /api/v1/monday/register (auth required, admin-only for token)
  - Frontend auto-registers boardId on app load via useMondayRegistration hook
  - Settings UI: MondayToken component for admin to save API token
- 2026-01-07: Configured for Replit environment - set Vite to run on port 5000 with all hosts allowed

## Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4.x with @tailwindcss/vite plugin
- **UI Components**: @vibe/core (Monday.com's design system)
- **State Management**: Zustand, React Query
- **Routing**: Wouter
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client

## Project Structure
```
src/
├── components/     # React components organized by feature
│   ├── chats/      # Chat-related components
│   ├── layout/     # Layout components
│   ├── messages/   # Message display and input
│   ├── modals/     # Modal dialogs
│   ├── providers/  # Context providers
│   ├── sessions/   # Session management
│   ├── settings/   # Settings components
│   └── templates/  # Template management
├── config/         # Configuration constants
├── hooks/          # Custom React hooks
├── lib/            # Services and API utilities
├── page/           # Page components
├── stores/         # Zustand stores
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Running the Project
- Development: `npm run dev` (runs on port 5000)
- Build: `npm run build`
- Preview: `npm run preview`

## Notes
- This is a frontend-only application that connects to a separate backend API
- Uses Monday.com SDK for integration with Monday.com boards
- Socket.io for real-time message updates
