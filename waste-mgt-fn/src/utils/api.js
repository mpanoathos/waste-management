import axios from 'axios';
import { toast } from 'react-toastify';

const API_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || 'An error occurred';
        
        // Handle specific error cases
        if (error.response?.status === 401) {
            // Handle unauthorized access
            localStorage.removeItem('token');
            window.location.href = '/';
        }

        // Show error toast
        toast.error(message);
        
        return Promise.reject(error);
    }
);

export const fetchUsers = async () => {
    try {
        const response = await api.get('/user/all');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const collectBin = async (userId) => {
    try {
        const response = await api.post(`/user/${userId}/collect`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const resetPassword = async (token, newPassword) => {
    try {
        const response = await api.post('/user/reset-password', {
            token,
            newPassword
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const forgotPassword = async (email) => {
    try {
        const response = await api.post('/user/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export default api; 