export type Role = 'admin' | 'user';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: Date;
}

export interface AuthResponse {
    accessToken: string; // El token de acceso devuelto por la API
    user: User;
}

// Credenciales de inicio de sesión y registro
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    name: string;
}


