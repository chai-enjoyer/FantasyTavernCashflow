# Telegram Mini App Setup Guide

## Prerequisites
- Your bot token: `8034553428:AAFzfxGAhgaYy-WKqDuB5d8jNDuMQ12SR7s`
- Your bot username: `@FantasyTavernCashflowBot`

## Step 1: Configure Bot with BotFather

1. Open Telegram and search for `@BotFather`
2. Send the following commands:

### Set Bot Menu Button
```
/mybots
→ Select @FantasyTavernCashflowBot
→ Bot Settings
→ Menu Button
→ Configure menu button
→ Enter URL: https://fantasy-tavern-cashflow-6d6fd.web.app
→ Enter button text: Play Game
```

### Set Bot Description
```
/setdescription
→ Select @FantasyTavernCashflowBot
→ Enter: 🏰 Manage your fantasy tavern! Make strategic decisions, serve magical customers, and build your fortune in this engaging business simulation game.
```

### Set About Text
```
/setabouttext
→ Select @FantasyTavernCashflowBot
→ Enter: Fantasy Tavern Cashflow - A strategic tavern management game where every decision counts!
```

### Set Bot Commands (Optional)
```
/setcommands
→ Select @FantasyTavernCashflowBot
→ Enter:
start - Start the game
help - Get help
stats - View your statistics
```

## Step 2: Enable Inline Mode (Optional)
```
/setinline
→ Select @FantasyTavernCashflowBot
→ Enter placeholder text: Search for game actions...
```

## Step 3: Configure Web App
```
/newapp
→ Select @FantasyTavernCashflowBot
→ Enter the following:
- Title: Fantasy Tavern Cashflow
- Description: Manage your fantasy tavern
- Photo: Upload a 640x360px image (optional)
- Web App URL: https://fantasy-tavern-cashflow-6d6fd.web.app
- Short name: fantasy_tavern
```

## Step 4: Test Your Bot

1. Open your bot: `@FantasyTavernCashflowBot`
2. Click the menu button (it should show "Play Game")
3. The Mini App should open

## Deployment URLs

After deploying to Firebase, your app will be available at:
- Game: `https://fantasy-tavern-cashflow-6d6fd.web.app`
- Admin: `https://fantasy-tavern-admin.web.app` (if you set up multiple sites)

## Important Notes

1. **HTTPS Required**: Telegram Mini Apps only work over HTTPS. Firebase Hosting provides this automatically.

2. **Testing Locally**: For local development, you can use ngrok:
   ```bash
   npx ngrok http 3000
   ```
   Then update the bot's Web App URL to the ngrok URL temporarily.

3. **User Authentication**: The app automatically receives user data from Telegram (ID, username, etc.)

4. **Viewport**: The app is responsive and works in Telegram's webview

## Troubleshooting

### Mini App doesn't open
- Check that the URL is correct and uses HTTPS
- Ensure the bot token is valid
- Clear Telegram cache: Settings → Data and Storage → Storage Usage → Clear Cache

### User data not received
- Make sure you're opening the app through Telegram
- Check browser console for errors
- Verify the Telegram Web App script is loaded

### Bot commands not working
- Restart the bot with `/start`
- Check that commands are set correctly with BotFather
- Ensure your bot token is correct in `.env.local`