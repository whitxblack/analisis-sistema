// ============================================
// TecnoInnova S.A. - Asignación de Técnicos
// ============================================

import { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate, getStatusBadge, getStatusLabel, searchFilter, getCurrentDate } from '../../utils/helpers';
import { validateRequired, validateNombre, validateEmail, validateTelefono } from '../../utils/validators';
import { zonas } from '../../utils/constants';
import {
  Plus, Search, Eye, Edit, Trash2, Wrench, UserCheck, UserX,
  Calendar, MapPin, Clock, ChevronRight
} from 'lucide-react';

const Tecnicos = () => {
  const { tecnicos, pedidos, addTecnico, updateTecnico, deleteTecnico, updatePedido, showToast } = useData();

  const [tab, setTab] = useState('tecnicos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedTecnico, setSelectedTecnico] = useState(null);
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    nombre: '', apellido: '', email: '', telefono: '',
    especialidad: '', zona: '', estado: 'disponible', cargaTrabajo: 0, maxCarga: 5,
  });

  const [assignData, setAssignData] = useState({
    tecnicoId: '', fechaInstalacion: '', horarioInstalacion: '',
  });

  const pedidosPendientes = useMemo(() =>
    pedidos.filter(p => ['aprobado'].includes(p.estado) && !p.tecnicoId),
    [pedidos]
  );

  const instalaciones = useMemo(() =>
    pedidos.filter(p => p.tecnicoId && ['programado', 'enInstalacion', 'aprobado', 'finalizado'].includes(p.estado))
      .sort((a, b) => new Date(b.fechaInstalacion || b.fecha) - new Date(a.fechaInstalacion || a.fecha)),
    [pedidos]
  );

  const filteredTecnicos = useMemo(() => {
    let results = searchFilter(tecnicos, searchTerm, ['nombre', 'apellido', 'zona', 'especialidad']);
    if (filterEstado) results = results.filter(t => t.estado === filterEstado);
    return results;
  }, [tecnicos, searchTerm, filterEstado]);

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
    const t = validateTelefono(formData.telefono);
    if (t) newErrors.telefono = t;
    const esp = validateRequired(formData.especialidad, 'La especialidad');
    if (esp) newErrors.especialidad = esp;
    const z = validateRequired(formData.zona, 'La zona');
    if (z) newErrors.zona = z;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openCreate = () => {
    setFormData({ nombre: '', apellido: '', email: '', telefono: '', especialidad: '', zona: '', estado: 'disponible', cargaTrabajo: 0, maxCarga: 5 });
    setEditMode(false);
    setErrors({});
    setShowModal(true);
  };

  const openEdit = (tec) => {
    setFormData({ ...tec });
    setSelectedTecnico(tec);
    setEditMode(true);
    setErrors({});
    setShowModal(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editMode) {
      updateTecnico(selectedTecnico.id, formData);
    } else {
      addTecnico(formData);
    }
    setShowModal(false);
  };

  const openAssign = (pedido) => {
    setSelectedPedido(pedido);
    setAssignData({ tecnicoId: '', fechaInstalacion: '', horarioInstalacion: '' });
    setShowAssign(true);
  };

  const handleAssign = () => {
    if (!assignData.tecnicoId || !assignData.fechaInstalacion || !assignData.horarioInstalacion) {
      showToast('Complete todos los campos de asignación', 'error');
      return;
    }
    const tec = tecnicos.find(t => t.id === assignData.tecnicoId);
    updatePedido(selectedPedido.id, {
      tecnicoId: tec.id,
      tecnicoNombre: `${tec.nombre} ${tec.apellido}`,
      fechaInstalacion: assignData.fechaInstalacion,
      horarioInstalacion: assignData.horarioInstalacion,
      estado: 'programado',
    });
    updateTecnico(tec.id, { cargaTrabajo: tec.cargaTrabajo + 1, estado: tec.cargaTrabajo + 1 >= tec.maxCarga ? 'ocupado' : 'disponible' });
    setShowAssign(false);
    showToast(`Técnico ${tec.nombre} asignado al pedido ${selectedPedido.id.toUpperCase()}`);
  };

  const handleUnassign = (pedido) => {
    const tecId = pedido.tecnicoId;
    updatePedido(pedido.id, {
      tecnicoId: null,
      tecnicoNombre: null,
      fechaInstalacion: null,
      horarioInstalacion: null,
      estado: 'aprobado',
    });
    
    if (tecId) {
      const tec = tecnicos.find(t => t.id === tecId);
      if (tec) {
        const newCarga = Math.max(0, tec.cargaTrabajo - 1);
        updateTecnico(tecId, {
          cargaTrabajo: newCarga,
          estado: newCarga >= tec.maxCarga ? 'ocupado' : 'disponible'
        });
      }
    }
    showToast(`Técnico desasignado del pedido ${pedido.id.toUpperCase()}`);
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h2 className="page-title">Asignación de Técnicos</h2>
          <p className="page-subtitle">Gestiona técnicos, asignaciones y cronograma de instalaciones</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={18} /> Nuevo Técnico
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'tecnicos' ? 'active' : ''}`} onClick={() => setTab('tecnicos')}>
          <Wrench size={16} style={{ marginRight: 6 }} /> Técnicos ({tecnicos.length})
        </button>
        <button className={`tab ${tab === 'asignar' ? 'active' : ''}`} onClick={() => setTab('asignar')}>
          <UserCheck size={16} style={{ marginRight: 6 }} /> Pendientes ({pedidosPendientes.length})
        </button>
        <button className={`tab ${tab === 'cronograma' ? 'active' : ''}`} onClick={() => setTab('cronograma')}>
          <Calendar size={16} style={{ marginRight: 6 }} /> Cronograma ({instalaciones.length})
        </button>
      </div>

      {/* Tab: Técnicos */}
      {tab === 'tecnicos' && (
        <>
          <div className="toolbar" style={{ marginBottom: 20 }}>
            <div className="search-input">
              <Search className="search-icon" size={18} />
              <input type="text" className="form-input" placeholder="Buscar técnico..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: 40 }} />
            </div>
            <select className="form-select filter-select" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
              <option value="">Todos</option>
              <option value="disponible">Disponible</option>
              <option value="ocupado">Ocupado</option>
            </select>
          </div>

          {filteredTecnicos.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon"><Wrench size={28} /></div><div className="empty-state-title">No se encontraron técnicos</div></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {filteredTecnicos.map(tec => (
                <div key={tec.id} className="card" style={{ padding: 20 }}>
                  <div className="flex justify-between items-start" style={{ marginBottom: 12 }}>
                    <div>
                      <h3 className="font-semibold">{tec.nombre} {tec.apellido}</h3>
                      <p className="text-sm text-secondary">{tec.especialidad}</p>
                    </div>
                    <span className={`badge ${getStatusBadge(tec.estado)}`}>{getStatusLabel(tec.estado)}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                    <div className="flex items-center gap-2 text-sm"><MapPin size={14} style={{ color: 'var(--text-tertiary)' }} /> {tec.zona}</div>
                    <div className="flex items-center gap-2 text-sm"><Clock size={14} style={{ color: 'var(--text-tertiary)' }} /> Carga: {tec.cargaTrabajo}/{tec.maxCarga}</div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div className="stock-bar" style={{ maxWidth: '100%' }}>
                      <div className={`stock-bar-fill ${tec.cargaTrabajo >= tec.maxCarga ? 'low' : tec.cargaTrabajo >= tec.maxCarga * 0.6 ? 'medium' : 'high'}`}
                        style={{ width: `${(tec.cargaTrabajo / tec.maxCarga) * 100}%` }} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary btn-sm" onClick={() => openEdit(tec)}><Edit size={14} /> Editar</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setSelectedTecnico(tec); setShowConfirm(true); }} style={{ color: 'var(--danger-500)' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab: Pedidos por asignar */}
      {tab === 'asignar' && (
        pedidosPendientes.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><UserCheck size={28} /></div><div className="empty-state-title">No hay pedidos pendientes de asignación</div><div className="empty-state-text">Los pedidos aprobados aparecerán aquí para asignar técnico.</div></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Pedido</th><th>Cliente</th><th>Servicio</th><th>Zona</th><th>Prioridad</th><th>Acción</th></tr></thead>
              <tbody>
                {pedidosPendientes.map(p => (
                  <tr key={p.id}>
                    <td className="font-medium" style={{ color: 'var(--primary-600)' }}>{p.id.toUpperCase()}</td>
                    <td>{p.clienteNombre}</td>
                    <td className="text-sm">{p.tipoServicio}</td>
                    <td className="text-sm">{p.zona}</td>
                    <td><span className={`badge badge-${p.prioridad === 'alta' ? 'red' : p.prioridad === 'media' ? 'yellow' : 'gray'}`}>{p.prioridad?.charAt(0).toUpperCase() + p.prioridad?.slice(1)}</span></td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => openAssign(p)}><UserCheck size={14} /> Asignar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Tab: Cronograma */}
      {tab === 'cronograma' && (
        instalaciones.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><Calendar size={28} /></div><div className="empty-state-title">No hay instalaciones programadas</div></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Pedido</th><th>Técnico</th><th>Zona</th><th>Fecha</th><th>Horario</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {instalaciones.map(p => (
                  <tr key={p.id}>
                    <td><div><span className="font-medium" style={{ color: 'var(--primary-600)' }}>{p.id.toUpperCase()}</span><br /><span className="text-sm text-secondary">{p.clienteNombre}</span></div></td>
                    <td className="font-medium">{p.tecnicoNombre || '-'}</td>
                    <td className="text-sm">{p.zona}</td>
                    <td className="text-sm">{formatDate(p.fechaInstalacion)}</td>
                    <td className="text-sm">{p.horarioInstalacion || '-'}</td>
                    <td><span className={`badge ${getStatusBadge(p.estado)}`}>{getStatusLabel(p.estado)}</span></td>
                    <td>
                      {p.estado === 'programado' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleUnassign(p)} style={{ color: 'var(--danger-500)' }}>
                          Desasignar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Create/Edit Técnico Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editMode ? 'Editar Técnico' : 'Nuevo Técnico'} size="lg"
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleSave}>{editMode ? 'Guardar' : 'Crear'}</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Nombre <span className="required">*</span></label><input name="nombre" className={`form-input ${errors.nombre ? 'error' : ''}`} value={formData.nombre} onChange={handleChange} />{errors.nombre && <span className="form-error">{errors.nombre}</span>}</div>
            <div className="form-group"><label className="form-label">Apellido <span className="required">*</span></label><input name="apellido" className={`form-input ${errors.apellido ? 'error' : ''}`} value={formData.apellido} onChange={handleChange} />{errors.apellido && <span className="form-error">{errors.apellido}</span>}</div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Email <span className="required">*</span></label><input name="email" type="email" className={`form-input ${errors.email ? 'error' : ''}`} value={formData.email} onChange={handleChange} />{errors.email && <span className="form-error">{errors.email}</span>}</div>
            <div className="form-group"><label className="form-label">Teléfono <span className="required">*</span></label><input name="telefono" className={`form-input ${errors.telefono ? 'error' : ''}`} value={formData.telefono} onChange={handleChange} />{errors.telefono && <span className="form-error">{errors.telefono}</span>}</div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Especialidad <span className="required">*</span></label><input name="especialidad" className={`form-input ${errors.especialidad ? 'error' : ''}`} value={formData.especialidad} onChange={handleChange} placeholder="Ej: Cámaras de Seguridad" />{errors.especialidad && <span className="form-error">{errors.especialidad}</span>}</div>
            <div className="form-group"><label className="form-label">Zona <span className="required">*</span></label><select name="zona" className={`form-select ${errors.zona ? 'error' : ''}`} value={formData.zona} onChange={handleChange}><option value="">Seleccionar</option>{zonas.map(z => <option key={z} value={z}>{z}</option>)}</select>{errors.zona && <span className="form-error">{errors.zona}</span>}</div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Estado</label><select name="estado" className="form-select" value={formData.estado} onChange={handleChange}><option value="disponible">Disponible</option><option value="ocupado">Ocupado</option></select></div>
            <div className="form-group"><label className="form-label">Carga Máxima</label><input name="maxCarga" type="number" min="1" max="10" className="form-input" value={formData.maxCarga} onChange={handleChange} /></div>
          </div>
        </div>
      </Modal>

      {/* Assign Técnico Modal */}
      <Modal isOpen={showAssign} onClose={() => setShowAssign(false)} title={`Asignar Técnico al Pedido ${selectedPedido?.id?.toUpperCase() || ''}`}
        footer={<><button className="btn btn-secondary" onClick={() => setShowAssign(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleAssign}>Asignar</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedPedido && (
            <div className="alert alert-info">
              <span><strong>{selectedPedido.clienteNombre}</strong> — {selectedPedido.tipoServicio} — Zona: {selectedPedido.zona}</span>
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Técnico <span className="required">*</span></label>
            <select className="form-select" value={assignData.tecnicoId} onChange={e => setAssignData(prev => ({ ...prev, tecnicoId: e.target.value }))}>
              <option value="">Seleccionar técnico</option>
              {tecnicos.filter(t => t.estado === 'disponible').map(t => (
                <option key={t.id} value={t.id}>
                  {t.nombre} {t.apellido} — {t.zona} — Carga: {t.cargaTrabajo}/{t.maxCarga}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha de Instalación <span className="required">*</span></label>
              <input type="date" className="form-input" value={assignData.fechaInstalacion} onChange={e => setAssignData(prev => ({ ...prev, fechaInstalacion: e.target.value }))} min={getCurrentDate()} />
            </div>
            <div className="form-group">
              <label className="form-label">Horario <span className="required">*</span></label>
              <select className="form-select" value={assignData.horarioInstalacion} onChange={e => setAssignData(prev => ({ ...prev, horarioInstalacion: e.target.value }))}>
                <option value="">Seleccionar</option>
                <option value="08:00 - 12:00">08:00 - 12:00</option>
                <option value="09:00 - 13:00">09:00 - 13:00</option>
                <option value="10:00 - 14:00">10:00 - 14:00</option>
                <option value="14:00 - 17:00">14:00 - 17:00</option>
                <option value="14:00 - 18:00">14:00 - 18:00</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={() => deleteTecnico(selectedTecnico?.id)} title="¿Eliminar técnico?" message={`Se eliminará a ${selectedTecnico?.nombre} ${selectedTecnico?.apellido} del sistema.`} />
    </div>
  );
};

export default Tecnicos;
