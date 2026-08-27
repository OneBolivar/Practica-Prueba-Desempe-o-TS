// src/pages/CategoryDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategoryByIdService } from '../services/categories.service';
import type { Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/apiError';

export function CategoryDetailPage() {
  // Obtenemos el ID de la URL (/categories/:id)
  const { id } = useParams<{ id: string }>();

  // Verificamos si hay un usuario logueado en la sesión global
  const { isAuthenticated } = useAuth();

  // Estados para categoría, carga y posibles errores
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cargar el detalle de la categoría mediante su ID
  useEffect(() => {
    async function loadCategoryDetail() {
      if (!id) return;
      try {
        setLoading(true);
        // Consumimos GET /categories/:id
        const data = await getCategoryByIdService(id);
        setCategory(data);
      } catch (error) {
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('No se pudo cargar la información de la categoría.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadCategoryDetail();
  }, [id]);

  if (loading) {
    return <p>Cargando detalle de la categoría...</p>;
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-purple-600 font-medium">Cargando categoría...</p>
      </div>
    );
  }

  if (errorMessage || !category) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center">
        <p className="mb-4 font-medium">{errorMessage || 'Categoría no encontrada.'}</p>
        <Link to="/categories" className="text-purple-700 underline font-semibold text-sm">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-purple-50 p-6 rounded-2xl border border-purple-100">
        <div>
          <span className="text-xs uppercase tracking-wider font-bold text-purple-600">Categoría</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">{category.name}</h1>
          {category.description && <p className="text-gray-600 text-sm mt-2">{category.description}</p>}
        </div>

        {isAuthenticated && (
          <Link
            to="/products/new"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm shadow-purple-600/20 text-sm"
          >
            + Publicar producto
          </Link>
        )}
      </div>

      {/* Lista de productos de la categoría */}
      <h2 className="text-xl font-bold text-gray-900 mb-6">Productos en esta categoría</h2>

      {!category.products || category.products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500">No hay productos en esta categoría todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {category.products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-purple-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <Link to={`/products/${product.id}`} className="hover:text-purple-600 transition-colors">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{product.name}</h3>
                </Link>
                {product.description && (
                  <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
                )}
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                <span className="text-lg font-bold text-purple-700">${product.price.toLocaleString()}</span>
                <span className="text-xs text-gray-500 font-semibold">Stock: {product.stock}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link to="/categories" className="text-purple-600 hover:text-purple-800 text-sm font-semibold">
          ← Volver a Categorías
        </Link>
      </div>
    </div>
  );
}