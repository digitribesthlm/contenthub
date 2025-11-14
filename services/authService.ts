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
  console.log('\n🔐 === LOGIN FLOW ===');
  console.log('📧 Email:', email);
  console.log('🔑 Password length:', password.length);
  console.log('⏰ Time:', new Date().toISOString());

  try {
    console.log('\n🔄 Connecting to MongoDB backend...');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log('📡 API URL:', apiUrl);

    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    console.log('✓ Backend responded with status:', response.status);
    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ LOGIN SUCCESS!');
      console.log('👤 User:', data.user.email);
      console.log('🆔 ClientId:', data.user.clientId);
      
      const user: User = {
        _id: { $oid: data.user.id },
        email: data.user.email,
        role: data.user.role,
        clientId: data.user.clientId,
        created_at: { $date: { $numberLong: Date.now().toString() } },
      };
      return user;
    } else {
      console.error('❌ LOGIN FAILED:', data.error);
      throw new Error(data.error || 'Authentication failed');
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('❌ BACKEND ERROR:', errorMessage);
    throw new Error(`Backend connection failed: ${errorMessage}`);
  }
};
