import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { CategoryDetailPage } from './pages/CategoryDetailPage';
import { CategoryCreatePage } from './pages/CategoryCreatePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { ProductCreatePage } from './pages/ProductCreatePage';

export function AppRouter() {
  return (
    <Routes>
      {/*  Rutas Públicas de Autenticación */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/*  Rutas Públicas del Catálogo y Categorías */}
      <Route path="/" element={<ProductsPage />} />
      <Route path="/products/:id" element={<ProductDetailPage />} />
      <Route path="/categories" element={<CategoriesPage />} />
      <Route path="/categories/:id" element={<CategoryDetailPage />} />

      {/*  Rutas Protegidas Nivel 1 (Cualquier usuario autenticado) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/favorites" element={<h1>Mis Favoritos</h1>} />
        <Route path="/products/new" element={<ProductCreatePage />} />
      </Route>

      {/*  Rutas Protegidas Nivel 2 (Exclusivo para rol 'admin') */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/categories/new" element={<CategoryCreatePage />} />
      </Route>

      {/*  Ruta de Captura para Páginas No Encontradas */}
      <Route path="*" element={<h2>404 - Página no encontrada</h2>} />
    </Routes>
  );
}