import api from '../lib/api';
import type { ApiResponse, LoginRequest, RegisterRequest, User } from '../lib/types';

export const authApi = {
  async login(data: LoginRequest): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/auth/login', data);
    return response.data.data;
  },

  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post<ApiResponse<User>>('/auth/register', data);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async me(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async getCsrfCookie(): Promise<void> {
    await api.get('/sanctum/csrf-cookie');
  },
};
