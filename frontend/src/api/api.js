import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth API
export const authAPI = {
  login: (username, password) =>
    axios.post(`${API_BASE}/auth/login`, { username, password }),
  
  getCurrentUser: () =>
    axios.get(`${API_BASE}/auth/me`, { headers: getAuthHeaders() }),
};

// Restaurant API
export const restaurantAPI = {
  getAll: () =>
    axios.get(`${API_BASE}/restaurants`, { headers: getAuthHeaders() }),
  
  getById: (id) =>
    axios.get(`${API_BASE}/restaurants/${id}`, { headers: getAuthHeaders() }),
  
  getMenu: (id) =>
    axios.get(`${API_BASE}/restaurants/${id}/menu`, { headers: getAuthHeaders() }),
};

// Order API
export const orderAPI = {
  create: (orderData) =>
    axios.post(`${API_BASE}/orders`, orderData, { headers: getAuthHeaders() }),
  
  getAll: () =>
    axios.get(`${API_BASE}/orders`, { headers: getAuthHeaders() }),
  
  getById: (id) =>
    axios.get(`${API_BASE}/orders/${id}`, { headers: getAuthHeaders() }),
  
  checkout: (id) =>
    axios.post(`${API_BASE}/orders/${id}/checkout`, {}, { headers: getAuthHeaders() }),
  
  cancel: (id) =>
    axios.put(`${API_BASE}/orders/${id}/cancel`, {}, { headers: getAuthHeaders() }),
};

// Payment Method API
export const paymentAPI = {
  getAll: () =>
    axios.get(`${API_BASE}/payment-methods`, { headers: getAuthHeaders() }),
  
  create: (paymentData) =>
    axios.post(`${API_BASE}/payment-methods`, paymentData, { headers: getAuthHeaders() }),
  
  update: (id, paymentData) =>
    axios.put(`${API_BASE}/payment-methods/${id}`, paymentData, { headers: getAuthHeaders() }),
  
  delete: (id) =>
    axios.delete(`${API_BASE}/payment-methods/${id}`, { headers: getAuthHeaders() }),
};

// User API
export const userAPI = {
  getAll: () =>
    axios.get(`${API_BASE}/users`, { headers: getAuthHeaders() }),
};
