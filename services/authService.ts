import { User } from '../types';

/**
 * Authenticates a user by making a POST request to the backend API.
 * 
 * @param email The user's email address.
 * @param password The user's password.
 * @returns A Promise that resolves to the authenticated User object.
 * @throws An error if authentication fails or if there's a network issue.
 */
export const login = async (email: string, password: string): Promise<User> => {
  // This is the production-ready code.
  // It expects a backend server to be running and listening at '/api/login'.
  
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (response.status === 401) {
    throw new Error('Invalid email or password');
  }

  if (!response.ok) {
    throw new Error('An error occurred during login. Please try again later.');
  }

  const user: User = await response.json();
  console.log('Authentication successful for user:', user.email);
  return user;
};
