# Firebase Setup and Deployment Guide

## Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)
- Your Firebase project: `fantasy-tavern-cashflow-6d6fd`

## Step 1: Login to Firebase
```bash
firebase login
```

## Step 2: Initialize Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/project/fantasy-tavern-cashflow-6d6fd/firestore)
2. Click "Create Database"
3. Choose "Start in production mode"
4. Select location (e.g., us-central1)

## Step 3: Set up Firebase Admin SDK

1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file securely
4. Update `/apps/admin/.env.local` with:
   - `FIREBASE_ADMIN_PRIVATE_KEY`: The private_key field from JSON (keep the \n characters)
   - `FIREBASE_ADMIN_CLIENT_EMAIL`: The client_email field from JSON

## Step 4: Deploy Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## Step 5: Build and Deploy the Apps

### Option 1: Deploy Everything
```bash
npm run deploy
```

### Option 2: Deploy Game Only
```bash
cd apps/game
npm run build
cd ../..
firebase deploy --only hosting:fantasy-tavern-game
```

### Option 3: Deploy Admin Only
```bash
cd apps/admin
npm run build
cd ../..
firebase deploy --only hosting:fantasy-tavern-admin
```

## Step 6: Configure Firebase Hosting Sites

If you haven't set up multiple sites yet:

1. Go to [Firebase Hosting](https://console.firebase.google.com/project/fantasy-tavern-cashflow-6d6fd/hosting/sites)
2. Add a new site called `fantasy-tavern-game`
3. Add another site called `fantasy-tavern-admin`

## Step 7: Initial Data Setup

### Create Initial Game Config
1. Go to Firestore in Firebase Console
2. Create a collection called `gameConfig`
3. Add a document with ID `config` containing:
```json
{
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
  "updatedAt": "SERVER_TIMESTAMP"
}
```

### Create Sample NPCs
1. Create a collection called `npcs`
2. Add documents for different NPC types:

```json
// Example Noble NPC
{
  "id": "noble_1",
  "name": "Lord Aldric",
  "class": "noble",
  "wealth": 4,
  "reliability": 85,
  "portraits": {
    "neutral": "/images/npcs/noble_neutral.png",
    "positive": "/images/npcs/noble_positive.png",
    "negative": "/images/npcs/noble_negative.png"
  },
  "description": "A wealthy noble with expensive tastes",
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```

### Create Sample Cards
1. Create a collection called `cards`
2. Add game cards:

```json
// Example Card
{
  "id": "noble_wine_request",
  "type": "immediate",
  "category": "service",
  "npcId": "noble_1",
  "title": "Fine Wine Request",
  "description": "Lord Aldric wants your finest wine",
  "situation": "Lord Aldric enters your tavern and demands your finest vintage wine. He's willing to pay well, but only if the quality meets his standards.",
  "options": [
    {
      "text": "Serve your best wine (costs 500g)",
      "consequences": {
        "money": 1500,
        "reputation": 10
      },
      "resultText": "The noble is impressed with your selection!",
      "npcEmotion": "positive"
    },
    {
      "text": "Serve regular wine and hope he doesn't notice",
      "consequences": {
        "money": 200,
        "reputation": -20
      },
      "resultText": "The noble immediately recognizes the inferior quality and storms out!",
      "npcEmotion": "negative"
    },
    {
      "text": "Admit you're out of fine wine",
      "consequences": {
        "money": 0,
        "reputation": -5
      },
      "resultText": "The noble appreciates your honesty but leaves disappointed.",
      "npcEmotion": "neutral"
    },
    {
      "text": "Offer a special cocktail instead",
      "consequences": {
        "money": 800,
        "reputation": 5
      },
      "resultText": "Intrigued by your creativity, the noble tries your cocktail.",
      "npcEmotion": "positive"
    }
  ],
  "requirements": {
    "minMoney": 500
  },
  "priority": 2,
  "createdAt": "SERVER_TIMESTAMP",
  "updatedAt": "SERVER_TIMESTAMP"
}
```

## Step 8: Test Your Deployment

1. Visit your game URL: `https://fantasy-tavern-game-6d6fd.web.app`
2. Visit your admin URL: `https://fantasy-tavern-admin-6d6fd.web.app`

## Troubleshooting

### Build Errors
- Make sure all dependencies are installed: `npm install`
- Check that all environment variables are set correctly
- Run `npm run lint` to check for code issues

### Deployment Errors
- Ensure you're logged into the correct Firebase account
- Check that the project ID matches your Firebase project
- Verify Firebase CLI is up to date: `npm update -g firebase-tools`

### Firestore Errors
- Check Firestore rules allow read/write access
- Ensure collections are created with correct names
- Verify indexes are deployed if needed

### Hosting Issues
- Clear browser cache and cookies
- Check Firebase Hosting dashboard for deployment status
- Verify the site names match in firebase.json

## Local Development

To run with Firebase emulators:
```bash
# Terminal 1: Start emulators
npm run emulators

# Terminal 2: Start development server
npm run dev
```

The game will connect to local emulators when `NEXT_PUBLIC_ENVIRONMENT=development`.