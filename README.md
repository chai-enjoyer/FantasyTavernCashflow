# Fantasy Tavern Cashflow 🍺🏰

A fantasy-themed business simulation game where players manage a tavern, serve colorful NPCs, and navigate through various events to build their reputation and wealth.

## 🎮 Play the Game

- **Game**: [https://fantasy-tavern-game.web.app](https://fantasy-tavern-game.web.app)
- **Admin Panel**: [https://fantasy-tavern-admin.web.app](https://fantasy-tavern-admin.web.app)

## 📖 Documentation

Comprehensive documentation is available in the [docs](./docs) folder:

- [Getting Started](./docs/getting-started/QUICKSTART.md)
- [Project Overview](./docs/getting-started/PROJECT_OVERVIEW.md)
- [Admin Panel Guide](./docs/features/ADMIN_PANEL.md)
- [Activity Logging](./docs/features/ACTIVITY_LOGGING.md)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/fantasy-tavern-cashflow.git
cd fantasy-tavern-cashflow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Firebase credentials

# Run development servers
npm run dev

# Build for production
npm run build

# Deploy to Firebase
npm run deploy
```

## 🏗️ Project Structure

This is a monorepo project using Turborepo:

```
fantasy-tavern-cashflow/
├── apps/
│   ├── game/          # Main game application
│   └── admin/         # Admin dashboard
├── packages/
│   ├── shared/        # Shared types and constants
│   ├── firebase/      # Firebase service layer
│   └── game-logic/    # Core game mechanics
├── docs/              # Documentation
└── game-data/         # Game content files
```

## ✨ Features

### For Players
- 🎭 **35+ Unique NPCs**: Each with distinct personalities and stories
- 🎴 **Dynamic Card System**: Make choices that affect your tavern's future
- 💰 **Resource Management**: Balance money and reputation
- 🌍 **Russian Localization**: Fully translated interface
- 📱 **Mobile Friendly**: Responsive design for all devices
- 🎵 **Sound Effects**: Immersive audio feedback
- 🖼️ **Dynamic Portraits**: NPCs react to your decisions

### For Administrators
- 📊 **Comprehensive Dashboard**: Manage all game content
- 📝 **Content Editor**: Create and modify NPCs and cards
- 📤 **Import/Export**: Bulk data management
- 📸 **Image Management**: Upload and manage NPC portraits
- 📈 **Analytics**: Track game statistics
- 🔍 **Activity Logging**: Complete audit trail
- 🎨 **Modern UI**: Sidebar navigation like Claude

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Storage, Hosting)
- **Monorepo**: Turborepo
- **State Management**: React Context API
- **Forms**: React Hook Form
- **Animation**: Framer Motion
- **Charts**: Recharts

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/development/CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Game concept inspired by classic business simulation games
- NPC artwork generated with AI assistance
- Community feedback and contributions

## 📞 Contact

For questions or support, please open an issue on GitHub or contact the maintainers.

---

Made with ❤️ by the Fantasy Tavern team