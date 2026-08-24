// src/routes/AppRouter.tsx
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

export function AppRouter() {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<h1>Catálogo de Productos</h1>} />
      <Route path="/categories" element={<h1>Listado de Categorías</h1>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Rutas Protegidas (Nivel 1: Usuarios autenticados) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/favorites" element={<h1>Mis Favoritos</h1>} />
        <Route path="/products/new" element={<h1>Crear Producto</h1>} />
      </Route>

      {/* Rutas Protegidas (Nivel 2: Solo Admin) */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/categories/new" element={<h1>Crear Categoría (Admin)</h1>} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
    </Routes>
  );
}