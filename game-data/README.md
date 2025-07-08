# Game Data Import Guide

This directory contains game data files for Fantasy Tavern Cashflow.

## Files

- `initial-game-data-import.json` - Complete initial game data ready for admin panel import
- `import-template-correct.json` - Template for creating new import files (correct format)
- `initial-game-data.json` - Raw game data (not for direct import)
- `import-template.json` - Old template format (deprecated)

## Import Format

**IMPORTANT**: The admin panel expects a specific format with `version` and `timestamp` at the root level.

The import files use JSON format with these required fields:

### Root Level Fields (Required)
```json
{
  "version": "1.0.0",
  "timestamp": "2025-01-07T00:00:00.000Z",
  "config": {...},
  "npcs": [...],
  "cards": [...]
}
```

### 1. Game Configuration
```json
"config": {
  "startingMoney": 10000,
  "startingReputation": 0,
  "baseIncome": 100,
  "baseCosts": 50,
  "scalingFormulas": {
    "moneyScaling": "turn * 1.05",
    "reputationImpact": "reputation * 0.01",
    "riskCalculation": "max(0, min(100, 50 - reputation))"
  },
  "version": "1.0.0",
  "updatedAt": "2025-01-07T00:00:00.000Z"
}
```

### 2. NPCs (Non-Player Characters)
```json
"npcs": [{
  "id": "unique_npc_id",
  "name": "NPC Name",
  "class": "commoner|adventurer|criminal|noble|cleric|mage|royal|crime_boss|dragon",
  "wealth": 1-5,
  "reliability": 0-100,
  "portraits": {
    "neutral": "/images/npcs/class_neutral.png",
    "positive": "/images/npcs/class_positive.png",
    "negative": "/images/npcs/class_negative.png"
  },
  "description": "A brief description of the NPC",
  "createdAt": "2025-01-07T00:00:00.000Z",
  "updatedAt": "2025-01-07T00:00:00.000Z"
}]
```

### 3. Cards (Game Events)
```json
"cards": [{
  "id": "unique_card_id",
  "type": "immediate|passive_income|debt|modifier|delayed|social|chain",
  "category": "service|business|event|threat|moral|magical|royal|underworld|legendary",
  "npcId": "reference_to_npc_id",
  "title": "Card Title",
  "description": "Brief card description",
  "situation": "The full scenario text",
  "priority": 1-4,
  "options": [/* 4 options with consequences */],
  "requirements": {/* optional requirements */},
  "createdAt": "2025-01-07T00:00:00.000Z",
  "updatedAt": "2025-01-07T00:00:00.000Z"
}]
```

## Card Types

- **immediate**: One-time effects
- **passive_income**: Creates ongoing income
- **debt**: Creates payment obligations
- **modifier**: Applies temporary effects
- **delayed**: Triggers future events
- **social**: Affects NPC relationships
- **chain**: Part of multi-card sequences

## Consequence Types

- **money**: Direct money gain/loss
- **reputation**: Reputation change
- **passiveIncome**: Ongoing income stream
- **debt**: Payment obligations
- **temporaryEffect**: Time-limited modifiers
- **flags**: Story/state markers
- **delayedEvent**: Future card triggers
- **npcRelationship**: Relationship changes

## Priority Levels

1. **Critical** - Urgent, high-impact events
2. **Risk** - Dangerous situations
3. **Story** - Important narrative events
4. **Normal** - Standard gameplay events

## How to Import

1. Create your JSON file following `import-template-correct.json`
2. Make sure to include:
   - `version` field at root level
   - `timestamp` field at root level
   - `createdAt` and `updatedAt` for all entities
3. Log into the admin panel
4. Navigate to Import/Export
5. Upload your JSON file
6. The system will validate and show a preview

**Note**: The import functionality is currently showing validation only. Actual database import is pending implementation.

## Tips

- Always include 4 options for each card
- Balance risk vs reward in consequences
- Use flags to create story continuity
- Test cards with different game states
- Keep NPC personalities consistent