// src/services/data.service.js
import axiosClient from '../api/axiosClient';

const dataService = {
  // 1. UPLOAD
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient.post('/data/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 2. KAGGLE
  searchKaggle: (query) => {
    return axiosClient.get(`/data/kaggle/search?query=${query}`);
  },
  ingestKaggle: (datasetId) => {
    return axiosClient.get(`/data/kaggle?dataset=${datasetId}`);
  },

  // 3. QUICK START
  ingestQuickStart: (datasetName) => {
    return axiosClient.get(`/data/quick-start?dataset=${datasetName}`);
  },

  // 4. SCRAPE (2 étapes : Preview puis Select)
  scrapePreview: (url) => {
    return axiosClient.post('/data/scrape/preview', { url });
  },
  scrapeSelect: (sessionId, selectedIndices) => {
    // Backend attend: { session_id, selected_indices: [0], merge: false }
    return axiosClient.post('/data/scrape/select', { 
      session_id: sessionId, 
      selected_indices: selectedIndices, 
      merge: false 
    });
  },

  // 5. GENERATE
  generateSimple: (n_rows, n_cols, task) => {
    return axiosClient.post('/data/generate/simple', { n_rows, n_cols, task });
  },

  // 6. MANUAL
  ingestManual: (jsonData) => {
    // Backend attend: { data: [{...}, {...}] }
    return axiosClient.post('/data/manual', { data: jsonData });
  }
};

export default dataService;