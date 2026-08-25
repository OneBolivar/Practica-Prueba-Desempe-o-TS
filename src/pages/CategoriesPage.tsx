// src/pages/CategoriesPage.tsx
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
    return <p>Cargando categorías...</p>;
  }

  if (errorMessage) {
    return <div style={{ color: 'red', padding: '1rem' }}>{errorMessage}</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      <h2>Categorías Disponibles</h2>

      {categories.length === 0 ? (
        <p>No hay categorías registradas.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                border: '1px solid #ddd',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
              }}
            >
              <h3>{cat.name}</h3>
              {/* Enlace para navegar a la vista de detalle de la categoría */}
              <Link
                to={`/categories/${cat.id}`}
                style={{
                  display: 'inline-block',
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: '#007bff',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '4px',
                }}
              >
                Ver productos
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}