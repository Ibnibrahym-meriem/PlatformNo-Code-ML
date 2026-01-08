import axiosClient from '../api/axiosClient';

const visService = {
  // 1. Récupérer les colonnes (Numériques vs Catégorielles)
  getColumns: (sessionId) => {
    return axiosClient.get(`/vis/columns/${sessionId}`);
  },

  // 2. Histogramme (POST avec session_id et column)
  getHistogram: (sessionId, column) => {
    return axiosClient.post('/vis/histogram', { session_id: sessionId, column });
  },

  // 3. Scatter Plot (POST avec x et y)
  getScatter: (sessionId, xColumn, yColumn) => {
    return axiosClient.post('/vis/scatter', { 
      session_id: sessionId, 
      x_column: xColumn, 
      y_column: yColumn 
    });
  },

  // 4. Camembert / Barres (Catégories)
  getCategorical: (sessionId, column) => {
    return axiosClient.post('/vis/categorical', { session_id: sessionId, column });
  },

  // 5. Corrélation (GET)
  getCorrelation: (sessionId) => {
    return axiosClient.get(`/vis/correlation/${sessionId}`);
  },

  // 6. Boxplot (Outliers)
  getBoxplot: (sessionId, column) => {
    return axiosClient.post('/vis/boxplot', { session_id: sessionId, column });
  }
};

export default visService;