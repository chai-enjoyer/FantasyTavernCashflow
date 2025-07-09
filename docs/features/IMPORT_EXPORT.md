# Import/Export System

## Overview

The import/export system allows administrators to manage game content in bulk using JSON files. This is useful for:

- Backing up game content
- Transferring content between environments
- Bulk content creation
- Version control of game data
- Collaborative content development

## Export Features

### Export Options

1. **Export All**: Complete game data including NPCs, Cards, and Configuration
2. **Export NPCs Only**: All NPC data
3. **Export Cards Only**: All card data
4. **Export Config Only**: Game configuration settings

### Export Format

Exported files include:
- Version number
- Timestamp of export
- All relevant data with full details
- Proper formatting for re-import

### How to Export

1. Navigate to Import/Export in the admin panel
2. Click on the desired export option
3. A JSON file will be downloaded to your computer
4. File naming: `fantasy-tavern-{type}-{timestamp}.json`

## Import Features

### Import Process

1. **File Upload**: Drag and drop or click to select JSON file
2. **Validation**: System validates the file format and data
3. **Preview**: Shows what will be imported
4. **Confirmation**: Review and confirm before importing
5. **Processing**: Data is added to the database
6. **Logging**: All imports are logged in the activity system

### Import Format Requirements

```json
{
  "version": "1.0.0",
  "timestamp": "2024-01-07T00:00:00.000Z",
  "npcs": [...],
  "cards": [...],
  "config": {...}
}
```

### Data Validation

The system validates:
- Required fields presence
- Data type correctness
- ID uniqueness
- Reference integrity (NPC IDs in cards)
- Value ranges (wealth 1-5, reliability 0-100)

## AI Content Generation Guide

The Import/Export page includes detailed prompts for generating content with AI:

### NPC Generation Prompt

```
Создай NPC для фэнтези-таверны в формате JSON.

Требования:
- Уникальное имя на русском языке
- Класс из списка: commoner, merchant, noble, adventurer, criminal, guard, cleric, mage, royal, crime_boss, dragon, bard, alchemist, dwarf, elf, halfling, orc, vampire, pirate, monk, witch, knight, necromancer, barbarian, artisan, scholar, blacksmith, hunter, sailor, healer, beggar, artist, official, mystic
- Уровень богатства от 1 до 5
- Надёжность от 0 до 100
- Описание персонажа на русском языке
```

### Card Generation Prompt

```
Создай карточку события для фэнтези-таверны.

Требования:
- Тип: immediate, passive_income, debt, modifier, delayed, social, chain
- Категория: service, business, event, threat, moral, magical, royal, underworld, legendary
- Привязка к конкретному NPC
- Название и описание на русском языке
- Ситуация - полный текст события
- Ровно 4 варианта выбора с последствиями
```

## Bulk Operations

### Batch Import

- Import multiple NPCs and cards at once
- System processes in batches of 500 (Firestore limit)
- Progress tracking for large imports
- Error handling with detailed messages

### Merge vs Replace

Currently, imports are additive:
- New NPCs are added (duplicates possible)
- New cards are added
- Config is updated (not replaced)

## Best Practices

### Before Importing

1. **Backup First**: Export current data before major imports
2. **Validate Locally**: Check JSON syntax before uploading
3. **Test Small**: Try with a few items first
4. **Check References**: Ensure NPC IDs exist for cards

### File Management

1. **Version Control**: Keep exported files in Git
2. **Naming Convention**: Use descriptive names
3. **Documentation**: Document what each import contains
4. **Incremental Updates**: Prefer small, focused imports

### Content Guidelines

1. **Consistent Naming**: Follow established patterns
2. **Balanced Gameplay**: Test consequences
3. **Complete Data**: Fill all required fields
4. **Russian Language**: Maintain translation quality

## Troubleshooting

### Common Issues

1. **"Invalid JSON format"**
   - Check for syntax errors
   - Validate with JSON linter
   - Ensure proper UTF-8 encoding

2. **"Missing required fields"**
   - Check version and timestamp at root
   - Verify all NPCs have required fields
   - Ensure cards have 4 options

3. **"NPC reference not found"**
   - Import NPCs before cards
   - Check NPC ID spelling
   - Use existing NPC IDs

### Import Limits

- Maximum file size: 10MB
- Maximum items per import: 1000
- Processing timeout: 5 minutes

## Activity Logging

All import/export operations are logged:
- Export events show what was exported
- Import events show items added
- User performing the action
- Timestamp of operation

## Future Enhancements

1. **Selective Import**: Choose specific items
2. **Merge Strategies**: Replace, merge, or skip duplicates
3. **Diff View**: Compare before importing
4. **Rollback**: Undo recent imports
5. **Templates**: Pre-made content packs
6. **Validation Rules**: Custom business rules
7. **Scheduling**: Automated exports