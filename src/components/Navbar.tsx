// src/components/Navbar.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav style={{ display: 'flex', gap: '1rem', padding: '1rem', background: '#222', color: '#fff', alignItems: 'center' }}>
      <Link to="/" style={{ color: '#fff' }}>Productos</Link>
      <Link to="/categories" style={{ color: '#fff' }}>Categorías</Link>

      {isAuthenticated && (
        <>
          <Link to="/favorites" style={{ color: '#fff' }}>Favoritos</Link>
          <Link to="/products/new" style={{ color: '#fff' }}>Crear Producto</Link>
        </>
      )}

      {user?.role === 'admin' && (
        <Link to="/categories/new" style={{ color: '#ffcc00' }}>Crear Categoría (Admin)</Link>
      )}

      <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {isAuthenticated ? (
          <>
            <span>{user?.name} ({user?.role})</span>
            <button onClick={logout} style={{ cursor: 'pointer', padding: '0.25rem 0.5rem' }}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#fff' }}>Login</Link>
            <Link to="/register" style={{ color: '#fff' }}>Registro</Link>
          </>
        )}
      </div>
    </nav>
  );
}