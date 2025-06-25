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
        const response = await axios.get('http://localhost:5000/user/all', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchUsersForBinManagement = async () => {
    try {
        const response = await axios.get('http://localhost:5000/user/bin-management', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const collectBin = async (userId) => {
    try {
        const response = await axios.post(`http://localhost:5000/user/collect-bin/${userId}`, {}, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const resetPassword = async (token, newPassword) => {
    try {
        const response = await axios.post('http://localhost:5000/user/reset-password', {
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
        const response = await axios.post('http://localhost:5000/user/forgot-password', { email });
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Get all routes (admin)
export const fetchAllRoutes = (token) =>
  axios.get(`${API_URL}/`, { headers: { Authorization: `Bearer ${token}` } });

// Get all unassigned routes (admin)
export const fetchUnassignedRoutes = (token) =>
  axios.get(`${API_URL}/api/routes/unassigned`, { headers: { Authorization: `Bearer ${token}` } });

// Assign a route to a company (admin)
export const assignRouteToCompany = (routeId, companyId, token) =>
  axios.post(`${API_URL}/api/routes/assign`, { routeId, companyId }, { headers: { Authorization: `Bearer ${token}` } });

// Get routes for a specific company (admin)
export const fetchCompanyRoutes = (companyId, token) =>
  axios.get(`${API_URL}/company/${companyId}`, { headers: { Authorization: `Bearer ${token}` } });

// Get routes for the authenticated company (for map display)
export const fetchMyRoutes = (token) =>
  axios.get('http://localhost:5000/api/routes/my', { headers: { Authorization: `Bearer ${token}` } });

// Get all companies for dropdown
export const fetchAllCompanies = (token) =>
  axios.get('http://localhost:5000/user/companies', { headers: { Authorization: `Bearer ${token}` } });

// Fetch all payments for the current company
export const fetchCompanyPayments = async () => {
    try {
        const response = await axios.get('http://localhost:5000/api/payments/company-history', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data.payments;
    } catch (error) {
        throw error;
    }
};

// Fetch alerts for a company (admin)
export async function fetchCompanyAlerts(token, status) {
  const url = `http://localhost:5000/admin/alerts${status ? `?status=${status}` : ''}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

// Resolve an alert
export async function resolveAlert(token, alertId) {
  const res = await fetch(`http://localhost:5000/admin/alerts/${alertId}/resolve`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to resolve alert');
  return res.json();
}

export default api; 