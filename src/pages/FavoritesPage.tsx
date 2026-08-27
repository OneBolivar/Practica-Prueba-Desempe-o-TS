// src/pages/FavoritesPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getFavoritesService, removeFavoriteService } from '../services/favorites.service';
import type { Product } from '../types';
import { ApiError } from '../api/apiError';

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cargar lista de favoritos al montar la página
  useEffect(() => {
    async function loadFavorites() {
      try {
        setLoading(true);
        const data = await getFavoritesService();
        setFavorites(data);
      } catch (error) {
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('No se pudieron cargar tus favoritos.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  // Quitar de favoritos
  async function handleRemove(productId: string) {
    try {
      await removeFavoriteService(productId);
      setFavorites((prev) => prev.filter((item) => item.id !== productId));
    } catch {
      alert('Error al quitar de favoritos.');
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-purple-600 font-medium">Cargando tus favoritos...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="max-w-xl mx-auto my-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded text-sm">
        {errorMessage}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8 border-b border-purple-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Mis Favoritos</h1>
          <p className="text-sm text-gray-500 mt-1">Artículos que guardaste para consultar</p>
        </div>
        <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1.5 rounded-full">
          {favorites.length} {favorites.length === 1 ? 'producto' : 'productos'}
        </span>
      </div>

      {/* Listado */}
      {favorites.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">Aún no has guardado ningún producto en favoritos.</p>
          <Link
            to="/"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            Explorar Catálogo
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-purple-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-full h-48 object-cover border-b border-gray-100"
                  />
                ) : (
                  <div className="w-full h-48 bg-purple-50 flex items-center justify-center text-purple-300 text-sm font-medium">
                    Sin imagen
                  </div>
                )}
                <div className="p-5">
                  <Link to={`/products/${product.id}`} className="block group">
                    <h3 className="font-bold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  {product.description && (
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{product.description}</p>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 flex justify-between items-center border-t border-gray-50 mt-4">
                <span className="text-xl font-bold text-purple-700">${product.price.toLocaleString()}</span>
                <button
                  onClick={() => handleRemove(product.id)}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
                >
                  Quitar 💜
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}