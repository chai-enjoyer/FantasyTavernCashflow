# NPC ID System Documentation

## Overview

The Fantasy Tavern Cashflow game supports two types of NPC IDs:

1. **Firebase Auto-generated IDs**: Alphanumeric strings like `bY0WTSIDpfNbR7TzLqQ9`
2. **Readable IDs**: Human-friendly format following pattern `class_name` (e.g., `commoner_tom`, `merchant_bob`)

## ID Validation

The system accepts both formats:
- Firebase IDs: 15-25 alphanumeric characters
- Readable IDs: Must follow pattern `[class]_[name]` where:
  - Class is lowercase letters only
  - Name is lowercase letters, numbers, and underscores
  - Examples: `merchant_bob`, `dragon_fire`, `guard_captain_erik`

## Import System

When importing NPCs and cards:

### With Readable IDs (Recommended)
```json
{
  "npcs": [{
    "id": "merchant_bob",
    "name": "Bob the Merchant",
    "class": "merchant",
    ...
  }],
  "cards": [{
    "id": "merchant_deal",
    "npcId": "merchant_bob",
    ...
  }]
}
```

Benefits:
- IDs are preserved during import
- Card-NPC relationships remain intact
- Easy to reference in game content

### With Firebase IDs
- System will accept existing Firebase IDs
- Can mix Firebase and readable IDs in same import

## Image Upload

The image upload system now accepts both ID formats:

1. For existing NPCs with Firebase IDs, use the ID as-is
2. For new NPCs, generate readable IDs using the pattern
3. Images are stored at: `npcs/{npcId}/{mood}.{ext}`

Example paths:
- `npcs/commoner_tom/neutral.jpg`
- `npcs/bY0WTSIDpfNbR7TzLqQ9/positive.jpg`

## Best Practices

1. **New Content**: Always use readable IDs for new NPCs
2. **Consistency**: Keep the same ID format within a content pack
3. **Naming Convention**: 
   - Use descriptive names: `merchant_bob` not `merchant_1`
   - For unique characters: `royal_princess_aria`
   - For generic NPCs: `guard_captain_erik`

## Migration Guide

To migrate existing NPCs to readable IDs:

1. Export current NPCs
2. Update IDs to readable format
3. Update all card references
4. Re-import with new IDs

Note: This will create new documents in Firebase. Delete old ones if needed.

## Standard NPC IDs

Core game NPCs use these standard IDs:
- `commoner_tom` - Tom the Farmer
- `adventurer_lyra` - Lyra the Ranger
- `criminal_vex` - Vex the Shadow
- `noble_aldric` - Lord Aldric
- `cleric_elena` - Sister Elena
- `mage_zephyr` - Zephyr the Wise
- `royal_princess` - Princess Aria
- `crime_boss_grimm` - Grimm the Enforcer
- `dragon_smaug` - Smaug the Golden

Expansion NPCs:
- `merchant_gareth` - Gareth the Trader
- `bard_melody` - Melody the Bard
- `guard_captain_erik` - Captain Erik
- `alchemist_nova` - Nova the Alchemist
- `dwarf_thorin` - Thorin Ironbeard
- `elf_silviana` - Lady Silviana
- `halfling_pip` - Pip Goodbarrel
- `orc_gruk` - Gruk the Civilized
- `vampire_vladimir` - Count Vladimir
- `pirate_scarlett` - Captain Scarlett