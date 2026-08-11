// ============================================
// TecnoInnova S.A. - Main Layout
// ============================================

import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import Toast from '../common/Toast';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', breadcrumb: 'Inicio / Dashboard' },
  '/pedidos': { title: 'Gestión de Pedidos', breadcrumb: 'Inicio / Pedidos' },
  '/tecnicos': { title: 'Asignación de Técnicos', breadcrumb: 'Inicio / Técnicos' },
  '/inventario': { title: 'Control de Inventario', breadcrumb: 'Inicio / Inventario' },
  '/facturacion': { title: 'Facturación', breadcrumb: 'Inicio / Facturación' },
  '/postventa': { title: 'Seguimiento Postventa', breadcrumb: 'Inicio / Postventa' },
  '/usuarios': { title: 'Gestión de Usuarios', breadcrumb: 'Inicio / Usuarios' },
};

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const currentPage = pageTitles[location.pathname] || { title: 'TecnoInnova', breadcrumb: '' };

  return (
    <div className="layout">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-content">
        <Header
          title={currentPage.title}
          breadcrumb={currentPage.breadcrumb}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="page-content fade-in">
          <Outlet />
        </div>
      </div>
      <Toast />
    </div>
  );
};

export default MainLayout;
