# Fantasy Tavern Cashflow - Quick Start Guide

## 🚀 Quick Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Firebase Setup
```bash
# Login to Firebase
firebase login

# Deploy Firestore rules
firebase deploy --only firestore:rules
```

### 3. Configure Telegram Bot
Follow the steps in `TELEGRAM_SETUP.md` to configure your bot with BotFather.

### 4. Local Development
```bash
# Start development servers
npm run dev

# The game will be available at:
# - Game: http://localhost:3000
# - Admin: http://localhost:3001
```

### 5. Deploy to Production
```bash
# Build and deploy everything
npm run deploy

# Or deploy individually:
npm run deploy:game  # Deploy game only
npm run deploy:admin # Deploy admin only
```

### 6. Access Your Apps
- Game: `https://fantasy-tavern-game-6d6fd.web.app`
- Admin: `https://fantasy-tavern-admin-6d6fd.web.app`
- Telegram Bot: `@FantasyTavernCashflowBot`

## 📝 Important Notes

1. **Environment Variables**: The `.env.local` files are already configured with your API keys.

2. **Firebase Admin SDK**: You still need to:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Generate a new private key
   - Update `FIREBASE_ADMIN_PRIVATE_KEY` and `FIREBASE_ADMIN_CLIENT_EMAIL` in `/apps/admin/.env.local`

3. **Initial Data**: Use the admin panel to create:
   - NPCs (different character types)
   - Cards (game scenarios)
   - Game configuration

4. **Testing**: Open your Telegram bot and click the "Play Game" button to test the Mini App.

## 🛠 Common Commands

```bash
# Development
npm run dev          # Start all dev servers
npm run lint         # Check code quality
npm run format       # Format code

# Firebase
npm run emulators    # Start Firebase emulators
firebase deploy      # Deploy everything
firebase serve       # Test hosting locally

# Building
npm run build        # Build all apps
```

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Firebase deployment fails
```bash
firebase login --reauth
firebase use fantasy-tavern-cashflow-6d6fd
```

### Telegram Mini App not loading
- Ensure HTTPS (Firebase Hosting provides this)
- Check bot configuration with BotFather
- Clear Telegram cache

### Game data not loading
- Check Firestore rules are deployed
- Verify collections exist in Firebase Console
- Check browser console for errors

## 📚 Next Steps

1. Add game content (NPCs, cards) via admin panel
2. Customize game balance and settings
3. Add sound effects to `/apps/game/public/sounds/`
4. Test with real users through Telegram
5. Monitor usage in Firebase Console

## 🎮 Game Features

- **Telegram Integration**: Automatic user authentication
- **Tutorial System**: First-time player onboarding
- **Achievements**: Progress tracking and rewards
- **Audio System**: Sound effects and background music
- **Analytics**: Player behavior tracking
- **Responsive Design**: Works on all devices

Happy gaming! 🏰✨