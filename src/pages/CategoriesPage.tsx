import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategoriesService } from '../services/categories.service';
import type { Category } from '../types';
import { ApiError } from '../api/apiError';

export function CategoriesPage() {
  // Estado para almacenar la lista de categorías
  const [categories, setCategories] = useState<Category[]>([]);
  // Estado para indicar si la petición está en curso
  const [loading, setLoading] = useState<boolean>(true);
  // Estado para capturar mensajes de error si la API falla
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        // Consumimos el endpoint público GET /categories (sin paginación)
        const data = await getCategoriesService();
        setCategories(data);
      } catch (error) {
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('No se pudieron cargar las categorías.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

if (loading) {
    return (
      <div className="text-center py-20">
        <p className="text-purple-600 font-medium">Cargando categorías...</p>
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
      <div className="flex justify-between items-center mb-8 border-b border-purple-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
          <p className="text-sm text-gray-500 mt-1">Explora productos clasificados por secciones</p>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500">No hay categorías registradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="bg-white border border-purple-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-purple-200 transition-all flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.name}</h3>
                {cat.description && (
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{cat.description}</p>
                )}
              </div>
              <Link
                to={`/categories/${cat.id}`}
                className="inline-block text-center bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm border border-purple-200 hover:border-transparent mt-4"
              >
                Ver productos →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}