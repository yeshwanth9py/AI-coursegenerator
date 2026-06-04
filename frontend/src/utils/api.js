import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/', // Adjust if necessary
  withCredentials: true,
});

export default api;
