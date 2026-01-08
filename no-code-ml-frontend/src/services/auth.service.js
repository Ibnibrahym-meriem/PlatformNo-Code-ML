import axiosClient from '../api/axiosClient';

const authService = {
  login: async (email, password) => {
    // 1. On utilise URLSearchParams pour le format x-www-form-urlencoded
    const params = new URLSearchParams();
    
    // 2. IMPORTANT : FastAPI attend le champ 'username', on lui donne l'email
    params.append('username', email); 
    params.append('password', password);

    return axiosClient.post('/auth/jwt/login', params, {
      headers: { 
        // 3. On force le bon Content-Type
        'Content-Type': 'application/x-www-form-urlencoded' 
      }
    });
  },

  register: async (userData) => {
    // Le registre, lui, attend du JSON classique, donc pas de changement ici
    return axiosClient.post('/auth/register', userData);
  },

  me: async () => {
    return axiosClient.get('/users/me');
  }
};

export default authService;