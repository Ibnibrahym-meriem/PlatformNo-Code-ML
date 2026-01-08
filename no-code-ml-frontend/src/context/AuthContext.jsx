import { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    if (token) {
      authService.me()
        .then(response => setUser(response.data))
        .catch(() => logout()); // Si le token est invalide, on déconnecte
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    const response = await authService.login(username, password);
    const accessToken = response.data.access_token;
    
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
    // On récupère les infos user juste après
    const userResp = await authService.me();
    setUser(userResp.data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!token, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);