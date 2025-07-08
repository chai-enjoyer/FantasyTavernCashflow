# Fantasy Tavern Cashflow

A Telegram Mini App game where players manage a fantasy tavern through strategic decision-making.

## Project Structure

This is a monorepo containing:
- `apps/game` - The main Telegram Mini App (Next.js)
- `apps/admin` - Admin panel for content management (Next.js)
- `packages/shared` - Shared types, constants, and utilities
- `packages/firebase` - Firebase configuration and services
- `packages/game-logic` - Core game mechanics and engine

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.local` to `apps/game/.env.local`
   - Copy `.env.local` to `apps/admin/.env.local`
   - Update Firebase configuration values

3. Initialize Firebase:
```bash
firebase init
```

## Development

Run both apps in development mode:
```bash
npm run dev
```

Run specific app:
```bash
# Game app
npm run dev --workspace=game

# Admin app  
npm run dev --workspace=admin
```

## Building

Build all apps:
```bash
npm run build
```

## Deployment

1. Build the apps:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy
```

## Game Features

- Economic strategy gameplay
- NPC relationship system
- Reputation-based pricing
- Passive income and debt mechanics
- Risk/reward decision making
- Multiple card types and priorities
- Mobile-optimized UI

## Admin Features

- Card creation and management
- NPC management with portraits
- Game configuration
- Analytics dashboard
- Import/export functionality

## Technologies

- TypeScript
- Next.js 14 (App Router)
- Firebase (Firestore, Storage, Hosting)
- Tailwind CSS
- Framer Motion
- React Hook Form
- Turbo (monorepo)