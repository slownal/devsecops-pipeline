import axios from 'axios';

// Defaults to localhost:8000 in development, or uses VITE_API_BASE_URL when hosted
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
