import axios, { AxiosInstance } from 'axios';
import logger from './logger';

/**
 * Create and configure axios instance
 */
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: process.env.XBOX_API_BASE_URL || 'https://catalogsvc.tellmeabout.com',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Xbox-Sale-Predictor/1.0',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    },
    (error) => {
      logger.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response) => {
      logger.debug(`API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      logger.error('Response error:', error.response?.status, error.message);
      return Promise.reject(error);
    }
  );

  return instance;
};

export const axiosInstance = createAxiosInstance();
