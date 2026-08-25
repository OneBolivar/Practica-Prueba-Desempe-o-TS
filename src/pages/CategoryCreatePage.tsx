// src/pages/CategoryCreatePage.tsx
import { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createCategoryService } from '../services/categories.service';
import { ApiError } from '../api/apiError';

export function CategoryCreatePage() {
  const navigate = useNavigate();

  // Estado para el formulario 
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  // Estados de carga y mensajes de error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manejador genérico para inputs
  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  // Enviar formulario a POST /categories
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    // Validación simple: el nombre no puede estar vacío
    try {
      await createCategoryService(formData);
      // Redirigir al listado de categorías al completar
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
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Crear Nueva Categoría (Admin)</h2>

      {/* Alerta de error si la API responde con 400, 409 o similar */}
      {errorMessage && (
        <div style={{ background: '#ffdddd', color: '#900', padding: '0.75rem', marginBottom: '1rem', borderRadius: '4px' }}>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Nombre:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Ej: Electrónica"
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 'bold' }}>Descripción (opcional):</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descripción corta de la categoría..."
            rows={3}
            style={{ width: '100%', padding: '0.5rem', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Guardando...' : 'Crear Categoría'}
          </button>
          <Link to="/categories" style={{ color: '#666', textDecoration: 'none' }}>Cancelar</Link>
        </div>
      </form>
    </div>
  );
}