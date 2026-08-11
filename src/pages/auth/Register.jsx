// ============================================
// TecnoInnova S.A. - Register Page
// ============================================

import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  validateNombre,
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  getPasswordStrength,
} from '../../utils/validators';
import { Shield, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'usuario',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/pedidos" replace />;
  }

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    const nombreErr = validateNombre(formData.nombre, 'El nombre');
    if (nombreErr) newErrors.nombre = nombreErr;

    const apellidoErr = validateNombre(formData.apellido, 'El apellido');
    if (apellidoErr) newErrors.apellido = apellidoErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const passErr = validatePassword(formData.password);
    if (passErr) newErrors.password = passErr;

    const confirmErr = validatePasswordConfirm(formData.password, formData.confirmPassword);
    if (confirmErr) newErrors.confirmPassword = confirmErr;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      await register(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
          }}>
            <Shield size={32} color="white" />
          </div>
          <h1>Crear Cuenta</h1>
          <p>TecnoInnova S.A. — Sistema de Gestión</p>
        </div>

        {success && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <CheckCircle size={18} />
            <span>¡Cuenta creada exitosamente! Redirigiendo al login...</span>
          </div>
        )}

        {serverError && (
          <div className="alert alert-danger" style={{ marginBottom: 20 }}>
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="nombre">
                Nombre <span className="required">*</span>
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                className={`form-input ${errors.nombre ? 'error' : ''}`}
                placeholder="Ingrese su nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
              {errors.nombre && <span className="form-error">{errors.nombre}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="apellido">
                Apellido <span className="required">*</span>
              </label>
              <input
                id="apellido"
                name="apellido"
                type="text"
                className={`form-input ${errors.apellido ? 'error' : ''}`}
                placeholder="Ingrese su apellido"
                value={formData.apellido}
                onChange={handleChange}
              />
              {errors.apellido && <span className="form-error">{errors.apellido}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">
              Correo Electrónico <span className="required">*</span>
            </label>
            <input
              id="reg-email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">
              Contraseña <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Mín. 8 caracteres, mayúscula, número, especial"
                value={formData.password}
                onChange={handleChange}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-tertiary)',
                  cursor: 'pointer', padding: 4
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.password && (
              <div className="password-strength">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className={`password-strength-bar ${i <= passwordStrength.level ? `filled ${passwordStrength.className}` : ''}`}
                  />
                ))}
                <span className="text-xs" style={{
                  color: passwordStrength.level === 1 ? 'var(--danger-500)' :
                    passwordStrength.level === 2 ? 'var(--warning-500)' : 'var(--success-500)',
                  marginLeft: 8
                }}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">
              Confirmar Contraseña <span className="required">*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                placeholder="Repita su contraseña"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: 'var(--text-tertiary)',
                  cursor: 'pointer', padding: 4
                }}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="rol">
              Rol <span className="required">*</span>
            </label>
            <select
              id="rol"
              name="rol"
              className="form-select"
              value={formData.rol}
              onChange={handleChange}
            >
              <option value="usuario">Usuario Básico</option>
              <option value="admin">Administrador</option>
            </select>
            <span className="form-hint">
              {formData.rol === 'admin'
                ? 'Acceso completo a todos los módulos del sistema.'
                : 'Acceso limitado a Gestión de Pedidos y Asignación de Técnicos.'}
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={loading || success}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                Creando cuenta...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Crear Cuenta
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          ¿Ya tiene una cuenta?{' '}
          <Link to="/login">Iniciar Sesión</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
