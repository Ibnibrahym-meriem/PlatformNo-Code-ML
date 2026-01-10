import axios from 'axios';

// ⚠️ PORT 8005 CONFIGURÉ ICI SELON VOTRE RUN.PY
const API_URL = 'http://127.0.0.1:8005/preprocess';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token (si authentification active)
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const PreprocessingService = {
  // 1. Récupérer les infos (KPIs, Stats, Preview)
  getInfo: async (sessionId) => {
    const response = await apiClient.post('/info', { session_id: sessionId });
    return response.data;
  },

  // 2. Auto-Pipeline (Bouton Magique)
  runAutoPipeline: async (sessionId, targetColumn) => {
    const response = await apiClient.post('/auto-pipeline', { 
      session_id: sessionId, 
      target_column: targetColumn 
    });
    return response.data;
  },

  // 3. Nettoyage
  cleanData: async (sessionId, dropDuplicates, strategies) => {
    // strategies format: [{ column: "age", method: "mean", value: null }]
    const response = await apiClient.post('/clean', {
      session_id: sessionId,
      drop_duplicates: dropDuplicates,
      strategies: strategies
    });
    return response.data;
  },

  // 4. Encodage
  encodeData: async (sessionId, strategies, targetColumn) => {
    // strategies format: [{ column: "sex", method: "onehot" }]
    const response = await apiClient.post('/encode', {
      session_id: sessionId,
      strategies: strategies,
      target_column: targetColumn
    });
    return response.data;
  },

  // 5. Outliers
  handleOutliers: async (sessionId, columns, method, threshold, action) => {
    const response = await apiClient.post('/outliers', {
      session_id: sessionId,
      columns: columns,
      method: method,
      threshold: parseFloat(threshold),
      action: action
    });
    return response.data;
  },

  // 6. Normalisation
  normalizeData: async (sessionId, columns, method) => {
    const response = await apiClient.post('/normalize', {
      session_id: sessionId,
      columns: columns,
      method: method
    });
    return response.data;
  },

  // 7. Équilibrage
  balanceData: async (sessionId, targetColumn, method) => {
    const response = await apiClient.post('/balance', {
      session_id: sessionId,
      target_column: targetColumn,
      method: method
    });
    return response.data;
  }
};

export default PreprocessingService;