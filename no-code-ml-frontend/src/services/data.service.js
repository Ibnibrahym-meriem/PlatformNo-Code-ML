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
  // Appelle @router.get("/kaggle/search")
  searchKaggle: (query) => {
    return axiosClient.get(`/data/kaggle/search?query=${query}`);
  },

  // 3. KAGGLE IMPORT
  // Appelle @router.get("/kaggle") avec le paramètre 'dataset'
  ingestKaggle: (datasetId) => {
    return axiosClient.get(`/data/kaggle?dataset=${datasetId}`);
  },

  // 4. SAUVEGARDE DES CLÉS (Tentative via route standard User)
  // Puisqu'on ne touche pas au backend ingestion, on tente la route User standard
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

  // 7. GENERATE & MANUAL
  generateSimple: (n_rows, n_cols, task) => {
    return axiosClient.post('/data/generate/simple', { n_rows, n_cols, task });
  },
  ingestManual: (jsonData) => {
    return axiosClient.post('/data/manual', { data: jsonData });
  }
};

export default dataService;