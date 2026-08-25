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

  if (errorMessage || !category) {
    return (
      <div style={{ padding: '1rem', color: 'red' }}>
        <p>{errorMessage || 'Categoría no encontrada.'}</p>
        <Link to="/categories">Volver al listado</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
      {/* Encabezado y acción condicional */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>Categoría: {category.name}</h2>

        {/* Requerimiento: Botón visible ÚNICAMENTE para usuarios autenticados (cualquier rol) */}
        {isAuthenticated && (
          <Link
            to={`/products/new?categoryId=${category.id}`}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#28a745',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            + Agregar producto a esta categoría
          </Link>
        )}
      </div>

      {/* Listado de productos vinculados a esta categoría */}
      <h3>Productos en esta categoría</h3>

      {!category.products || category.products.length === 0 ? (
        <p>No hay productos registrados en esta categoría aún.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {category.products.map((product) => (
            <div
              key={product.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '1rem',
                backgroundColor: '#fafafa',
              }}
            >
              <h4 style={{ margin: '0 0 0.5rem 0' }}>{product.name  }</h4>
              <p style={{ margin: '0 0 0.5rem 0', color: '#555' }}>${product.price}</p>
              <p style={{ fontSize: '0.9rem', color: '#777' }}>Stock: {product.stock}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <Link to="/categories">← Volver a Categorías</Link>
      </div>
    </div>
  );
}