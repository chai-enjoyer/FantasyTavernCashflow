import { Card, NPC, GameConfig, NPCClass, CardType } from '@repo/shared';

interface ImportFileData {
  version: string;
  timestamp: string;
  cards: any[];
  npcs: any[];
  config: any;
}

interface ProcessedImportData {
  cards?: Card[];
  npcs?: NPC[];
  config?: GameConfig;
}

// Process raw import file and clean up data
export function processImportFile(data: ImportFileData): ProcessedImportData {
  const result: ProcessedImportData = {};

  // Process NPCs - keep IDs, remove only timestamps
  if (data.npcs && Array.isArray(data.npcs)) {
    result.npcs = data.npcs.map(npc => {
      const { createdAt, updatedAt, ...npcData } = npc;
      return {
        ...npcData,
        id: npc.id, // Preserve the ID
        class: npc.class as NPCClass,
        wealth: Number(npc.wealth) as 1 | 2 | 3 | 4 | 5,
        reliability: Number(npc.reliability),
      } as NPC;
    });
  }

  // Process cards - keep IDs if they're readable format, remove timestamps
  if (data.cards && Array.isArray(data.cards)) {
    result.cards = data.cards.map(card => {
      const { createdAt, updatedAt, ...cardData } = card;
      return {
        ...cardData,
        id: card.id, // Preserve the ID
        type: card.type as CardType,
        priority: Number(card.priority) as 1 | 2 | 3 | 4,
        options: card.options.slice(0, 4), // Ensure exactly 4 options
      } as Card;
    });
  }

  // Process config
  if (data.config) {
    const { updatedAt, ...configData } = data.config;
    result.config = configData as GameConfig;
  }

  return result;
}

// Update card NPC references after NPCs are imported with new IDs
export function updateCardNpcReferences(cards: Card[], npcIdMap: Map<string, string>): Card[] {
  return cards.map(card => ({
    ...card,
    npcId: npcIdMap.get(card.npcId) || card.npcId,
  }));
}

// Validate NPC class
export function isValidNpcClass(value: string): value is NPCClass {
  const validClasses: NPCClass[] = [
    'commoner', 'merchant', 'noble', 'adventurer', 'criminal', 'guard', 'cleric', 'mage', 'royal', 'crime_boss', 'dragon',
    'bard', 'alchemist', 'dwarf', 'elf', 'halfling', 'orc', 'vampire', 'pirate', 'monk', 'witch', 'knight',
    'necromancer', 'barbarian', 'artisan', 'scholar', 'blacksmith', 'hunter', 'sailor', 'healer', 'beggar',
    'artist', 'official', 'mystic'
  ];
  return validClasses.includes(value as NPCClass);
}

// Validate card type
export function isValidCardType(value: string): value is CardType {
  const validTypes: CardType[] = [
    'immediate', 'passive_income', 'debt', 'modifier',
    'delayed', 'social', 'chain'
  ];
  return validTypes.includes(value as CardType);
}

// Generate human-readable summary of import data
export function generateImportSummary(data: ProcessedImportData): string {
  const lines: string[] = [];
  
  lines.push('Import Summary:');
  lines.push('==============');
  
  if (data.npcs && data.npcs.length > 0) {
    lines.push(`\nNPCs (${data.npcs.length}):`);
    const npcsByClass = data.npcs.reduce((acc, npc) => {
      acc[npc.class] = (acc[npc.class] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(npcsByClass).forEach(([cls, count]) => {
      lines.push(`  - ${cls}: ${count}`);
    });
  }
  
  if (data.cards && data.cards.length > 0) {
    lines.push(`\nCards (${data.cards.length}):`);
    const cardsByType = data.cards.reduce((acc, card) => {
      acc[card.type] = (acc[card.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(cardsByType).forEach(([type, count]) => {
      lines.push(`  - ${type}: ${count}`);
    });
    
    const cardsByPriority = data.cards.reduce((acc, card) => {
      acc[card.priority] = (acc[card.priority] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    lines.push('\nBy Priority:');
    Object.entries(cardsByPriority).forEach(([priority, count]) => {
      const label = getPriorityLabel(Number(priority));
      lines.push(`  - ${label}: ${count}`);
    });
  }
  
  if (data.config) {
    lines.push('\nGame Configuration:');
    lines.push(`  - Starting Money: ${data.config.startingMoney}`);
    lines.push(`  - Starting Reputation: ${data.config.startingReputation}`);
    lines.push(`  - Base Income: ${data.config.baseIncome}`);
    lines.push(`  - Base Costs: ${data.config.baseCosts}`);
  }
  
  return lines.join('\n');
}

function getPriorityLabel(priority: number): string {
  switch (priority) {
    case 1: return 'Critical';
    case 2: return 'Risk';
    case 3: return 'Story';
    case 4: return 'Normal';
    default: return 'Unknown';
  }
}