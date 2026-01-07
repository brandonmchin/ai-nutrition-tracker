import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Auth API
export const register = async (username: string, password: string) => {
  const response = await api.post('/auth/register', { username, password });
  return response.data;
};

export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

// User API
export const createUser = async (name: string, accountId: string) => {
  const response = await api.post('/users', { name, accountId });
  return response.data;
};

export const getUsersByAccount = async (accountId: string) => {
  const response = await api.get(`/users/account/${accountId}`);
  return response.data;
};

export const deleteUser = async (userId: string) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

// Goals API
export const getGoals = async (userId: string) => {
  const response = await api.get(`/goals/${userId}`);
  return response.data;
};

export const setGoals = async (userId: string, goals: any) => {
  const response = await api.post(`/goals/${userId}`, goals);
  return response.data;
};

// Food Logs API
export const getFoodLogByDate = async (userId: string, date: string) => {
  const response = await api.get(`/food-logs/${userId}/${date}`);
  return response.data;
};

export const addFoodEntry = async (userId: string, entry: any) => {
  const response = await api.post(`/food-logs/${userId}/entries`, entry);
  return response.data;
};

export const deleteFoodEntry = async (entryId: string) => {
  const response = await api.delete(`/food-logs/entries/${entryId}`);
  return response.data;
};

export default api;