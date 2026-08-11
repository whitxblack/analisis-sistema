// ============================================
// TecnoInnova S.A. - Header
// ============================================

import { Menu, Bell, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ title, breadcrumb, onMenuToggle }) => {
  const { user, isAdmin } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={onMenuToggle}>
          <Menu size={22} />
        </button>
        <div className="header-title">
          <h1>{title}</h1>
          {breadcrumb && <div className="header-breadcrumb">{breadcrumb}</div>}
        </div>
      </div>
      <div className="header-right">
        <div className="flex items-center gap-2">
          <span className={`badge ${isAdmin ? 'badge-blue' : 'badge-gray'}`}>
            {isAdmin ? 'Admin' : 'Usuario'}
          </span>
          <div className="flex items-center gap-2" style={{ padding: '4px 8px' }}>
            <User size={16} style={{ color: 'var(--text-tertiary)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {user?.nombre} {user?.apellido}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
