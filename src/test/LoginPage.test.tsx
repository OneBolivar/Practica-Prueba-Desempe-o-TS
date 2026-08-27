// src/test/LoginPage.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../pages/LoginPage';
import { AuthProvider } from '../context/AuthContext';
import * as authService from '../services/auth.service';
import type { AuthResponse } from '../types';

// Mockeamos exclusivamente el servicio de auth
vi.mock('../services/auth.service');

describe('LoginPage - Prueba de Integración', () => {
  it('permite al usuario ingresar sus credenciales y realizar login con éxito', async () => {
    const user = userEvent.setup();

    // Objeto mock que cumple estrictamente con AuthResponse
    const mockAuthResponse: AuthResponse = {
      accessToken: 'jwt-token-falso',
      user: {
        id: '1',
        name: 'Juan Bolivar',
        email: 'test@correo.com',
        role: 'user',
        createdAt: new Date(),
      },
    };

    vi.spyOn(authService, 'loginService').mockResolvedValueOnce(mockAuthResponse);

    render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/tu@email.com/i);
    const passwordInput = screen.getByPlaceholderText(/••••••••/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    await user.type(emailInput, 'test@correo.com');
    await user.type(passwordInput, '123456');
    await user.click(submitButton);

    expect(authService.loginService).toHaveBeenCalledWith({
      email: 'test@correo.com',
      password: '123456',
    });
  });
});