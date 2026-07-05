import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('rabbit_token');
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data && res.data.user) {
            setUser(res.data.user);
          } else if (res.data && res.data.success !== false) {
             // Depending on backend structure, it might return the user directly
             setUser(res.data.data || res.data);
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          localStorage.removeItem('rabbit_token');
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('rabbit_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('rabbit_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
