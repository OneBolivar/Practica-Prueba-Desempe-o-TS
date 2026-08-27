import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getProductByIdService, deleteProductService, updateProductService } from '../services/products.service';
import type { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/apiError';

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Estados de datos y carga
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados para edición rápida (precio y stock)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [price, setPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Cargar el producto mediante el ID de la URL
  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      try {
        setLoading(true);
        const data = await getProductByIdService(id);
        setProduct(data);
        setPrice(String(data.price));
        setStock(String(data.stock));
      } catch (error) {
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('No se pudo cargar el producto.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  // Eliminar producto
  async function handleDelete() {
    if (!id || !confirm('¿Estás seguro de que deseas eliminar este producto?')) return;

    try {
      setIsDeleting(true);
      await deleteProductService(id);
      navigate('/');
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Error al eliminar el producto.');
      }
      setIsDeleting(false);
    }
  }

  // Guardar cambios al editar precio/stock
  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    try {
      setLoading(true);
      const updated = await updateProductService(id, {
        price: Number(price),
        stock: Number(stock),
      });
      setProduct(updated);
      setIsEditing(false);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Error al actualizar el producto.');
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-purple-600 font-medium">Cargando producto...</p>
      </div>
    );
  }

  if (errorMessage || !product) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center">
        <p className="mb-4 font-medium">{errorMessage || 'Producto no encontrado.'}</p>
        <Link to="/" className="text-purple-700 underline font-semibold text-sm">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-800 mb-6 transition-colors">
        ← Volver al catálogo
      </Link>

      <div className="bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-950/5 overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Imagen con protección contra URLs rotas */}
        <div className="bg-purple-50 flex items-center justify-center p-6 min-h-[300px]">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
              className="max-h-80 w-full object-contain rounded-2xl"
            />
          ) : (
            <div className="text-purple-300 text-base font-medium">Sin imagen disponible</div>
          )}
        </div>

        {/* Detalles */}
        <div className="p-8 flex flex-col justify-between">
          <div>
            {product.category && (
              <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase mb-3">
                {product.category.name}
              </span>
            )}
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{product.name}</h1>

            {/* Formulario de edición rápida o visualización */}
            {isEditing ? (
              <form onSubmit={handleUpdate} className="my-4 space-y-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Precio ($):</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Stock:</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                    min="0"
                    className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-sm"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p className="text-3xl font-black text-purple-700 mb-6">${product.price.toLocaleString()}</p>
                <div className="border-t border-gray-100 pt-4 mb-6">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descripción</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description || 'Este producto no cuenta con descripción detallada.'}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <span
              className={`text-xs px-3 py-1.5 rounded-full font-bold uppercase tracking-wider ${
                product.stock > 0
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
            </span>

            {/* Opciones disponibles para usuarios con sesión activa */}
            {isAuthenticated && !isEditing && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}