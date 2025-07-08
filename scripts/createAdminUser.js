#!/usr/bin/env node

/**
 * Script to create an admin user for the admin panel
 * Usage: node scripts/createAdminUser.js <email> <password> [displayName]
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth');
const readline = require('readline');

// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../apps/admin/.env.local') });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdminUser() {
  console.log('🛡️  Create Admin User for Fantasy Tavern Admin Panel\n');

  try {
    // Get email
    const email = await question('Email address: ');
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }

    // Get password
    const password = await question('Password (min 6 characters): ');
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Get display name
    const displayName = await question('Display name (optional): ');

    console.log('\nCreating admin user...');
    
    // Create user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name if provided
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    console.log('\n✅ Admin user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`UID: ${userCredential.user.uid}`);
    if (displayName) {
      console.log(`Display Name: ${displayName}`);
    }
    console.log('\nYou can now log in to the admin panel with these credentials.');
    
  } catch (error) {
    console.error('\n❌ Error creating admin user:');
    if (error.code === 'auth/email-already-in-use') {
      console.error('An account with this email already exists.');
    } else if (error.code === 'auth/weak-password') {
      console.error('Password is too weak. Please use a stronger password.');
    } else if (error.code === 'auth/invalid-email') {
      console.error('Invalid email address format.');
    } else {
      console.error(error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
  
  process.exit(0);
}

// Check for command line arguments
if (process.argv.length >= 4) {
  // Use command line arguments
  const [,, email, password, displayName] = process.argv;
  
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      console.log('✅ Admin user created successfully!');
      console.log(`Email: ${email}`);
      console.log(`UID: ${userCredential.user.uid}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error.message);
      process.exit(1);
    });
} else {
  // Interactive mode
  createAdminUser();
}