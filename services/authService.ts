import { User } from '../types';

/**
 * Makes a login request to a live backend API.
 * The backend is responsible for validating credentials against the database.
 * @param email The user's email
 * @param password The user's password
 * @returns A promise that resolves with the User object on success or rejects with an error on failure.
 */
export const login = async (email: string, password: string): Promise<User> => {
  // In a real application, you would replace '/api/login' with your actual backend authentication endpoint.
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
    // Handle other server errors (e.g., 500)
    throw new Error('An error occurred during login. Please try again later.');
  }

  const user: User = await response.json();
  console.log('Authentication successful for user:', user.email);
  return user;
};
