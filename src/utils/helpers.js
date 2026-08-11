// ============================================
// TecnoInnova S.A. - Helper Utilities
// ============================================

/**
 * Format currency value
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'Bs. 0.00';
  return `Bs. ${Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format date for display
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get initials from name
 */
export const getInitials = (nombre, apellido) => {
  const n = nombre ? nombre.charAt(0).toUpperCase() : '';
  const a = apellido ? apellido.charAt(0).toUpperCase() : '';
  return n + a || '?';
};

/**
 * Hash password using SHA-256
 */
export const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate a unique ID
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

/**
 * Get status badge color class
 */
export const getStatusBadge = (estado) => {
  const statusMap = {
    solicitud: 'badge-gray',
    factibilidad: 'badge-blue',
    validacion: 'badge-cyan',
    consultaDeuda: 'badge-yellow',
    rechazado: 'badge-red',
    aprobado: 'badge-green',
    programado: 'badge-purple',
    enInstalacion: 'badge-blue',
    finalizado: 'badge-green',
    // Factura states
    generada: 'badge-blue',
    enviada: 'badge-cyan',
    pendiente: 'badge-yellow',
    pagada: 'badge-green',
    archivada: 'badge-gray',
    // Postventa states
    completado: 'badge-green',
    enProceso: 'badge-blue',
    // Inventario
    disponible: 'badge-green',
    ocupado: 'badge-red',
    // Reposición
    aprobada: 'badge-green',
    // Genéricos
    activo: 'badge-green',
    inactivo: 'badge-gray',
  };
  return statusMap[estado] || 'badge-gray';
};

/**
 * Get status label in Spanish
 */
export const getStatusLabel = (estado) => {
  const labelMap = {
    solicitud: 'Solicitud',
    factibilidad: 'Consulta Factibilidad',
    validacion: 'En Validación',
    consultaDeuda: 'Consulta de Deuda',
    rechazado: 'Rechazado',
    aprobado: 'Aprobado',
    programado: 'Programado',
    enInstalacion: 'En Instalación',
    finalizado: 'Finalizado',
    generada: 'Generada',
    enviada: 'Enviada',
    pendiente: 'Pendiente',
    pagada: 'Pagada',
    archivada: 'Archivada',
    completado: 'Completado',
    enProceso: 'En Proceso',
    disponible: 'Disponible',
    ocupado: 'Ocupado',
    activo: 'Activo',
    inactivo: 'Inactivo',
  };
  return labelMap[estado] || estado;
};

/**
 * Filter array by search term (checks multiple fields)
 */
export const searchFilter = (items, searchTerm, fields) => {
  if (!searchTerm || !searchTerm.trim()) return items;
  const term = searchTerm.toLowerCase().trim();
  return items.filter(item =>
    fields.some(field => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(term);
    })
  );
};

/**
 * Sort array by field
 */
export const sortBy = (items, field, direction = 'asc') => {
  return [...items].sort((a, b) => {
    const aVal = a[field] || '';
    const bVal = b[field] || '';
    const comparison = String(aVal).localeCompare(String(bVal), 'es');
    return direction === 'asc' ? comparison : -comparison;
  });
};

/**
 * Get the current date in ISO format
 */
export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get date N days from now
 */
export const getDateFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

/**
 * Calculate stock level
 */
export const getStockLevel = (disponible, minimo) => {
  if (disponible <= 0) return 'agotado';
  if (disponible <= minimo) return 'bajo';
  if (disponible <= minimo * 2) return 'medio';
  return 'alto';
};

/**
 * Download data as JSON (for backup purposes)
 */
export const downloadJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
