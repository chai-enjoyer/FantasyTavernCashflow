# Project Overview

## What is Fantasy Tavern Cashflow?

Fantasy Tavern Cashflow is a fantasy-themed business simulation game where players manage a tavern, serve various NPCs (Non-Player Characters), and make strategic decisions to grow their business and reputation.

## Key Features

### For Players
- **Tavern Management**: Run your own fantasy tavern
- **NPC Interactions**: Serve diverse characters from different social classes
- **Decision Making**: Choose how to handle various situations through card-based events
- **Resource Management**: Balance money, reputation, and customer satisfaction
- **Progression System**: Unlock new opportunities as your tavern grows
- **Russian Localization**: Fully translated to Russian (with framework for future languages)

### For Administrators
- **Admin Dashboard**: Comprehensive management interface
- **Content Management**: Create and edit NPCs, cards, and game configurations
- **Import/Export System**: Bulk data management with JSON files
- **Activity Logging**: Complete audit trail of all administrative actions
- **Image Management**: Upload and manage NPC portraits
- **Analytics**: Track game statistics and player behavior

## Project Structure

```
fantasy-tavern-cashflow/
├── apps/
│   ├── game/          # Main game application (Next.js)
│   └── admin/         # Admin dashboard (Next.js)
├── packages/
│   ├── shared/        # Shared types and constants
│   ├── firebase/      # Firebase service layer
│   └── game-logic/    # Core game mechanics
├── docs/              # Project documentation
├── game-data/         # Game content data
└── public/            # Static assets
```

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Animations
- **React Hook Form**: Form management

### Backend
- **Firebase Firestore**: NoSQL database
- **Firebase Auth**: User authentication
- **Firebase Storage**: Image storage
- **Firebase Hosting**: Static site hosting

### Development Tools
- **Turbo**: Monorepo management
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Git**: Version control

## Architecture Overview

The project follows a monorepo structure with clear separation of concerns:

1. **Apps Layer**: User-facing applications
   - Game app for players
   - Admin app for content management

2. **Packages Layer**: Shared functionality
   - `@repo/shared`: Common types and interfaces
   - `@repo/firebase`: Firebase service abstractions
   - `@repo/game-logic`: Core game rules and mechanics

3. **Data Layer**: Firebase services
   - Firestore for data persistence
   - Storage for images
   - Auth for admin authentication

## Key Concepts

### NPCs (Non-Player Characters)
- Different social classes (commoner, merchant, noble, etc.)
- Wealth levels (1-5)
- Reliability ratings
- Emotional states (neutral, positive, negative)

### Cards
- Event-based gameplay
- Multiple choice options
- Consequences affecting resources
- Different priorities and types

### Game State
- Player resources (money, reputation)
- Turn counter
- NPC relationships
- Active modifiers

## Development Philosophy

1. **Type Safety**: Extensive use of TypeScript for reliability
2. **Modularity**: Clear separation between game logic and UI
3. **Performance**: Optimized loading with caching and lazy loading
4. **Accessibility**: Support for multiple languages and devices
5. **Maintainability**: Clean code structure and comprehensive documentation