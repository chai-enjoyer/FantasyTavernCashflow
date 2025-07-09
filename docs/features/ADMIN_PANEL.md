# Admin Panel

## Overview

The admin panel is a comprehensive dashboard for managing all game content and monitoring system activity. It features a modern, responsive design with a collapsible sidebar navigation.

## Features

### Navigation

The admin panel uses a sidebar navigation system similar to modern web applications:

- **Collapsible Sidebar**: Click the chevron to expand/collapse
- **Responsive Design**: Mobile-friendly with overlay menu
- **Active State Indication**: Current page highlighted
- **User Info Display**: Shows logged-in admin details

### Main Sections

#### 1. Dashboard (Главная)
- Quick statistics overview
- Recent activity summary
- System health indicators

#### 2. Cards Management (Карты)
- **List View**: 
  - Search functionality
  - Advanced filtering (type, category, priority, NPC)
  - Statistics summary
  - Color-coded priorities
- **Create/Edit**:
  - Form validation
  - Four option requirements
  - NPC association
  - Preview functionality

#### 3. NPCs Management (НПС)
- **List View**:
  - Search by name
  - Filter by class, wealth, reliability
  - Visual class indicators
  - Statistics overview
- **Create/Edit**:
  - Character details
  - Portrait URLs management
  - Wealth and reliability settings
  - Class selection from 35+ options

#### 4. Configuration (Настройки)
- Game balance parameters
- Starting resources
- Gameplay modifiers
- System settings

#### 5. Analytics (Аналитика)
- Game statistics charts
- Player behavior analysis
- Resource distribution graphs
- NPC interaction frequency

#### 6. Import/Export (Импорт/Экспорт)
- **Export Features**:
  - Export all data
  - Export specific types (NPCs, Cards, Config)
  - JSON format with timestamps
  - Activity logging
- **Import Features**:
  - Drag-and-drop file upload
  - Data validation
  - Preview before import
  - Batch processing
- **AI Content Generation Guide**:
  - Detailed prompts for generating NPCs
  - Card creation templates
  - Balance recommendations
- **Image Upload**:
  - NPC portrait management
  - Support for three emotional states
  - Firebase Storage integration
  - Create new NPCs with images

#### 7. Activity Logs (Журнал)
- Complete audit trail
- Advanced filtering
- User action tracking
- Timestamp records

## Authentication

### Login System
- Email/password authentication
- Firebase Auth integration
- Session persistence
- Secure logout

### User Management
- Admin user creation
- Role-based access (future enhancement)
- Password reset functionality

## UI/UX Features

### Design System
- **Dark Theme**: Easy on the eyes for extended use
- **Color Palette**:
  - Background: `#0a0a0a`
  - Card: `#1a1a1a`
  - Primary: `#3b82f6`
  - Text: `#f3f4f6`
- **Responsive Grid**: Adapts to screen size
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: User-friendly error messages

### Form Components
- **Consistent Styling**: Unified input design
- **Validation**: Real-time field validation
- **Auto-save**: Draft preservation (planned)
- **Rich Text**: Markdown support for descriptions

## Technical Implementation

### State Management
- React hooks for local state
- Context API for global state
- Firebase real-time updates

### Performance Optimizations
- Code splitting
- Lazy loading
- Static site generation
- Image optimization

### Security
- Authentication required
- Firestore security rules
- Input sanitization
- XSS protection

## Keyboard Shortcuts (Planned)

- `Ctrl/Cmd + S`: Save current form
- `Ctrl/Cmd + N`: Create new item
- `Ctrl/Cmd + F`: Focus search
- `Esc`: Close modals

## Mobile Considerations

- Touch-friendly controls
- Swipe gestures for navigation
- Optimized layouts for small screens
- Offline capability (planned)

## Best Practices

1. **Regular Backups**: Use export feature regularly
2. **Test Changes**: Preview before saving
3. **Meaningful Names**: Use descriptive names for NPCs and cards
4. **Consistent Data**: Maintain naming conventions
5. **Monitor Logs**: Check activity logs for unusual activity

## Future Enhancements

1. **Bulk Operations**: Select multiple items for actions
2. **Revision History**: Track changes over time
3. **Collaborative Editing**: Multiple admin support
4. **Custom Themes**: User preference settings
5. **API Access**: Programmatic content management