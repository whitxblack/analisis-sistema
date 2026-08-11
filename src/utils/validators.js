// ============================================
// TecnoInnova S.A. - Validation Utilities
// ============================================

/**
 * Validates a name field (no numbers allowed)
 */
export const validateNombre = (value, fieldName = 'Nombre') => {
  if (!value || !value.trim()) {
    return `${fieldName} es obligatorio`;
  }
  if (value.trim().length < 2) {
    return `${fieldName} debe tener al menos 2 caracteres`;
  }
  if (value.trim().length > 50) {
    return `${fieldName} no puede exceder 50 caracteres`;
  }
  if (/\d/.test(value)) {
    return `${fieldName} no puede contener números`;
  }
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s.'-]+$/.test(value.trim())) {
    return `${fieldName} contiene caracteres no válidos`;
  }
  return '';
};

/**
 * Validates an email field
 */
export const validateEmail = (value) => {
  if (!value || !value.trim()) {
    return 'El correo electrónico es obligatorio';
  }
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(value.trim())) {
    return 'Ingrese un correo electrónico válido';
  }
  return '';
};

/**
 * Validates a phone number
 */
export const validateTelefono = (value) => {
  if (!value || !value.trim()) {
    return 'El teléfono es obligatorio';
  }
  const cleaned = value.replace(/[\s\-\(\)\+]/g, '');
  if (!/^\d+$/.test(cleaned)) {
    return 'El teléfono solo puede contener números, +, -, (, ) y espacios';
  }
  if (cleaned.length < 7 || cleaned.length > 15) {
    return 'El teléfono debe tener entre 7 y 15 dígitos';
  }
  return '';
};

/**
 * Validates a password
 */
export const validatePassword = (value) => {
  if (!value) {
    return 'La contraseña es obligatoria';
  }
  if (value.length < 8) {
    return 'La contraseña debe tener al menos 8 caracteres';
  }
  if (!/[A-Z]/.test(value)) {
    return 'La contraseña debe contener al menos una mayúscula';
  }
  if (!/[a-z]/.test(value)) {
    return 'La contraseña debe contener al menos una minúscula';
  }
  if (!/\d/.test(value)) {
    return 'La contraseña debe contener al menos un número';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
    return 'La contraseña debe contener al menos un carácter especial (!@#$%...)';
  }
  return '';
};

/**
 * Validates password confirmation
 */
export const validatePasswordConfirm = (password, confirm) => {
  if (!confirm) {
    return 'Debe confirmar la contraseña';
  }
  if (password !== confirm) {
    return 'Las contraseñas no coinciden';
  }
  return '';
};

/**
 * Validates a date field
 */
export const validateFecha = (value, options = {}) => {
  const { required = true, noPast = false, fieldName = 'La fecha' } = options;
  if (!value) {
    return required ? `${fieldName} es obligatoria` : '';
  }
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return `${fieldName} no es válida`;
  }
  if (noPast) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      return `${fieldName} no puede ser en el pasado`;
    }
  }
  return '';
};

/**
 * Validates a quantity field
 */
export const validateCantidad = (value, fieldName = 'La cantidad') => {
  if (value === '' || value === null || value === undefined) {
    return `${fieldName} es obligatoria`;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} debe ser un número válido`;
  }
  if (num < 0) {
    return `${fieldName} no puede ser negativa`;
  }
  if (!Number.isInteger(num)) {
    return `${fieldName} debe ser un número entero`;
  }
  return '';
};

/**
 * Validates a price field
 */
export const validatePrecio = (value, fieldName = 'El precio') => {
  if (value === '' || value === null || value === undefined) {
    return `${fieldName} es obligatorio`;
  }
  const num = Number(value);
  if (isNaN(num)) {
    return `${fieldName} debe ser un número válido`;
  }
  if (num < 0) {
    return `${fieldName} no puede ser negativo`;
  }
  return '';
};

/**
 * Validates a required field
 */
export const validateRequired = (value, fieldName = 'Este campo') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} es obligatorio`;
  }
  return '';
};

/**
 * Validates a direction/address field
 */
export const validateDireccion = (value) => {
  if (!value || !value.trim()) {
    return 'La dirección es obligatoria';
  }
  if (value.trim().length < 5) {
    return 'La dirección debe tener al menos 5 caracteres';
  }
  if (value.trim().length > 200) {
    return 'La dirección no puede exceder 200 caracteres';
  }
  return '';
};

/**
 * Get password strength level
 */
export const getPasswordStrength = (password) => {
  if (!password) return { level: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

  if (score <= 2) return { level: 1, label: 'Débil', className: 'weak' };
  if (score <= 4) return { level: 2, label: 'Media', className: 'medium' };
  return { level: 3, label: 'Fuerte', className: 'strong' };
};

/**
 * Run multiple validations on a form
 * @param {Object} fields - { fieldName: { value, validators: [fn] } }
 * @returns {Object} errors - { fieldName: errorMessage }
 */
export const validateForm = (fields) => {
  const errors = {};
  for (const [key, config] of Object.entries(fields)) {
    for (const validator of config.validators) {
      const error = validator(config.value);
      if (error) {
        errors[key] = error;
        break;
      }
    }
  }
  return errors;
};
