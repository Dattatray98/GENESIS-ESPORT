import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;
const apiClient = axios.create({
    baseURL: baseURL.endsWith('/') ? baseURL : `${baseURL}/`,
});

// Add a request interceptor to add the auth token to every request
apiClient.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('bgmi_user') || 'null');
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default apiClient;
