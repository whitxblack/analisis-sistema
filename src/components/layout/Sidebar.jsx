// ============================================
// TecnoInnova S.A. - Sidebar Navigation
// ============================================

import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Wrench,
  Package,
  FileText,
  HeadphonesIcon,
  Settings,
  LogOut,
  Shield,
  X,
} from 'lucide-react';
import { getInitials } from '../../utils/helpers';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin } = useAuth();

  const mainLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', adminOnly: true },
    { to: '/pedidos', icon: ClipboardList, label: 'Gestión de Pedidos', adminOnly: false },
    { to: '/tecnicos', icon: Wrench, label: 'Asignación de Técnicos', adminOnly: false },
    { to: '/inventario', icon: Package, label: 'Control de Inventario', adminOnly: true },
    { to: '/facturacion', icon: FileText, label: 'Facturación', adminOnly: true },
    { to: '/postventa', icon: HeadphonesIcon, label: 'Seguimiento Postventa', adminOnly: true },
  ];

  const adminLinks = [
    { to: '/usuarios', icon: Users, label: 'Gestión de Usuarios', adminOnly: true },
  ];

  const filteredMain = mainLinks.filter(link => isAdmin || !link.adminOnly);
  const filteredAdmin = isAdmin ? adminLinks : [];

  const handleNavClick = () => {
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Shield size={22} />
            </div>
            <div className="sidebar-brand-text">
              <h2>TecnoInnova</h2>
              <p>Sistema de Gestión</p>
            </div>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            style={{ display: window.innerWidth < 768 ? 'flex' : 'none', marginTop: 8, color: 'var(--text-sidebar)' }}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <span className="sidebar-section-title">Principal</span>
            {filteredMain.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={handleNavClick}
              >
                <link.icon className="icon" size={20} />
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          {filteredAdmin.length > 0 && (
            <div className="sidebar-section">
              <span className="sidebar-section-title">Administración</span>
              {filteredAdmin.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={handleNavClick}
                >
                  <link.icon className="icon" size={20} />
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {getInitials(user?.nombre, user?.apellido)}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user?.nombre} {user?.apellido}
              </div>
              <div className="sidebar-user-role">
                {isAdmin ? '🔑 Administrador' : '👤 Usuario'}
              </div>
            </div>
            <button
              className="btn btn-ghost btn-icon"
              onClick={logout}
              title="Cerrar sesión"
              style={{ color: 'var(--text-sidebar)' }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
