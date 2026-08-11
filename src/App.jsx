// ============================================
// TecnoInnova S.A. - App with Routing
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';

// Layout
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/dashboard/Dashboard';
import Pedidos from './pages/pedidos/Pedidos';
import Tecnicos from './pages/tecnicos/Tecnicos';
import Inventario from './pages/inventario/Inventario';
import Facturacion from './pages/facturacion/Facturacion';
import Postventa from './pages/postventa/Postventa';
import Usuarios from './pages/usuarios/Usuarios';

// Root redirect based on role
const RootRedirect = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/dashboard' : '/pedidos'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              {/* Admin only */}
              <Route path="dashboard" element={
                <ProtectedRoute adminOnly>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="inventario" element={
                <ProtectedRoute adminOnly>
                  <Inventario />
                </ProtectedRoute>
              } />
              <Route path="facturacion" element={
                <ProtectedRoute adminOnly>
                  <Facturacion />
                </ProtectedRoute>
              } />
              <Route path="postventa" element={
                <ProtectedRoute adminOnly>
                  <Postventa />
                </ProtectedRoute>
              } />
              <Route path="usuarios" element={
                <ProtectedRoute adminOnly>
                  <Usuarios />
                </ProtectedRoute>
              } />

              {/* All authenticated users */}
              <Route path="pedidos" element={<Pedidos />} />
              <Route path="tecnicos" element={<Tecnicos />} />
            </Route>

            {/* Root redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Catch all - redirect to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
