// ============================================
// TecnoInnova S.A. - Gestión de Pedidos
// ============================================

import { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import {
  Plus, Search, Eye, Edit, Trash2, Filter, ClipboardList,
  ChevronRight, ArrowUpDown, X, CheckCircle
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate, formatCurrency, getStatusBadge, getStatusLabel, searchFilter, getCurrentDate } from '../../utils/helpers';
import { validateRequired, validateNombre, validateEmail, validateTelefono, validateDireccion, validatePrecio, validateFecha } from '../../utils/validators';
import { estadosPedido, tiposServicio, zonas, prioridades } from '../../utils/constants';

const emptyPedido = {
  clienteNombre: '', fecha: getCurrentDate(), tipoServicio: '', descripcion: '',
  direccion: '', zona: '', telefono: '', email: '', estado: 'solicitud',
  tecnicoId: null, tecnicoNombre: null, fechaInstalacion: null,
  horarioInstalacion: null, importe: '', observaciones: '', prioridad: 'media',
};

const Pedidos = () => {
  const { pedidos, addPedido, updatePedido, deletePedido, tecnicos } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterPrioridad, setFilterPrioridad] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(emptyPedido);
  const [errors, setErrors] = useState({});

  // Filter and search
  const filteredPedidos = useMemo(() => {
    let results = searchFilter(pedidos, searchTerm, ['clienteNombre', 'tipoServicio', 'zona', 'id', 'direccion']);
    if (filterEstado) results = results.filter(p => p.estado === filterEstado);
    if (filterPrioridad) results = results.filter(p => p.prioridad === filterPrioridad);
    return results.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [pedidos, searchTerm, filterEstado, filterPrioridad]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    const checks = [
      ['clienteNombre', validateRequired(formData.clienteNombre, 'El cliente')],
      ['tipoServicio', validateRequired(formData.tipoServicio, 'El tipo de servicio')],
      ['direccion', validateDireccion(formData.direccion)],
      ['zona', validateRequired(formData.zona, 'La zona')],
      ['telefono', validateTelefono(formData.telefono)],
      ['email', validateEmail(formData.email)],
      ['fecha', validateFecha(formData.fecha, { fieldName: 'La fecha' })],
      ['importe', validatePrecio(formData.importe, 'El importe')],
    ];
    checks.forEach(([field, err]) => { if (err) newErrors[field] = err; });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openCreate = () => {
    setFormData(emptyPedido);
    setEditMode(false);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (pedido) => {
    setFormData({ ...pedido, importe: String(pedido.importe || '') });
    setEditMode(true);
    setErrors({});
    setShowModal(true);
  };

  const openDetail = (pedido) => {
    setSelectedPedido(pedido);
    setShowDetail(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    const data = { ...formData, importe: Number(formData.importe) };
    if (editMode) {
      updatePedido(formData.id, data);
    } else {
      addPedido(data);
    }
    setShowModal(false);
  };

  const handleDelete = (pedido) => {
    setSelectedPedido(pedido);
    setShowConfirm(true);
  };

  const changeEstado = (pedido, nuevoEstado) => {
    updatePedido(pedido.id, { estado: nuevoEstado });
    if (showDetail) setSelectedPedido({ ...pedido, estado: nuevoEstado });
  };

  const nextStates = (estado) => {
    const flow = {
      solicitud: ['factibilidad', 'rechazado'],
      factibilidad: ['validacion', 'rechazado'],
      validacion: ['consultaDeuda', 'rechazado'],
      consultaDeuda: ['aprobado', 'rechazado'],
      aprobado: ['programado'],
      programado: ['enInstalacion'],
      enInstalacion: ['finalizado'],
    };
    return flow[estado] || [];
  };

  // Status timeline for detail view
  const getTimeline = (pedido) => {
    const steps = [
      { key: 'solicitud', label: 'Solicitud Recibida' },
      { key: 'factibilidad', label: 'Consulta de Factibilidad' },
      { key: 'validacion', label: 'Validación Técnica' },
      { key: 'consultaDeuda', label: 'Consulta de Deuda' },
      { key: 'aprobado', label: 'Pedido Aprobado' },
      { key: 'programado', label: 'Instalación Programada' },
      { key: 'enInstalacion', label: 'En Instalación' },
      { key: 'finalizado', label: 'Finalizado' },
    ];
    const currentOrder = estadosPedido[pedido.estado]?.orden || 0;
    if (pedido.estado === 'rechazado') {
      return steps.map((s, i) => ({
        ...s,
        status: estadosPedido[s.key].orden < currentOrder ? 'completed' : s.key === pedido.estado ? 'active' : 'pending',
      })).concat([{ key: 'rechazado', label: 'Rechazado', status: 'active' }]);
    }
    return steps.map(s => ({
      ...s,
      status: estadosPedido[s.key].orden < currentOrder ? 'completed' :
        estadosPedido[s.key].orden === currentOrder ? 'active' : 'pending',
    }));
  };

  return (
    <div className="slide-up">
      {/* Toolbar */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Gestión de Pedidos</h2>
          <p className="page-subtitle">Administra las solicitudes y pedidos de los clientes</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Nuevo Pedido
        </button>
      </div>

      <div className="toolbar" style={{ marginBottom: 20 }}>
        <div className="search-input">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            className="form-input"
            placeholder="Buscar por cliente, servicio, zona, ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
        <select className="form-select filter-select" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {Object.entries(estadosPedido).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <select className="form-select filter-select" value={filterPrioridad} onChange={e => setFilterPrioridad(e.target.value)} style={{ minWidth: 140 }}>
          <option value="">Prioridad</option>
          {prioridades.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {filteredPedidos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><ClipboardList size={28} /></div>
          <div className="empty-state-title">No se encontraron pedidos</div>
          <div className="empty-state-text">
            {searchTerm || filterEstado ? 'Intente con otros filtros de búsqueda.' : 'Cree un nuevo pedido para comenzar.'}
          </div>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Servicio</th>
                <th>Zona</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Importe</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPedidos.map(pedido => (
                <tr key={pedido.id}>
                  <td><span className="font-medium text-sm" style={{ color: 'var(--primary-600)' }}>{pedido.id.toUpperCase()}</span></td>
                  <td className="font-medium">{pedido.clienteNombre}</td>
                  <td className="text-sm">{pedido.tipoServicio}</td>
                  <td className="text-sm">{pedido.zona}</td>
                  <td className="text-sm">{formatDate(pedido.fecha)}</td>
                  <td><span className={`badge ${getStatusBadge(pedido.estado)}`}>{getStatusLabel(pedido.estado)}</span></td>
                  <td><span className={`badge badge-${prioridades.find(p => p.value === pedido.prioridad)?.color || 'gray'}`}>{pedido.prioridad?.charAt(0).toUpperCase() + pedido.prioridad?.slice(1)}</span></td>
                  <td className="font-medium">{formatCurrency(pedido.importe)}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openDetail(pedido)} title="Ver detalle"><Eye size={16} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(pedido)} title="Editar"><Edit size={16} /></button>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(pedido)} title="Eliminar" style={{ color: 'var(--danger-500)' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editMode ? 'Editar Pedido' : 'Nuevo Pedido'}
        size="lg"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSave}>{editMode ? 'Guardar Cambios' : 'Crear Pedido'}</button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cliente <span className="required">*</span></label>
              <input name="clienteNombre" className={`form-input ${errors.clienteNombre ? 'error' : ''}`} value={formData.clienteNombre} onChange={handleChange} placeholder="Nombre del cliente" />
              {errors.clienteNombre && <span className="form-error">{errors.clienteNombre}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de Servicio <span className="required">*</span></label>
              <select name="tipoServicio" className={`form-select ${errors.tipoServicio ? 'error' : ''}`} value={formData.tipoServicio} onChange={handleChange}>
                <option value="">Seleccionar servicio</option>
                {tiposServicio.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.tipoServicio && <span className="form-error">{errors.tipoServicio}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Descripción</label>
            <textarea name="descripcion" className="form-textarea" value={formData.descripcion} onChange={handleChange} placeholder="Descripción del pedido..." rows={3} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Dirección <span className="required">*</span></label>
              <input name="direccion" className={`form-input ${errors.direccion ? 'error' : ''}`} value={formData.direccion} onChange={handleChange} placeholder="Dirección de instalación" />
              {errors.direccion && <span className="form-error">{errors.direccion}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Zona <span className="required">*</span></label>
              <select name="zona" className={`form-select ${errors.zona ? 'error' : ''}`} value={formData.zona} onChange={handleChange}>
                <option value="">Seleccionar zona</option>
                {zonas.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              {errors.zona && <span className="form-error">{errors.zona}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Teléfono <span className="required">*</span></label>
              <input name="telefono" className={`form-input ${errors.telefono ? 'error' : ''}`} value={formData.telefono} onChange={handleChange} placeholder="+58 412XXXXXXX" />
              {errors.telefono && <span className="form-error">{errors.telefono}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Correo <span className="required">*</span></label>
              <input name="email" type="email" className={`form-input ${errors.email ? 'error' : ''}`} value={formData.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha <span className="required">*</span></label>
              <input name="fecha" type="date" className={`form-input ${errors.fecha ? 'error' : ''}`} value={formData.fecha} onChange={handleChange} />
              {errors.fecha && <span className="form-error">{errors.fecha}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Importe (Bs.) <span className="required">*</span></label>
              <input name="importe" type="number" step="0.01" min="0" className={`form-input ${errors.importe ? 'error' : ''}`} value={formData.importe} onChange={handleChange} placeholder="0.00" />
              {errors.importe && <span className="form-error">{errors.importe}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Prioridad</label>
              <select name="prioridad" className="form-select" value={formData.prioridad} onChange={handleChange}>
                {prioridades.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            {editMode && (
              <div className="form-group">
                <label className="form-label">Estado</label>
                <select name="estado" className="form-select" value={formData.estado} onChange={handleChange}>
                  {Object.entries(estadosPedido).map(([key, val]) => <option key={key} value={key}>{val.label}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Observaciones</label>
            <textarea name="observaciones" className="form-textarea" value={formData.observaciones} onChange={handleChange} placeholder="Observaciones adicionales..." rows={2} />
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        title={`Detalle del Pedido ${selectedPedido?.id?.toUpperCase() || ''}`}
        size="lg"
      >
        {selectedPedido && (
          <div>
            <div className="detail-grid" style={{ marginBottom: 24 }}>
              <div className="detail-item"><span className="detail-label">Cliente</span><span className="detail-value">{selectedPedido.clienteNombre}</span></div>
              <div className="detail-item"><span className="detail-label">Servicio</span><span className="detail-value">{selectedPedido.tipoServicio}</span></div>
              <div className="detail-item"><span className="detail-label">Dirección</span><span className="detail-value">{selectedPedido.direccion}</span></div>
              <div className="detail-item"><span className="detail-label">Zona</span><span className="detail-value">{selectedPedido.zona}</span></div>
              <div className="detail-item"><span className="detail-label">Teléfono</span><span className="detail-value">{selectedPedido.telefono}</span></div>
              <div className="detail-item"><span className="detail-label">Correo</span><span className="detail-value">{selectedPedido.email}</span></div>
              <div className="detail-item"><span className="detail-label">Fecha</span><span className="detail-value">{formatDate(selectedPedido.fecha)}</span></div>
              <div className="detail-item"><span className="detail-label">Importe</span><span className="detail-value">{formatCurrency(selectedPedido.importe)}</span></div>
              <div className="detail-item"><span className="detail-label">Estado</span><span className={`badge ${getStatusBadge(selectedPedido.estado)}`}>{getStatusLabel(selectedPedido.estado)}</span></div>
              <div className="detail-item"><span className="detail-label">Prioridad</span><span className={`badge badge-${prioridades.find(p => p.value === selectedPedido.prioridad)?.color || 'gray'}`}>{selectedPedido.prioridad?.charAt(0).toUpperCase() + selectedPedido.prioridad?.slice(1)}</span></div>
              {selectedPedido.tecnicoNombre && (
                <div className="detail-item"><span className="detail-label">Técnico</span><span className="detail-value">{selectedPedido.tecnicoNombre}</span></div>
              )}
              {selectedPedido.fechaInstalacion && (
                <div className="detail-item"><span className="detail-label">Fecha Instalación</span><span className="detail-value">{formatDate(selectedPedido.fechaInstalacion)} {selectedPedido.horarioInstalacion}</span></div>
              )}
            </div>

            {selectedPedido.descripcion && (
              <div style={{ marginBottom: 20 }}>
                <span className="detail-label">Descripción</span>
                <p style={{ marginTop: 4, color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{selectedPedido.descripcion}</p>
              </div>
            )}

            {selectedPedido.observaciones && (
              <div style={{ marginBottom: 20 }}>
                <span className="detail-label">Observaciones</span>
                <p style={{ marginTop: 4, color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{selectedPedido.observaciones}</p>
              </div>
            )}

            {/* Status Timeline */}
            <hr className="divider" />
            <h4 className="font-semibold" style={{ marginBottom: 16 }}>Flujo del Pedido</h4>
            <div className="timeline">
              {getTimeline(selectedPedido).map((step, i) => (
                <div key={i} className="timeline-item">
                  <div className={`timeline-dot ${step.status}`}>
                    {step.status === 'completed' ? <CheckCircle size={16} /> : step.status === 'active' ? <ChevronRight size={16} /> : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neutral-300)' }} />}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title" style={{ color: step.status === 'pending' ? 'var(--text-tertiary)' : 'var(--text-primary)' }}>{step.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            {nextStates(selectedPedido.estado).length > 0 && (
              <>
                <hr className="divider" />
                <div className="flex gap-2 flex-wrap">
                  <span className="text-sm text-secondary" style={{ marginRight: 8, alignSelf: 'center' }}>Cambiar estado:</span>
                  {nextStates(selectedPedido.estado).map(estado => (
                    <button key={estado} className={`btn btn-sm ${estado === 'rechazado' ? 'btn-danger' : 'btn-primary'}`} onClick={() => changeEstado(selectedPedido, estado)}>
                      {getStatusLabel(estado)}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => deletePedido(selectedPedido?.id)}
        title="¿Eliminar pedido?"
        message={`Se eliminará el pedido ${selectedPedido?.id?.toUpperCase()} de ${selectedPedido?.clienteNombre}. Esta acción no se puede deshacer.`}
      />
    </div>
  );
};

export default Pedidos;
