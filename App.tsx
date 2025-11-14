
import React, { useState, useCallback } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { User } from './types';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const handleLoginSuccess = useCallback((user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  }, []);
  
  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {isAuthenticated && currentUser ? (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default App;
