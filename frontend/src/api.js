import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const submitTriage = async (symptoms, language) => {
    const response = await apiClient.post('/triage/triage', { symptoms, language });
    return response.data;
};

export const sendChatMessage = async (message, language, sessionId) => {
    const response = await apiClient.post('/chatbot/chat', { message, language, session_id: sessionId });
    return response.data;
};

export const getAnalyticsSummary = async () => {
    const response = await apiClient.get('/analytics/summary');
    return response.data;
};

export default apiClient;
