// src/components/ErrorBoundary.tsx
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // Estado inicial: sin errores
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  // Se ejecuta cuando ocurre un error en cualquier componente hijo
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      errorMessage: error.message || 'Error inesperado',
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturó un fallo de renderizado:', error, errorInfo);
  }

  // Recargar la aplicación por completo
  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="w-full max-w-md bg-white rounded-3xl border border-purple-100 shadow-xl shadow-purple-950/5 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ⚠️
            </div>
            
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
              Algo salió mal
            </h2>
            
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Ocurrió un error inesperado al renderizar esta vista. Puedes intentar recargar para recuperar el estado normal.
            </p>

            {this.state.errorMessage && (
              <div className="bg-slate-100 p-3 rounded-xl text-xs text-gray-700 font-mono mb-6 text-left overflow-x-auto border border-gray-200">
                {this.state.errorMessage}
              </div>
            )}

            <button
              onClick={this.handleReload}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md shadow-purple-600/20 active:scale-[0.98] text-sm"
            >
              Recargar la aplicación
            </button>
          </div>
        </div>
      );
    }

    // Si no hay errores, renderiza los componentes normalmente
    return this.props.children;
  }
}