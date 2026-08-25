import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { CategoryCreatePage } from './pages/CategoryCreatePage';

export function AppRouter() {
  return (
    <Routes>
      {/* 1. Rutas Públicas de Autenticación */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 2. Rutas Públicas de Productos y Categorías */}
      <Route path="/" element={<h1>Catálogo de Productos</h1>} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/categories/:id" element={<CategoryDetailPage />} />

      {/* 3. Rutas Protegidas Nivel 1 (Cualquier usuario autenticado) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/favorites" element={<h1>Mis Favoritos</h1>} />
        <Route path="/products/new" element={<h1>Crear Producto</h1>} />
      </Route>

      {/* 4. Rutas Protegidas Nivel 2 (Solo rol 'admin') */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/categories/new" element={<CategoryCreatePage />} />
      </Route>

      {/* 5. Página 404 */}
      <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
    </Routes>
  );
}