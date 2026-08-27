// src/pages/ProductCreatePage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createProductService } from '../services/products.service';
import { getCategoriesService } from '../services/categories.service';
import type { Category, CreateProductDto } from '../types';
import { ApiError } from '../api/apiError';

export function ProductCreatePage() {
  const navigate = useNavigate();

  // 1. Obtener categoryId de la URL nativamente (?categoryId=uuid)
  const params = new URLSearchParams(window.location.search);
  const preselectedCategoryId = params.get('categoryId') || '';

  // 2. Estados para categorías
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);

  // 3. Estados individuales para cada campo del formulario
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>(preselectedCategoryId);
  const [imageUrl, setImageUrl] = useState<string>('');

  // 4. Estados de carga y error
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Cargar categorías disponibles para el selector
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const data = await getCategoriesService();
        setCategories(data);

        // Si no venía categoría por URL, preseleccionar la primera de la lista
        if (!preselectedCategoryId && data.length > 0) {
          setCategoryId(data[0].id);
        }
      } catch {
        setErrorMessage('No se pudieron cargar las categorías disponibles.');
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, [preselectedCategoryId]);

  // Enviar el formulario a la API (POST /products)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const payload: CreateProductDto = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        stock: Number(stock),
        categoryId: categoryId, // UUID directo como string
        imageUrl: imageUrl.trim() || undefined,
      };

      await createProductService(payload);
      navigate('/');
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Error al registrar el producto.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 bg-slate-50">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl shadow-purple-950/5 border border-purple-100 p-8">
        
        {/* Encabezado */}
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold uppercase mb-2">
            Inventario
          </span>
          <h2 className="text-2xl font-bold text-gray-900">Crear Nuevo Producto</h2>
          <p className="text-sm text-gray-500 mt-1">
            {preselectedCategoryId ? 'Categoría fijada desde la sección actual' : 'Completa los campos requeridos'}
          </p>
        </div>

        {/* Alerta de Error */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Ej: Teclado Mecánico RGB"
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            />
          </div>

          {/* Categoría (Deshabilitada si viene fijada por URL) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Categoría * {preselectedCategoryId && <span className="text-purple-600 font-normal">(Fijada por contexto)</span>}
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              disabled={loadingCategories || !!preselectedCategoryId}
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all disabled:opacity-60 disabled:bg-gray-100"
            >
              {loadingCategories ? (
                <option value="">Cargando categorías...</option>
              ) : (
                categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Precio ($) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                Stock *
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
                min="0"
                placeholder="10"
                className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* URL de Imagen */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              URL de Imagen (opcional)
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://ejemplo.com/foto.jpg"
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Descripción (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalles sobre el producto..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Botones */}
          <div className="pt-3 flex items-center gap-3">
            <button
              type="submit"
              disabled={isSubmitting || loadingCategories}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-purple-600/20 active:scale-[0.98] disabled:opacity-50 text-sm"
            >
              {isSubmitting ? 'Guardando...' : 'Crear Producto'}
            </button>
            <Link
              to="/"
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