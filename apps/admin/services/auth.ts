import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '@repo/firebase';

export interface AdminUser {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'admin' | 'viewer';
  createdAt: Date;
  lastLogin: Date;
}

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Log the sign in event
      console.log(`Admin user signed in: ${userCredential.user.email}`);
      
      return userCredential.user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      console.log('Admin user signed out');
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Create a new admin user
   */
  async createAdminUser(
    email: string, 
    password: string, 
    displayName: string
  ): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update the user's display name
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      console.log(`New admin user created: ${email}`);
      return userCredential.user;
    } catch (error: any) {
      console.error('Create user error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log(`Password reset email sent to: ${email}`);
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Get the current user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  /**
   * Handle auth errors and return user-friendly messages
   */
  private handleAuthError(error: any): Error {
    const errorCode = error.code;
    let message = 'An authentication error occurred';

    switch (errorCode) {
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/email-already-in-use':
        message = 'An account already exists with this email';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/invalid-credential':
        message = 'Invalid email or password';
        break;
      default:
        message = error.message || message;
    }

    return new Error(message);
  }
}

export default AuthService.getInstance();