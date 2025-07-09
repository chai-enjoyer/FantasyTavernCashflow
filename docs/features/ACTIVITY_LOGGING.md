# Activity Logging System

## Overview

The activity logging system provides a comprehensive audit trail for all administrative actions in the Fantasy Tavern admin panel. This ensures accountability and helps track changes over time.

## Features

### What Gets Logged

1. **NPC Operations**
   - Create: New NPC creation with all details
   - Update: Changes to existing NPCs with before/after values
   - Delete: NPC removal with identifying information

2. **Card Operations**
   - Create: New card creation
   - Update: Card modifications
   - Delete: Card removal

3. **Import/Export Operations**
   - Import: Bulk data imports with counts
   - Export: Data exports with details

4. **Authentication Events**
   - Login: User login with timestamp
   - Logout: User logout events

5. **Image Uploads**
   - NPC portrait uploads
   - Image replacements

### Log Information

Each log entry contains:
- **User Information**: Who performed the action (ID and email)
- **Timestamp**: When the action occurred
- **Action Type**: What type of operation (create, update, delete, etc.)
- **Entity Type**: What was affected (NPC, card, config, etc.)
- **Entity Details**: ID and name of the affected item
- **Changes**: For updates, what fields changed with old/new values

## Implementation Details

### Service Layer

The logging system is implemented in `@repo/firebase/services/activityLog.ts`:

```typescript
export interface ActivityLog {
  id?: string;
  userId: string;
  userEmail: string;
  action: 'create' | 'update' | 'delete' | 'import' | 'export' | 'login' | 'logout';
  entityType: 'npc' | 'card' | 'config' | 'bulk' | 'auth';
  entityId?: string;
  entityName?: string;
  details?: Record<string, any>;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  timestamp: Timestamp;
}
```

### Usage Example

```typescript
// When creating an NPC
const userInfo = { userId: user.uid, userEmail: user.email };
await createNPC(npcData, undefined, userInfo);

// When updating a card
await updateCard(cardId, updates, userInfo);

// For bulk operations
await logBulkOperation('Import NPCs', {
  count: 50,
  source: 'import.json'
}, userInfo);
```

## Admin Interface

### Logs Page Features

1. **Filtering Options**
   - By action type (create, update, delete, etc.)
   - By entity type (NPC, card, bulk, auth)
   - By date range
   - Real-time filtering

2. **Display Information**
   - User who performed the action
   - Timestamp with relative time
   - Action icon and color coding
   - Entity information
   - Expandable details for complex changes

3. **Pagination**
   - 50 logs per page
   - Load more functionality
   - Efficient querying

### Visual Design

- **Color Coding**:
  - Green: Create operations
  - Blue: Update operations
  - Red: Delete operations
  - Purple: Import operations
  - Cyan: Export operations
  - Yellow: Login events
  - Gray: Logout events

## Security Considerations

1. **Firestore Rules**: Activity logs can only be read/written by authenticated users
2. **User Context**: All operations require user authentication
3. **No Deletion**: Logs cannot be deleted to maintain audit integrity
4. **Data Privacy**: Sensitive information should not be logged

## Best Practices

1. **Always Pass User Info**: When calling service functions from the admin panel
2. **Log Meaningful Details**: Include relevant information for debugging
3. **Avoid Over-Logging**: Don't log read operations or navigation
4. **Handle Errors Gracefully**: Logging failures shouldn't break operations

## Future Enhancements

1. **Export Logs**: Download activity logs as CSV/JSON
2. **Advanced Filtering**: Filter by specific user or entity ID
3. **Log Retention**: Automatic cleanup of old logs
4. **Real-time Updates**: Live log streaming
5. **Analytics Dashboard**: Visualize activity patterns