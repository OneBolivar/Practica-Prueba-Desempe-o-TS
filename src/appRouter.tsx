// src/appRouter.tsx
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

// Autenticación
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Categorías
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { CategoryCreatePage } from './pages/CategoryCreatePage';

// Productos
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProductCreatePage } from './pages/ProductCreatePage';

// Favoritos
import { FavoritesPage } from './pages/FavoritesPage';

export function AppRouter() {
  return (
    <Routes>
      {/* 1. Rutas Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/categories/:id" element={<CategoryDetailPage />} />

      {/* 2. Rutas Protegidas (Cualquier usuario autenticado) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/products/new" element={<ProductCreatePage />} />
      </Route>

      {/* 3. Rutas Protegidas de Administrador */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/categories/new" element={<CategoryCreatePage />} />
      </Route>

      {/* 4. Página 404 */}
      <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
    </Routes>
  );
}