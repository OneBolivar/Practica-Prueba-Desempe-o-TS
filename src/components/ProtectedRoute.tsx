// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import type { Role } from '../types';

// Componente de ruta protegida que verifica si el usuario está autenticado y tiene los roles permitidos
interface Props {
  allowedRoles?: Role[];// Array de roles permitidos para acceder a la ruta. Si no se especifica, cualquier usuario autenticado puede acceder.
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // 1. Si la app está verificando el token con la API al recargar, mostramos esto:
  if (isLoading) {
    return <p>Cargando sesión...</p>;
  }

  // 2. Si no está logueado, lo mandamos al Login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si la ruta pide un rol (ej: ['admin']) y el usuario no lo tiene, lo mandamos al inicio
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // 4. Si pasa las validaciones, renderiza la vista hija
  return <Outlet />;
}