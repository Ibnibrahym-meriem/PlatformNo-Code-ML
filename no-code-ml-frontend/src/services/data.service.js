import axiosClient from '../api/axiosClient';

const dataService = {
  // 1. UPLOAD (CSV, Excel, JSON)
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/data/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 2. KAGGLE SEARCH
  searchKaggle: (query) => {
    return axiosClient.get(`/data/kaggle/search?query=${query}`);
  },

  // 3. KAGGLE IMPORT
  ingestKaggle: (datasetId) => {
    return axiosClient.get(`/data/kaggle?dataset=${datasetId}`);
  },

  // 4. SAUVEGARDE DES CLÉS
  saveKaggleKeys: (username, key) => {
    return axiosClient.patch('/users/me', { 
      kaggle_username: username, 
      kaggle_key: key 
    });
  },

  // 5. QUICK START
  ingestQuickStart: (datasetName) => {
    return axiosClient.get(`/data/quick-start?dataset=${datasetName}`);
  },

  // 6. SCRAPE
  scrapePreview: (url) => {
    return axiosClient.post('/data/scrape/preview', { url });
  },
  scrapeSelect: (sessionId, selectedIndices) => {
    return axiosClient.post('/data/scrape/select', { 
      session_id: sessionId, 
      selected_indices: selectedIndices, 
      merge: false 
    });
  },

  // 7. GENERATE (CORRIGÉ)
  
  // Note: Attend 3 arguments séparés pour correspondre au backend
  generateSimple: (n_rows, n_cols, task) => {
    return axiosClient.post('/data/generate/simple', { n_rows, n_cols, task });
  },

  // AJOUT DE CETTE FONCTION MANQUANTE
  generateCustom: (payload) => {
    // Le payload est déjà un objet complet formaté par le composant
    return axiosClient.post('/data/generate/custom', payload);
  },

  // 8. MANUAL
  ingestManual: (jsonData) => {
    return axiosClient.post('/data/manual', { data: jsonData });
  }
};

export default dataService;