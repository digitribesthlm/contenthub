import { User } from '../types';
import { findUserByCredentials } from './mongoService';

/**
 * Login function that queries MongoDB users collection
 * Uses simple string comparison for password as requested
 * @param email The user's email
 * @param password The user's password
 * @returns A promise that resolves with the User object on success or rejects with an error on failure.
 */
export const login = async (email: string, password: string): Promise<User> => {
  try {
    console.log('Attempting authentication for user:', email);
    
    const user = await findUserByCredentials(email, password);
    
    if (user) {
      console.log('Authentication successful for user:', user.email);
      // Omit the password when returning the user object
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } else {
      console.log('Authentication failed: Invalid credentials');
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    console.error('Authentication error:', error);
    throw new Error('Invalid email or password');
  }
};
