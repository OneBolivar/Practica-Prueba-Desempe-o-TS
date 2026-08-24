// src/services/auth.service.ts
import { apiClient } from '../api/client';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types';

export async function loginService(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
  return response.data;
}

export async function registerService(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', credentials);
  return response.data;
}

export async function logoutService(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function getProfileService(): Promise<User> {
  const response = await apiClient.get<User>('/users/me');
  return response.data;
}