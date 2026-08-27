// src/pages/ProductsPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProductsService } from '../services/products.service';
import { getCategoriesService } from '../services/categories.service';
import { addFavoriteService, removeFavoriteService } from '../services/favorites.service';
import type { Product, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/apiError';

export function ProductsPage() {
  const { isAuthenticated } = useAuth();

  // Estados de datos
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Estados de paginación
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const limit = 6;

  // Estados de filtros
  const [search, setSearch] = useState<string>('');
  const [appliedSearch, setAppliedSearch] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('');

  // Estados de carga y error
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cargar categorías disponibles
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategoriesService();
        setCategories(data);
      } catch {
        console.error('Error al cargar categorías');
      }
    }
    loadCategories();
  }, []);

  // Cargar productos
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setErrorMessage(null);

      try {
        const res = await getProductsService({
          page,
          limit,
          search: appliedSearch ? appliedSearch : undefined,
          categoryId: categoryId ? categoryId : undefined,
        });

        setProducts(res.data);
        setTotal(res.total);
      } catch (error) {
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Error al cargar los productos');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [page, categoryId, appliedSearch]);

  // Manejar el submit del buscador
  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setAppliedSearch(search.trim());
  }

  // Alternar favorito (agregar / quitar)
  async function handleToggleFavorite(product: Product) {
    if (!isAuthenticated) return;

    try {
      if (product.isFavorite) {
        await removeFavoriteService(product.id);
      } else {
        await addFavoriteService(product.id);
      }

      // Actualizar el estado local para reflejar el cambio en el icono
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isFavorite: !p.isFavorite } : p
        )
      );
    } catch {
      alert('Error al actualizar favoritos.');
    }
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-purple-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Catálogo de Productos</h1>
          <p className="text-sm text-gray-500 mt-1">Explora todos los artículos disponibles</p>
        </div>
        {isAuthenticated && (
          <Link
            to="/products/new"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-sm text-sm"
          >
            + Publicar Producto
          </Link>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3 mb-8 bg-purple-50 p-4 rounded-xl border border-purple-100">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm"
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-5 py-2 rounded-lg transition-colors text-sm"
          >
            Buscar
          </button>
        </form>

        <select
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Grilla de productos */}
      {loading ? (
        <div className="text-center py-16">
          <p className="text-purple-600 font-medium">Cargando productos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-base">No se encontraron productos disponibles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white border border-purple-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative"
            >
              <div>
                {/* Botón de Favorito */}
                {isAuthenticated && (
                  <button
                    onClick={() => handleToggleFavorite(p)}
                    className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow hover:scale-110 transition-transform text-base"
                    title={p.isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  >
                    {p.isFavorite ? '💜' : '🤍'}
                  </button>
                )}

                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                    className="w-full h-48 object-cover border-b border-gray-100"
                  />
                ) : (
                  <div className="w-full h-48 bg-purple-100 flex items-center justify-center text-purple-400">
                    Sin imagen
                  </div>
                )}

                <div className="p-5">
                  <Link to={`/products/${p.id}`} className="block group">
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-purple-600 transition-colors">
                      {p.name}
                    </h3>
                  </Link>
                  {p.description && (
                    <p className="text-gray-600 text-sm mt-2 line-clamp-2">{p.description}</p>
                  )}
                </div>
              </div>

              <div className="p-5 pt-0 flex justify-between items-center border-t border-gray-50 mt-4">
                <span className="text-xl font-bold text-purple-700">${p.price.toLocaleString()}</span>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    p.stock > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {p.stock > 0 ? `Stock: ${p.stock}` : 'Agotado'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page <= 1 || loading}
          className="px-4 py-2 border border-purple-200 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ← Anterior
        </button>

        <span className="text-sm text-gray-600 font-medium">
          Página <span className="text-purple-700 font-bold">{page}</span> de {totalPages}
        </span>

        <button
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages || loading}
          className="px-4 py-2 border border-purple-200 rounded-lg text-sm font-medium text-purple-700 hover:bg-purple-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}