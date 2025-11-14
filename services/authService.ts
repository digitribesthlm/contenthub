import { User } from '../types';

/**
 * MOCK LOGIN FOR DEVELOPMENT
 * 
 * This function simulates a login request to a backend API.
 * It allows you to test the application's UI without a live backend.
 * 
 * To switch to production, replace the contents of this function
 * with a real `fetch` call to your authentication endpoint.
 * 
 * Development credentials:
 * - email: test@example.com
 * - password: password
 */
export const login = async (email: string, password: string): Promise<User> => {
  console.log("--- DEVELOPMENT MODE: Simulating login ---");

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === 'test@example.com' && password === 'password') {
        const mockUser: User = {
          _id: { $oid: '6750d1d3aaba4edf40a3b8df' },
          email: 'test@example.com',
          role: 'client',
          clientId: 'client-123', // This clientId will be used to filter data
          created_at: { $date: { $numberLong: Date.now().toString() } },
        };
        console.log('Mock authentication successful for user:', mockUser.email);
        resolve(mockUser);
      } else {
        console.error('Mock authentication failed. Attempted with email:', email);
        reject(new Error('Invalid email or password'));
      }
    }, 500); // Simulate network delay
  });

  /*
  // --- PRODUCTION CODE ---
  // When your backend is ready, delete the Promise code above and
  // uncomment the fetch call below.
  
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
  */
};