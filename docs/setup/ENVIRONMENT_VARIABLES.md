# Environment Variables

## Overview

Both the game and admin applications require environment variables to connect to Firebase services. These should be stored in `.env.local` files in their respective directories.

## Required Variables

### Firebase Configuration

These variables are required for both `apps/game/.env.local` and `apps/admin/.env.local`:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Firebase Measurement ID for analytics
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Optional: Use emulators in development
NEXT_PUBLIC_USE_EMULATORS=false
```

### Getting Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click on the gear icon → Project settings
4. Scroll down to "Your apps" section
5. Select the web app
6. Copy the configuration values

### Environment File Structure

```
fantasy-tavern-cashflow/
├── apps/
│   ├── game/
│   │   └── .env.local    # Game app environment variables
│   └── admin/
│       └── .env.local    # Admin app environment variables
└── .env.example          # Example template
```

## Creating Environment Files

1. Create `.env.local` files:
```bash
# For game app
cp .env.example apps/game/.env.local

# For admin app
cp .env.example apps/admin/.env.local
```

2. Edit each file with your Firebase configuration

## Security Best Practices

1. **Never commit `.env.local` files**: They are already in `.gitignore`
2. **Use different Firebase projects** for development and production
3. **Restrict API keys** in Firebase Console to specific domains
4. **Enable App Check** for additional security

## Environment-Specific Settings

### Development
```bash
# Enable Firebase emulators
NEXT_PUBLIC_USE_EMULATORS=true
```

### Production
```bash
# Disable emulators
NEXT_PUBLIC_USE_EMULATORS=false

# Enable analytics
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

## Verifying Configuration

After setting up environment variables:

1. Run the development server:
```bash
npm run dev
```

2. Check the browser console for any Firebase errors

3. Verify connection by checking:
   - Game app loads without errors
   - Admin panel authentication works
   - Data loads from Firestore

## Troubleshooting

### Common Issues

1. **"Firebase: No Firebase App '[DEFAULT]' has been created"**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Restart the development server

2. **"Missing or insufficient permissions"**
   - Check Firestore security rules
   - Ensure authentication is working
   - Verify project ID is correct

3. **"Failed to load resource"**
   - Check Storage bucket configuration
   - Verify CORS settings for Storage
   - Ensure bucket name is correct

## Additional Configuration

### Firebase Emulators

If using Firebase emulators for local development:

```bash
# Start emulators
firebase emulators:start

# In .env.local
NEXT_PUBLIC_USE_EMULATORS=true
```

### Custom Domains

For production deployments with custom domains:

1. Add authorized domains in Firebase Console
2. Update CORS configuration for Storage
3. Configure Firebase Hosting rewrites