// src/pages/CategoryCreatePage.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createCategoryService } from '../services/categories.service';
import { ApiError } from '../api/apiError';

export function CategoryCreatePage() {
  const navigate = useNavigate();

  // Estados simples para el formulario
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Crear categoría
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await createCategoryService({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      navigate('/categories');
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Error al crear la categoría.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-slate-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-purple-950/5 border border-purple-100 p-8">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold uppercase mb-2">
            Administración
          </span>
          <h2 className="text-2xl font-bold text-gray-900">Nueva Categoría</h2>
          <p className="text-sm text-gray-500 mt-1">Crea una categoría para organizar el catálogo</p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nombre de la Categoría *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ej: Calzado Deportivo"
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalles sobre qué artículos contendrá..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="pt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-purple-600/20 active:scale-[0.98] disabled:opacity-50 text-sm"
            >
              {isSubmitting ? 'Guardando...' : 'Crear Categoría'}
            </button>
            <Link
              to="/categories"
              className="px-5 py-3 text-sm font-medium text-gray-600 hover:text-gray-800 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}