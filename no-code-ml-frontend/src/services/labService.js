import axiosClient from '../api/axiosClient';

const labService = {
  getInfo: (sessionId) => axiosClient.post('/preprocess/info', { session_id: sessionId }),

  // Mise à jour : ajout du paramètre dropDuplicates explicite
  clean: (sessionId, strategies = [], autoClean = false, dropDuplicates = false) => {
    return axiosClient.post('/preprocess/clean', {
      session_id: sessionId,
      auto_clean: autoClean,
      drop_duplicates: dropDuplicates || autoClean, // Si auto, ou si demandé explicitement
      strategies: strategies 
    });
  },

  encode: (sessionId, strategies, autoEncode) => axiosClient.post('/preprocess/encode', { session_id: sessionId, auto_encode: autoEncode, strategies }),
  normalize: (sessionId, cols, method) => axiosClient.post('/preprocess/normalize', { session_id: sessionId, method, columns: cols }),
  outliers: (sessionId, cols, action) => axiosClient.post('/preprocess/outliers', { session_id: sessionId, method: "iqr", action, columns: cols }),
  balance: (sessionId, target, method) => axiosClient.post('/preprocess/balance', { session_id: sessionId, target_column: target, method }),
};

export default labService;