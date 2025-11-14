import { User } from '../types';

// This is a mock database record that matches the schema provided.
// In a real application, this would come from your MongoDB 'users' collection.
const MOCK_USER: User & { password: Required<User>['password'] } = {
  _id: { $oid: '6750d1d3aaba4edf40a3b8df' },
  email: 'tt@tt.se',
  password: 'sfsdf!',
  role: 'client',
  clientId: '6728ba02768b0b66c95ccadbc8',
  created_at: { $date: { $numberLong: '1730722306681' } },
};

/**
 * Simulates a login request to a backend API.
 * In a real application, this would make a `fetch` call to your authentication endpoint,
 * which would then query the MongoDB `users` collection.
 * @param email The user's email
 * @param password The user's password
 * @returns A promise that resolves with the User object on success or rejects with an error on failure.
 */
export const login = (email: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email.toLowerCase() === MOCK_USER.email && password === MOCK_USER.password) {
        console.log('Authentication successful for user:', MOCK_USER.email);
        // Omit the password when returning the user object, which is a good practice.
        const { password: _, ...userWithoutPassword } = MOCK_USER;
        resolve(userWithoutPassword);
      } else {
        console.error(`Authentication failed. Attempted with email: "${email}" and password: "${password}"`);
        console.log('Expected credentials for mock user:', { email: MOCK_USER.email, password: MOCK_USER.password });
        reject(new Error('Invalid email or password'));
      }
    }, 1000); // Simulate network delay
  });
};
