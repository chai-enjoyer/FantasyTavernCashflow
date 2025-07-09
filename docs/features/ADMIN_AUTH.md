# Admin Panel Authentication

The admin panel now uses Firebase Authentication with email/password login.

## Creating Admin Users

Since the admin panel doesn't have public user registration, you need to create admin users manually.

### Method 1: Using Firebase Console (Recommended)

1. Go to your [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Authentication > Users
4. Click "Add user"
5. Enter the email and password for the admin user
6. Click "Add user"

### Method 2: Using the CLI Script

Run the following command from the project root:

```bash
npm run admin:create-user
```

Follow the interactive prompts to create a new admin user.

### Method 3: Command Line Arguments

```bash
node scripts/createAdminUser.js admin@example.com password123 "Admin Name"
```

## Logging In

1. Navigate to your admin panel URL
2. Enter the email and password you created
3. Click "Sign In"

## Password Reset

If an admin forgets their password:

1. Click "Forgot password?" on the login page
2. Enter the admin email address
3. Check email for reset link
4. Follow the link to reset password

## Security Notes

- Admin accounts should use strong passwords
- Enable 2FA in Firebase Console for additional security
- Regularly audit admin user list
- Remove unused admin accounts promptly

## Troubleshooting

### "Invalid API Key" Error
Make sure your `.env.local` file contains the correct Firebase configuration.

### "User not found" Error
Ensure the user was created in the correct Firebase project.

### "Network error" 
Check your internet connection and Firebase project status.