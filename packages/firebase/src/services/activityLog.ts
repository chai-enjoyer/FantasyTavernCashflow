import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where, 
  Timestamp,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { db, auth } from '../config';

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
  ip?: string;
  [key: string]: any; // Allow indexing for dynamic property assignment
}

const LOGS_COLLECTION = 'activityLogs';
const LOGS_PER_PAGE = 50;

export async function logActivity(
  action: ActivityLog['action'],
  entityType: ActivityLog['entityType'],
  entityId?: string,
  entityName?: string,
  details?: Record<string, any>,
  changes?: ActivityLog['changes'],
  userInfo?: { userId: string; userEmail: string }
): Promise<void> {
  console.log('=== logActivity called ===', {
    action,
    entityType,
    entityId,
    entityName,
    userInfo,
    authCurrentUser: auth.currentUser
  });
  
  try {
    // Try to get user from passed info or auth
    let userId: string;
    let userEmail: string;
    
    if (userInfo) {
      console.log('Using passed userInfo:', userInfo);
      userId = userInfo.userId;
      userEmail = userInfo.userEmail;
    } else {
      const user = auth.currentUser;
      console.log('Checking auth.currentUser:', user);
      if (!user) {
        console.warn('No authenticated user for activity logging', {
          action,
          entityType,
          entityId,
          entityName
        });
        return;
      }
      userId = user.uid;
      userEmail = user.email || 'unknown';
    }

    const log: Omit<ActivityLog, 'id'> = {
      userId,
      userEmail,
      action,
      entityType,
      timestamp: Timestamp.now()
    };

    // Only add optional fields if they have values
    if (entityId !== undefined) log.entityId = entityId;
    if (entityName !== undefined) log.entityName = entityName;
    if (details !== undefined) log.details = details;
    if (changes !== undefined) log.changes = changes;

    console.log('Logging activity:', log);
    const docRef = await addDoc(collection(db, LOGS_COLLECTION), log);
    console.log('Activity logged successfully with ID:', docRef.id);
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - logging failures shouldn't break the app
  }
}

export async function getActivityLogs(
  filters?: {
    userId?: string;
    action?: ActivityLog['action'];
    entityType?: ActivityLog['entityType'];
    startDate?: Date;
    endDate?: Date;
  },
  lastDoc?: DocumentSnapshot
): Promise<{ logs: ActivityLog[], lastDoc: DocumentSnapshot | null }> {
  try {
    let q = query(
      collection(db, LOGS_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(LOGS_PER_PAGE)
    );

    // Apply filters
    if (filters) {
      const constraints = [];
      
      if (filters.userId) {
        constraints.push(where('userId', '==', filters.userId));
      }
      if (filters.action) {
        constraints.push(where('action', '==', filters.action));
      }
      if (filters.entityType) {
        constraints.push(where('entityType', '==', filters.entityType));
      }
      if (filters.startDate) {
        constraints.push(where('timestamp', '>=', Timestamp.fromDate(filters.startDate)));
      }
      if (filters.endDate) {
        constraints.push(where('timestamp', '<=', Timestamp.fromDate(filters.endDate)));
      }

      q = query(
        collection(db, LOGS_COLLECTION),
        ...constraints,
        orderBy('timestamp', 'desc'),
        limit(LOGS_PER_PAGE)
      );
    }

    // Pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const logs: ActivityLog[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ActivityLog));

    const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

    return { logs, lastDoc: newLastDoc };
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return { logs: [], lastDoc: null };
  }
}

export async function getRecentActivity(maxResults: number = 10): Promise<ActivityLog[]> {
  try {
    const q = query(
      collection(db, LOGS_COLLECTION),
      orderBy('timestamp', 'desc'),
      limit(maxResults)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ActivityLog));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}

// Helper function to log NPC changes
export function logNPCChange(
  action: 'create' | 'update' | 'delete',
  npcId: string,
  npcName: string,
  changes?: ActivityLog['changes'],
  userInfo?: { userId: string; userEmail: string }
): Promise<void> {
  console.log('=== logNPCChange called ===', {
    action,
    npcId,
    npcName,
    changes,
    userInfo
  });
  return logActivity(action, 'npc', npcId, npcName, undefined, changes, userInfo);
}

// Helper function to log Card changes
export function logCardChange(
  action: 'create' | 'update' | 'delete',
  cardId: string,
  cardTitle: string,
  changes?: ActivityLog['changes'],
  userInfo?: { userId: string; userEmail: string }
): Promise<void> {
  return logActivity(action, 'card', cardId, cardTitle, undefined, changes, userInfo);
}

// Helper function to log bulk operations
export function logBulkOperation(
  operation: string,
  details: Record<string, any>,
  userInfo?: { userId: string; userEmail: string }
): Promise<void> {
  // Determine action based on operation
  const action = operation.toLowerCase().includes('export') ? 'export' : 'import';
  return logActivity(action, 'bulk', undefined, operation, details, undefined, userInfo);
}

// Helper function to log auth events
export function logAuthEvent(
  action: 'login' | 'logout',
  details?: Record<string, any>,
  userInfo?: { userId: string; userEmail: string }
): Promise<void> {
  return logActivity(action, 'auth', undefined, undefined, details, undefined, userInfo);
}