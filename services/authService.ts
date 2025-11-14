import { User } from '../types';

/**
 * Authenticates a user against the MongoDB backend API.
 * Makes a POST request to the backend with email and password.
 * 
 * @param email The user's email address.
 * @param password The user's password.
 * @returns A Promise that resolves to the authenticated User object.
 * @throws An error if authentication fails or if the backend is not available.
 */
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const apiUrl = import.meta.env.API_URL || 'http://localhost:5000';

    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      const user: User = {
        _id: { $oid: data.user.id },
        email: data.user.email,
        role: data.user.role,
        clientId: data.user.clientId,
        created_at: { $date: { $numberLong: Date.now().toString() } },
      };
      return user;
    } else {
      throw new Error(data.error || 'Authentication failed');
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(`Backend connection failed: ${errorMessage}`);
  }
};
