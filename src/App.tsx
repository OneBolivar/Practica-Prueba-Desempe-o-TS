// src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { AppRouter } from './appRouter';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main style={{ padding: '1rem' }}>
          <AppRouter />
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;