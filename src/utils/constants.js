// ============================================
// TecnoInnova S.A. - Global Constants
// ============================================

export const estadosPedido = {
  solicitud: { label: 'Solicitud Recibida', orden: 1 },
  factibilidad: { label: 'Consulta de Factibilidad', orden: 2 },
  validacion: { label: 'Validación Técnica', orden: 3 },
  consultaDeuda: { label: 'Consulta de Deuda', orden: 4 },
  aprobado: { label: 'Aprobado', orden: 5 },
  programado: { label: 'Instalación Programada', orden: 6 },
  enInstalacion: { label: 'En Instalación', orden: 7 },
  finalizado: { label: 'Finalizado', orden: 8 },
  rechazado: { label: 'Rechazado', orden: 9 },
};

export const tiposServicio = [
  'Instalación de Cámaras (CCTV)',
  'Control de Acceso Biométrico',
  'Alarma contra robos',
  'Mantenimiento Preventivo',
  'Mantenimiento Correctivo',
  'Configuración de Redes',
];

export const zonas = [
  'Centro',
  'Zona Norte',
  'Zona Sur',
  'Zona Este',
  'Zona Oeste',
];

export const prioridades = [
  { value: 'baja', label: 'Baja', color: 'gray' },
  { value: 'media', label: 'Media', color: 'yellow' },
  { value: 'alta', label: 'Alta', color: 'red' },
];
