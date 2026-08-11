// ============================================
// TecnoInnova S.A. - Gestión de Usuarios
// ============================================

import { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate, getInitials, searchFilter } from '../../utils/helpers';
import { validateNombre, validateEmail, validatePassword, validatePasswordConfirm } from '../../utils/validators';
import { hashPassword } from '../../utils/helpers';
import {
  Plus, Search, Edit, Trash2, Users, UserCheck, Shield, Eye, EyeOff
} from 'lucide-react';

const Usuarios = () => {
  const { users, updateUser, deleteUser, showToast } = useData();
  const { register, user: currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '', apellido: '', email: '', password: '', confirmPassword: '', rol: 'usuario',
  });

  const filteredUsers = useMemo(() => {
    let results = searchFilter(users, searchTerm, ['nombre', 'apellido', 'email']);
    if (filterRol) results = results.filter(u => u.rol === filterRol);
    return results;
  }, [users, searchTerm, filterRol]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    const n = validateNombre(formData.nombre, 'El nombre');
    if (n) newErrors.nombre = n;
    const a = validateNombre(formData.apellido, 'El apellido');
    if (a) newErrors.apellido = a;
    const e = validateEmail(formData.email);
    if (e) newErrors.email = e;
    if (!editMode || formData.password) {
      const p = validatePassword(formData.password);
      if (p) newErrors.password = p;
      const c = validatePasswordConfirm(formData.password, formData.confirmPassword);
      if (c) newErrors.confirmPassword = c;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openCreate = () => {
    setFormData({ nombre: '', apellido: '', email: '', password: '', confirmPassword: '', rol: 'usuario' });
    setEditMode(false); setErrors({}); setShowModal(true);
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setFormData({ nombre: user.nombre, apellido: user.apellido, email: user.email, password: '', confirmPassword: '', rol: user.rol });
    setEditMode(true); setErrors({}); setShowModal(true);
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      if (editMode) {
        const updates = {
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim().toLowerCase(),
          rol: formData.rol,
        };
        if (formData.password) {
          updates.password = await hashPassword(formData.password);
        }
        // Check duplicate email (exclude current user)
        const duplicate = users.find(u => u.email.toLowerCase() === updates.email && u.id !== selectedUser.id);
        if (duplicate) { showToast('Ya existe un usuario con ese correo', 'error'); return; }
        updateUser(selectedUser.id, updates);
      } else {
        await register(formData);
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = (user) => {
    if (user.id === currentUser.id) {
      showToast('No puede eliminar su propia cuenta', 'error');
      return;
    }
    setSelectedUser(user);
    setShowConfirm(true);
  };

  const toggleActivo = (user) => {
    if (user.id === currentUser.id) {
      showToast('No puede desactivar su propia cuenta', 'error');
      return;
    }
    updateUser(user.id, { activo: !user.activo });
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h2 className="page-title">Gestión de Usuarios</h2>
          <p className="page-subtitle">Administración de cuentas y roles del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Nuevo Usuario</button>
      </div>

      <div className="toolbar" style={{ marginBottom: 20 }}>
        <div className="search-input"><Search className="search-icon" size={18} /><input type="text" className="form-input" placeholder="Buscar usuario..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: 40 }} /></div>
        <select className="form-select filter-select" value={filterRol} onChange={e => setFilterRol(e.target.value)}>
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="usuario">Usuario Básico</option>
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon"><Users size={28} /></div><div className="empty-state-title">No se encontraron usuarios</div></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th></th><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th>Fecha Registro</th><th>Acciones</th></tr></thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>
                    <div className="sidebar-avatar" style={{ width: 36, height: 36, fontSize: '0.8rem' }}>
                      {getInitials(user.nombre, user.apellido)}
                    </div>
                  </td>
                  <td>
                    <div>
                      <span className="font-medium">{user.nombre} {user.apellido}</span>
                      {user.id === currentUser.id && <span className="badge badge-blue" style={{ marginLeft: 8 }}>Tú</span>}
                    </div>
                  </td>
                  <td className="text-sm">{user.email}</td>
                  <td>
                    <span className={`badge ${user.rol === 'admin' ? 'badge-purple' : 'badge-gray'}`}>
                      {user.rol === 'admin' ? '🔑 Admin' : '👤 Usuario'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`badge ${user.activo !== false ? 'badge-green' : 'badge-red'}`}
                      onClick={() => toggleActivo(user)}
                      style={{ cursor: user.id === currentUser.id ? 'default' : 'pointer', border: 'none' }}
                    >
                      {user.activo !== false ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="text-sm">{formatDate(user.fechaCreacion)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(user)} title="Editar"><Edit size={16} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(user)} title="Eliminar" style={{ color: 'var(--danger-500)' }} disabled={user.id === currentUser.id}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editMode ? 'Editar Usuario' : 'Nuevo Usuario'}
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleSave}>{editMode ? 'Guardar' : 'Crear'}</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Nombre <span className="required">*</span></label><input name="nombre" className={`form-input ${errors.nombre ? 'error' : ''}`} value={formData.nombre} onChange={handleChange} />{errors.nombre && <span className="form-error">{errors.nombre}</span>}</div>
            <div className="form-group"><label className="form-label">Apellido <span className="required">*</span></label><input name="apellido" className={`form-input ${errors.apellido ? 'error' : ''}`} value={formData.apellido} onChange={handleChange} />{errors.apellido && <span className="form-error">{errors.apellido}</span>}</div>
          </div>
          <div className="form-group"><label className="form-label">Correo Electrónico <span className="required">*</span></label><input name="email" type="email" className={`form-input ${errors.email ? 'error' : ''}`} value={formData.email} onChange={handleChange} />{errors.email && <span className="form-error">{errors.email}</span>}</div>
          <div className="form-group">
            <label className="form-label">
              Contraseña {!editMode && <span className="required">*</span>}
              {editMode && <span className="form-hint" style={{ marginLeft: 8 }}>(dejar vacío para mantener)</span>}
            </label>
            <div style={{ position: 'relative' }}>
              <input name="password" type={showPassword ? 'text' : 'password'} className={`form-input ${errors.password ? 'error' : ''}`} value={formData.password} onChange={handleChange} placeholder={editMode ? 'Dejar vacío para no cambiar' : 'Mín. 8 caracteres'} style={{ paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          {(!editMode || formData.password) && (
            <div className="form-group"><label className="form-label">Confirmar Contraseña <span className="required">*</span></label><input name="confirmPassword" type="password" className={`form-input ${errors.confirmPassword ? 'error' : ''}`} value={formData.confirmPassword} onChange={handleChange} />{errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}</div>
          )}
          <div className="form-group">
            <label className="form-label">Rol <span className="required">*</span></label>
            <select name="rol" className="form-select" value={formData.rol} onChange={handleChange}>
              <option value="usuario">👤 Usuario Básico</option>
              <option value="admin">🔑 Administrador</option>
            </select>
            <span className="form-hint">{formData.rol === 'admin' ? 'Acceso completo a todos los módulos.' : 'Solo Pedidos y Técnicos.'}</span>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={() => deleteUser(selectedUser?.id)} title="¿Eliminar usuario?" message={`Se eliminará la cuenta de ${selectedUser?.nombre} ${selectedUser?.apellido}.`} />
    </div>
  );
};

export default Usuarios;
