import axios from 'axios';

const API_BASE_URL = 'https://5zdiwo4lfl.execute-api.ap-south-1.amazonaws.com/api/v1';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const submitTriage = async (symptoms, language, patientId) => {
    const response = await apiClient.post('/triage/triage', { symptoms, language, patient_id: patientId });
    return response.data;
};

export const sendChatMessage = async (message, language, sessionId, patientId) => {
    const response = await apiClient.post('/chatbot/chat', {
        message,
        language,
        session_id: sessionId,
        patient_id: patientId
    });
    return response.data;
};

export const getAnalyticsSummary = async () => {
    const response = await apiClient.get('/analytics/summary');
    return response.data;
};

export default apiClient;
