import axios from 'axios';

// ⚠️ Assurez-vous que le port est bien 8005
const API_URL = 'http://127.0.0.1:8005/training'; 

const trainingService = {
    // 1. Détection du type de problème
    detectProblemType: async (sessionId, targetColumn) => {
        return axios.post(`${API_URL}/detect-problem-type`, {
            session_id: sessionId,
            target_column: targetColumn
        });
    },

    // 2. Récupérer la config des hyperparamètres (sliders, options)
    getHyperparameters: async (algoName) => {
        return axios.get(`${API_URL}/hyperparameters/${algoName}`);
    },

    // 3. Lancer l'entraînement
    trainModels: async (payload) => {
        return axios.post(`${API_URL}/train`, payload);
    },

    // 4. Générer l'URL du rapport PDF
    getReportUrl: (filename) => {
        return `${API_URL}/download/report/${filename}`;
    }
};

export default trainingService;