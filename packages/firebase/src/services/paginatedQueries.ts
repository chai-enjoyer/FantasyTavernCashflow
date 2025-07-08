import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter, 
  getDocs,
  DocumentSnapshot,
  QueryConstraint 
} from 'firebase/firestore';
import { db } from '../config';
import { Card, NPC } from '@repo/shared';

interface PaginationOptions {
  pageSize?: number;
  startAfterDoc?: DocumentSnapshot;
}

interface PaginatedResult<T> {
  data: T[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Paginated query service for handling large datasets efficiently
 */
export class PaginatedQueries {
  private static readonly DEFAULT_PAGE_SIZE = 50;
  private static readonly MAX_PAGE_SIZE = 200;

  /**
   * Get paginated cards with filtering
   */
  static async getPaginatedCards(
    filters?: {
      priority?: number;
      npcId?: string;
      minMoney?: number;
      maxMoney?: number;
    },
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<Card>> {
    const pageSize = Math.min(
      options.pageSize || this.DEFAULT_PAGE_SIZE,
      this.MAX_PAGE_SIZE
    );

    // Build query constraints
    const constraints: QueryConstraint[] = [];
    
    if (filters?.priority !== undefined) {
      constraints.push(where('priority', '==', filters.priority));
    }
    
    if (filters?.npcId) {
      constraints.push(where('npcId', '==', filters.npcId));
    }
    
    if (filters?.minMoney !== undefined) {
      constraints.push(where('requirements.minMoney', '>=', filters.minMoney));
    }
    
    if (filters?.maxMoney !== undefined) {
      constraints.push(where('requirements.maxMoney', '<=', filters.maxMoney));
    }
    
    // Always order by something for consistent pagination
    constraints.push(orderBy('priority'), orderBy('updatedAt', 'desc'));
    
    // Add pagination
    constraints.push(limit(pageSize + 1)); // Fetch one extra to check if there are more
    
    if (options.startAfterDoc) {
      constraints.push(startAfter(options.startAfterDoc));
    }

    // Execute query
    const q = query(collection(db, 'cards'), ...constraints);
    const snapshot = await getDocs(q);
    
    // Process results
    const cards: Card[] = [];
    let lastDoc: DocumentSnapshot | null = null;
    
    snapshot.docs.slice(0, pageSize).forEach(doc => {
      cards.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as Card);
      lastDoc = doc;
    });
    
    return {
      data: cards,
      lastDoc,
      hasMore: snapshot.docs.length > pageSize,
    };
  }

  /**
   * Get paginated NPCs
   */
  static async getPaginatedNPCs(
    filters?: {
      wealth?: number;
      reliability?: number;
    },
    options: PaginationOptions = {}
  ): Promise<PaginatedResult<NPC>> {
    const pageSize = Math.min(
      options.pageSize || this.DEFAULT_PAGE_SIZE,
      this.MAX_PAGE_SIZE
    );

    // Build query constraints
    const constraints: QueryConstraint[] = [];
    
    if (filters?.wealth !== undefined) {
      constraints.push(where('wealth', '==', filters.wealth));
    }
    
    if (filters?.reliability !== undefined) {
      constraints.push(where('reliability', '==', filters.reliability));
    }
    
    // Always order by something for consistent pagination
    constraints.push(orderBy('name'), orderBy('updatedAt', 'desc'));
    
    // Add pagination
    constraints.push(limit(pageSize + 1));
    
    if (options.startAfterDoc) {
      constraints.push(startAfter(options.startAfterDoc));
    }

    // Execute query
    const q = query(collection(db, 'npcs'), ...constraints);
    const snapshot = await getDocs(q);
    
    // Process results
    const npcs: NPC[] = [];
    let lastDoc: DocumentSnapshot | null = null;
    
    snapshot.docs.slice(0, pageSize).forEach(doc => {
      npcs.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as NPC);
      lastDoc = doc;
    });
    
    return {
      data: npcs,
      lastDoc,
      hasMore: snapshot.docs.length > pageSize,
    };
  }

  /**
   * Load all data in batches (for initial cache warming)
   */
  static async *loadAllCardsInBatches(
    batchSize: number = 100
  ): AsyncGenerator<Card[], void, unknown> {
    let lastDoc: DocumentSnapshot | null = null;
    let hasMore = true;
    
    while (hasMore) {
      const result = await this.getPaginatedCards({}, {
        pageSize: batchSize,
        startAfterDoc: lastDoc || undefined,
      });
      
      yield result.data;
      
      lastDoc = result.lastDoc;
      hasMore = result.hasMore;
    }
  }

  /**
   * Load all NPCs in batches
   */
  static async *loadAllNPCsInBatches(
    batchSize: number = 100
  ): AsyncGenerator<NPC[], void, unknown> {
    let lastDoc: DocumentSnapshot | null = null;
    let hasMore = true;
    
    while (hasMore) {
      const result = await this.getPaginatedNPCs({}, {
        pageSize: batchSize,
        startAfterDoc: lastDoc || undefined,
      });
      
      yield result.data;
      
      lastDoc = result.lastDoc;
      hasMore = result.hasMore;
    }
  }
}