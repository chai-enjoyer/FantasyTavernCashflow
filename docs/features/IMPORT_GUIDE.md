# Game Content Import Guide

## Overview
This directory contains JSON files with additional NPCs and cards to expand your game content and ensure variety in gameplay.

## 🆕 Important Update: NPC ID System

The game now supports two types of NPC IDs:
1. **Readable IDs** (RECOMMENDED): Use format `class_name` (e.g., `merchant_bob`, `dragon_fire`)
2. **Firebase IDs**: Auto-generated alphanumeric strings (e.g., `bY0WTSIDpfNbR7TzLqQ9`)

**For new content, always use readable IDs!** They are preserved during import and make content management easier.

## ⚠️ IMPORTANT: Use Fixed Version
**Use `content-expansion-import-fixed.json` instead of the original files!** The fixed version includes required portrait paths for NPCs.

## Files Available

### 1. `complete-npcs-import.json` 🆕 ALL NPCS
- **All 19 game NPCs** with readable IDs and portrait URLs
- Ready for bulk import to set up the complete NPC roster

### 2. `sample-import-with-ids.json` 🆕 EXAMPLE
- Example showing proper readable ID format
- 2 NPCs and 2 cards with correct relationships

### 3. `content-expansion-import-fixed.json` ✅ EXPANSION
- **10 new NPCs** with proper portrait paths
- **10 new cards** with various scenarios and outcomes
- Ready to import directly into the admin panel

### 4. `expanded-game-data.json`
- **15 additional NPCs**
- **20 additional cards**
- More complex scenarios and branching storylines

### 5. `additional-game-data.json`
- **10 more NPCs**
- **20 more cards**
- Focus on unique character interactions

## How to Import

1. Go to your admin panel at: https://fantasy-tavern-admin.web.app
2. Navigate to the "Import/Export" section
3. Choose a JSON file from this directory
4. Click "Import" and confirm

## Card Rotation System

The game uses a smart card rotation system to prevent repetition:

### How it works:
1. **Recent Card Tracking**: The game tracks recently shown cards using flags like `recent_card_[cardId]`
2. **Filtering**: When selecting the next card, it filters out cards that were shown recently
3. **Fallback**: If too few cards remain after filtering, it only excludes the most recent 2 cards

### With more cards:
- With 50+ unique cards, players will rarely see the same card twice in a session
- Cards are weighted by priority (1-3) and filtered by requirements
- NPC relationships affect which cards appear

## Recommended Import Strategy

1. **Start with**: `content-expansion-import.json` for immediate variety
2. **Then add**: `expanded-game-data.json` for more depth
3. **Finally add**: `additional-game-data.json` for maximum variety

## Card Priority Levels

- **Priority 1**: Common events (appear frequently)
- **Priority 2**: Uncommon events (moderate frequency)
- **Priority 3**: Rare events (appear less often)

## Tips for Maximum Variety

1. Import all three files for 35+ NPCs and 50+ unique cards
2. Cards with requirements (like minimum money) add natural progression
3. NPC relationships create dynamic storylines
4. Mix of card types (immediate, passive_income, debt, social, modifier) keeps gameplay fresh

## Custom Content

### Creating NPCs
NPCs MUST include portraits object and use readable ID format:

```json
{
  "id": "merchant_bob",  // Use class_name format!
  "name": "Bob the Merchant",
  "class": "merchant",
  "wealth": 3,  // 1-5 scale
  "reliability": 85,  // 0-100 scale
  "portraits": {
    "neutral": "https://firebasestorage.googleapis.com/v0/b/fantasy-tavern-cashflow.appspot.com/o/npcs%2Fmerchant_bob%2Fneutral.jpg?alt=media",
    "positive": "https://firebasestorage.googleapis.com/v0/b/fantasy-tavern-cashflow.appspot.com/o/npcs%2Fmerchant_bob%2Fpositive.jpg?alt=media",
    "negative": "https://firebasestorage.googleapis.com/v0/b/fantasy-tavern-cashflow.appspot.com/o/npcs%2Fmerchant_bob%2Fnegative.jpg?alt=media"
  },
  "description": "A traveling merchant with exotic goods"
}
```

**ID Format Rules:**
- ✅ Good: `merchant_bob`, `guard_captain_erik`, `dragon_ancient`
- ❌ Bad: `Bob`, `merchant-bob`, `MERCHANT_BOB`

### Creating Cards
Cards follow this structure:

```json
{
  "id": "unique_card_id",
  "type": "immediate|passive_income|debt|social|modifier",
  "category": "business|service|entertainment|etc",
  "npcId": "existing_npc_id",
  "title": "Card Title",
  "description": "Brief description",
  "situation": "Detailed scenario text",
  "priority": 1-3,
  "options": [
    {
      "text": "Choice text",
      "consequences": {
        "money": 100,
        "reputation": 5
      }
    }
  ]
}
```

## Card Types Explained

- **immediate**: One-time effects (money/reputation changes)
- **passive_income**: Creates recurring income for X turns
- **debt**: Creates debt obligations
- **social**: Affects NPC relationships
- **modifier**: Adds temporary effects (multipliers, boosts)

## Testing Your Content

After importing:
1. Start a new game
2. Play through several turns
3. Check that new NPCs and cards appear
4. Verify card variety (you shouldn't see repeats for many turns)