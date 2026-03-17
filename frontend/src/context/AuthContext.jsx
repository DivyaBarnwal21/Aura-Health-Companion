import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = 'http://localhost:5000';

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on first load
  useEffect(() => {
    const savedToken = localStorage.getItem('aura_token');
    const savedUser  = localStorage.getItem('aura_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await axios.post(`${API_URL}/login`, { username, password });
    const { token: tok, user: usr } = res.data;
    setToken(tok);
    setUser(usr);
    localStorage.setItem('aura_token', tok);
    localStorage.setItem('aura_user', JSON.stringify(usr));
    axios.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
    return usr;
  };

  const register = async (username, password, email, full_name) => {
    const res = await axios.post(`${API_URL}/register`, { username, password, email, full_name });
    const { token: tok, user: usr } = res.data;
    setToken(tok);
    setUser(usr);
    localStorage.setItem('aura_token', tok);
    localStorage.setItem('aura_user', JSON.stringify(usr));
    axios.defaults.headers.common['Authorization'] = `Bearer ${tok}`;
    return usr;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('aura_token');
    localStorage.removeItem('aura_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
