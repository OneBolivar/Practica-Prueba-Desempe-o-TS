// src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Función para cerrar sesión y redirigir
  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="bg-white border-b border-purple-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logotipo */}
        <Link to="/" className="text-xl font-black text-purple-700 tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-purple-500/20">
            TS
          </span>
          Tienda<span className="text-gray-900">App</span>
        </Link>

        {/* Enlaces de navegación */}
        <nav className="flex items-center gap-2 sm:gap-4 text-sm font-medium text-gray-600">
          <Link to="/" className="px-3 py-2 rounded-lg hover:text-purple-600 hover:bg-purple-50 transition-colors">
            Productos
          </Link>
          <Link to="/categories" className="px-3 py-2 rounded-lg hover:text-purple-600 hover:bg-purple-50 transition-colors">
            Categorías
          </Link>

          {isAuthenticated && (
            <>
              <Link to="/products/new" className="px-3 py-2 rounded-lg hover:text-purple-600 hover:bg-purple-50 transition-colors">
                Publicar Producto
              </Link>
              {user?.role === 'admin' && (
                <Link to="/categories/new" className="px-3 py-2 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors">
                  + Categoría
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Zona de usuario / botones de autenticación */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs bg-purple-100 text-purple-800 font-semibold px-3 py-1.5 rounded-full">
                {user.name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-200 transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold text-purple-700 hover:bg-purple-50 px-3.5 py-2 rounded-lg transition-colors"
              >
                Ingresar
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-lg transition-all shadow-sm shadow-purple-600/20"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}