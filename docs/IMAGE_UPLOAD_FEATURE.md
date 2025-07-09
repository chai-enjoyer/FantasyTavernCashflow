# Image Upload Feature

## Overview
The admin panel now includes an image upload feature in the Import/Export page that allows you to upload portrait images for NPCs directly to Firebase Storage.

## Features
- Upload neutral, positive, and negative portraits for NPCs
- Support for JPEG, PNG, and WebP formats
- Maximum file size: 5MB per image
- Automatic validation of file type and size
- Generated Firebase Storage URLs that can be used in NPC data
- Clean, user-friendly interface with error handling

## How to Use

1. Navigate to the Import/Export page in the admin panel
2. Click on the "Image Upload" section to expand it
3. Enter the NPC ID (e.g., "merchant_bob")
4. Select one or more portrait images:
   - Neutral Portrait: Default expression
   - Positive Portrait: Happy/pleased expression
   - Negative Portrait: Angry/displeased expression
5. Click "Upload Images"
6. Once uploaded, the Firebase Storage URLs will be displayed
7. Click on any URL field to select it for copying
8. Use these URLs in the NPC portraits field when creating or editing NPCs

## Technical Details

### Firebase Storage Structure
Images are stored in Firebase Storage with the following path structure:
```
npcs/{npcId}/{portrait_type}.{extension}
```

Example:
- `npcs/merchant_bob/neutral.jpg`
- `npcs/merchant_bob/positive.png`
- `npcs/merchant_bob/negative.webp`

### Implementation Files
- `/packages/firebase/src/services/imageUpload.ts` - Core upload functionality
- `/packages/firebase/src/config.ts` - Firebase Storage initialization
- `/apps/admin/app/import-export/page.tsx` - UI implementation

### Security Considerations
- File type validation (only image formats allowed)
- File size limit (5MB)
- Proper error handling and cleanup on failed uploads
- Firebase Storage security rules should be configured to allow authenticated admin users to upload

## Firebase Storage Setup

Make sure your Firebase project has Storage enabled:

1. Go to Firebase Console
2. Navigate to Storage
3. Click "Get started"
4. Set up security rules (example for admin-only access):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /npcs/{npcId}/{fileName} {
      allow read: if true;  // Public read access
      allow write: if request.auth != null;  // Authenticated write access
    }
  }
}
```

## Environment Variables
The storage bucket is configured using the same environment variables as other Firebase services:
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` or `VITE_FIREBASE_STORAGE_BUCKET`

## Error Handling
The feature includes comprehensive error handling for:
- Invalid file types
- Files exceeding size limit
- Network errors during upload
- Missing NPC ID
- No files selected

## Future Enhancements
- Bulk upload for multiple NPCs
- Image preview before upload
- Image cropping/resizing
- Direct integration with NPC creation/editing forms
- Ability to delete uploaded images