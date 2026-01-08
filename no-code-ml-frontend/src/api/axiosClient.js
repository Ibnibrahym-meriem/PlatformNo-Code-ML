import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://127.0.0.1:8005/', // L'URL de votre FastAPI
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;



