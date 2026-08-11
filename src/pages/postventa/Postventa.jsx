// ============================================
// TecnoInnova S.A. - Seguimiento Postventa
// ============================================

import { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import Modal from '../../components/common/Modal';
import { formatDate, getStatusBadge, getStatusLabel, searchFilter, getCurrentDate } from '../../utils/helpers';
import {
  HeadphonesIcon, Search, Eye, Edit, Phone, Star, MessageSquare,
  AlertCircle, CheckCircle, Clock, ThumbsUp, ThumbsDown, BarChart3
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#16a34a'];

const StarRating = ({ value, onChange, readonly = false }) => (
  <div className="stars">
    {[1, 2, 3, 4, 5].map(i => (
      <Star
        key={i}
        size={24}
        className={`star ${i <= (value || 0) ? 'filled' : ''}`}
        onClick={() => !readonly && onChange && onChange(i)}
        fill={i <= (value || 0) ? '#f59e0b' : 'none'}
        style={{ cursor: readonly ? 'default' : 'pointer' }}
      />
    ))}
  </div>
);

const Postventa = () => {
  const { seguimientos, pedidos, addSeguimiento, updateSeguimiento, showToast } = useData();

  const [tab, setTab] = useState('seguimientos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [showEncuesta, setShowEncuesta] = useState(false);
  const [selectedSeg, setSelectedSeg] = useState(null);

  const [encuestaData, setEncuestaData] = useState({
    satisfaccion: 0, calificacionTecnico: 0, calificacionServicio: 0,
    comentarios: '', sugerencias: '', reclamos: '', recomendaria: null, tipoResultado: '',
  });

  const filteredSeguimientos = useMemo(() => {
    let results = searchFilter(seguimientos, searchTerm, ['clienteNombre', 'tipoServicio']);
    if (filterEstado) results = results.filter(s => s.estado === filterEstado);
    return results;
  }, [seguimientos, searchTerm, filterEstado]);

  // Pedidos finalizados sin seguimiento
  const pendientesCrear = useMemo(() =>
    pedidos.filter(p => p.estado === 'finalizado' && !seguimientos.some(s => s.pedidoId === p.id)),
    [pedidos, seguimientos]
  );

  // Stats for quality section
  const qualityStats = useMemo(() => {
    const completados = seguimientos.filter(s => s.encuestaCompletada);
    const avgSatisfaccion = completados.length > 0
      ? (completados.reduce((sum, s) => sum + (s.satisfaccion || 0), 0) / completados.length).toFixed(1)
      : 0;
    const avgTecnico = completados.length > 0
      ? (completados.reduce((sum, s) => sum + (s.calificacionTecnico || 0), 0) / completados.length).toFixed(1)
      : 0;
    const recomendarian = completados.filter(s => s.recomendaria === true).length;
    const conReclamos = completados.filter(s => s.reclamos && s.reclamos.trim()).length;

    const distribucion = [
      { name: '1 ⭐', value: completados.filter(s => s.satisfaccion === 1).length, fill: '#ef4444' },
      { name: '2 ⭐', value: completados.filter(s => s.satisfaccion === 2).length, fill: '#f59e0b' },
      { name: '3 ⭐', value: completados.filter(s => s.satisfaccion === 3).length, fill: '#eab308' },
      { name: '4 ⭐', value: completados.filter(s => s.satisfaccion === 4).length, fill: '#22c55e' },
      { name: '5 ⭐', value: completados.filter(s => s.satisfaccion === 5).length, fill: '#16a34a' },
    ].filter(d => d.value > 0);

    return { completados: completados.length, avgSatisfaccion, avgTecnico, recomendarian, conReclamos, distribucion };
  }, [seguimientos]);

  const crearSeguimiento = (pedido) => {
    const fechaContacto = new Date(pedido.fechaInstalacion || pedido.fecha);
    fechaContacto.setDate(fechaContacto.getDate() + 7);

    addSeguimiento({
      pedidoId: pedido.id,
      clienteId: pedido.clienteId,
      clienteNombre: pedido.clienteNombre,
      tipoServicio: pedido.tipoServicio,
      fechaInstalacion: pedido.fechaInstalacion || pedido.fecha,
      fechaContactoProgramado: fechaContacto.toISOString().split('T')[0],
      fechaContactoRealizado: null,
      estado: 'pendiente',
      contactoRealizado: false,
      satisfaccion: null,
      encuestaCompletada: false,
      tipoResultado: null,
      comentarios: '', sugerencias: '', reclamos: '',
      calificacionTecnico: null, calificacionServicio: null, recomendaria: null,
    });
  };

  const registrarContacto = (seg) => {
    updateSeguimiento(seg.id, {
      contactoRealizado: true,
      fechaContactoRealizado: getCurrentDate(),
      estado: 'enProceso',
    });
    showToast('Contacto registrado exitosamente');
  };

  const openEncuesta = (seg) => {
    setSelectedSeg(seg);
    setEncuestaData({
      satisfaccion: seg.satisfaccion || 0,
      calificacionTecnico: seg.calificacionTecnico || 0,
      calificacionServicio: seg.calificacionServicio || 0,
      comentarios: seg.comentarios || '',
      sugerencias: seg.sugerencias || '',
      reclamos: seg.reclamos || '',
      recomendaria: seg.recomendaria,
      tipoResultado: seg.tipoResultado || '',
    });
    setShowEncuesta(true);
  };

  const guardarEncuesta = () => {
    if (!encuestaData.satisfaccion) { showToast('Ingrese la calificación de satisfacción', 'error'); return; }
    updateSeguimiento(selectedSeg.id, {
      ...encuestaData,
      encuestaCompletada: true,
      estado: 'completado',
      tipoResultado: encuestaData.satisfaccion >= 4 ? 'satisfecho' : encuestaData.satisfaccion >= 3 ? 'neutral' : 'insatisfecho',
    });
    setShowEncuesta(false);
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h2 className="page-title">Seguimiento Postventa</h2>
          <p className="page-subtitle">Control de calidad, encuestas y satisfacción del cliente</p>
        </div>
      </div>

      {/* Pending alerts */}
      {pendientesCrear.length > 0 && (
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          <HeadphonesIcon size={18} />
          <span><strong>{pendientesCrear.length}</strong> instalación(es) finalizada(s) sin seguimiento creado.</span>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'seguimientos' ? 'active' : ''}`} onClick={() => setTab('seguimientos')}>
          <HeadphonesIcon size={16} style={{ marginRight: 6 }} /> Seguimientos ({seguimientos.length})
        </button>
        <button className={`tab ${tab === 'pendientes' ? 'active' : ''}`} onClick={() => setTab('pendientes')}>
          <Clock size={16} style={{ marginRight: 6 }} /> Crear ({pendientesCrear.length})
        </button>
        <button className={`tab ${tab === 'calidad' ? 'active' : ''}`} onClick={() => setTab('calidad')}>
          <BarChart3 size={16} style={{ marginRight: 6 }} /> Calidad
        </button>
      </div>

      {/* Tab: Seguimientos */}
      {tab === 'seguimientos' && (
        <>
          <div className="toolbar" style={{ marginBottom: 20 }}>
            <div className="search-input"><Search className="search-icon" size={18} /><input type="text" className="form-input" placeholder="Buscar por cliente..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: 40 }} /></div>
            <select className="form-select filter-select" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="enProceso">En Proceso</option>
              <option value="completado">Completado</option>
            </select>
          </div>

          {filteredSeguimientos.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon"><HeadphonesIcon size={28} /></div><div className="empty-state-title">No hay seguimientos registrados</div></div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Cliente</th><th>Servicio</th><th>Fecha Instalación</th><th>Contacto Prog.</th><th>Estado</th><th>Satisfacción</th><th>Acciones</th></tr></thead>
                <tbody>
                  {filteredSeguimientos.map(seg => (
                    <tr key={seg.id}>
                      <td className="font-medium">{seg.clienteNombre}</td>
                      <td className="text-sm">{seg.tipoServicio}</td>
                      <td className="text-sm">{formatDate(seg.fechaInstalacion)}</td>
                      <td className="text-sm">{formatDate(seg.fechaContactoProgramado)}</td>
                      <td><span className={`badge ${getStatusBadge(seg.estado)}`}>{getStatusLabel(seg.estado)}</span></td>
                      <td>{seg.satisfaccion ? <StarRating value={seg.satisfaccion} readonly /> : <span className="text-tertiary text-sm">Sin encuesta</span>}</td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-ghost btn-icon btn-sm" onClick={() => { setSelectedSeg(seg); setShowDetail(true); }} title="Ver detalle"><Eye size={16} /></button>
                          {!seg.contactoRealizado && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => registrarContacto(seg)} title="Registrar contacto" style={{ color: 'var(--primary-500)' }}><Phone size={16} /></button>}
                          {seg.contactoRealizado && !seg.encuestaCompletada && <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEncuesta(seg)} title="Registrar encuesta" style={{ color: 'var(--success-500)' }}><MessageSquare size={16} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Tab: Crear */}
      {tab === 'pendientes' && (
        pendientesCrear.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><CheckCircle size={28} /></div><div className="empty-state-title">Todas las instalaciones tienen seguimiento</div></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Pedido</th><th>Cliente</th><th>Servicio</th><th>Fecha Instalación</th><th>Acción</th></tr></thead>
              <tbody>
                {pendientesCrear.map(p => (
                  <tr key={p.id}>
                    <td className="font-medium" style={{ color: 'var(--primary-600)' }}>{p.id.toUpperCase()}</td>
                    <td className="font-medium">{p.clienteNombre}</td>
                    <td className="text-sm">{p.tipoServicio}</td>
                    <td className="text-sm">{formatDate(p.fechaInstalacion)}</td>
                    <td><button className="btn btn-primary btn-sm" onClick={() => crearSeguimiento(p)}><HeadphonesIcon size={14} /> Crear Seguimiento</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Tab: Calidad */}
      {tab === 'calidad' && (
        <div>
          {/* Quality KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div className="text-sm text-secondary">Encuestas Completadas</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--primary-600)' }}>{qualityStats.completados}</div>
            </div>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div className="text-sm text-secondary">Satisfacción Promedio</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--warning-500)' }}>⭐ {qualityStats.avgSatisfaccion}</div>
            </div>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div className="text-sm text-secondary">Calif. Técnicos</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--success-600)' }}>⭐ {qualityStats.avgTecnico}</div>
            </div>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div className="text-sm text-secondary">Recomendarían</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--success-600)' }}>{qualityStats.recomendarian}</div>
            </div>
            <div className="card" style={{ padding: 20, textAlign: 'center' }}>
              <div className="text-sm text-secondary">Con Reclamos</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--danger-500)' }}>{qualityStats.conReclamos}</div>
            </div>
          </div>

          {qualityStats.distribucion.length > 0 && (
            <div className="charts-grid">
              <div className="chart-card">
                <h3 className="chart-title">Distribución de Satisfacción</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={qualityStats.distribucion} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {qualityStats.distribucion.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-card">
                <h3 className="chart-title">Calificaciones</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={qualityStats.distribucion}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" name="Clientes" radius={[4, 4, 0, 0]}>
                      {qualityStats.distribucion.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={`Seguimiento — ${selectedSeg?.clienteNombre || ''}`} size="lg">
        {selectedSeg && (
          <div>
            <div className="detail-grid" style={{ marginBottom: 20 }}>
              <div className="detail-item"><span className="detail-label">Cliente</span><span className="detail-value">{selectedSeg.clienteNombre}</span></div>
              <div className="detail-item"><span className="detail-label">Servicio</span><span className="detail-value">{selectedSeg.tipoServicio}</span></div>
              <div className="detail-item"><span className="detail-label">Fecha Instalación</span><span className="detail-value">{formatDate(selectedSeg.fechaInstalacion)}</span></div>
              <div className="detail-item"><span className="detail-label">Contacto Programado</span><span className="detail-value">{formatDate(selectedSeg.fechaContactoProgramado)}</span></div>
              <div className="detail-item"><span className="detail-label">Contacto Realizado</span><span className="detail-value">{selectedSeg.contactoRealizado ? `✅ ${formatDate(selectedSeg.fechaContactoRealizado)}` : '❌ Pendiente'}</span></div>
              <div className="detail-item"><span className="detail-label">Estado</span><span className={`badge ${getStatusBadge(selectedSeg.estado)}`}>{getStatusLabel(selectedSeg.estado)}</span></div>
            </div>
            {selectedSeg.encuestaCompletada && (
              <>
                <hr className="divider" />
                <h4 className="font-semibold" style={{ marginBottom: 12 }}>Resultados de Encuesta</h4>
                <div className="detail-grid" style={{ marginBottom: 16 }}>
                  <div className="detail-item"><span className="detail-label">Satisfacción General</span><StarRating value={selectedSeg.satisfaccion} readonly /></div>
                  <div className="detail-item"><span className="detail-label">Calificación Técnico</span><StarRating value={selectedSeg.calificacionTecnico} readonly /></div>
                  <div className="detail-item"><span className="detail-label">Calificación Servicio</span><StarRating value={selectedSeg.calificacionServicio} readonly /></div>
                  <div className="detail-item"><span className="detail-label">¿Recomendaría?</span><span className="detail-value">{selectedSeg.recomendaria ? '👍 Sí' : '👎 No'}</span></div>
                </div>
                {selectedSeg.comentarios && <div style={{ marginBottom: 12 }}><span className="detail-label">Comentarios</span><p className="text-sm" style={{ marginTop: 4 }}>{selectedSeg.comentarios}</p></div>}
                {selectedSeg.sugerencias && <div style={{ marginBottom: 12 }}><span className="detail-label">Sugerencias</span><p className="text-sm" style={{ marginTop: 4 }}>{selectedSeg.sugerencias}</p></div>}
                {selectedSeg.reclamos && <div style={{ marginBottom: 12 }}><span className="detail-label">Reclamos</span><p className="text-sm" style={{ marginTop: 4, color: 'var(--danger-600)' }}>{selectedSeg.reclamos}</p></div>}
              </>
            )}

            {/* Flujo postventa */}
            <hr className="divider" />
            <h4 className="font-semibold" style={{ marginBottom: 12 }}>Flujo Postventa</h4>
            <div className="timeline">
              {[
                { label: 'Instalación Finalizada', done: true },
                { label: 'Espera de 1 Semana', done: true },
                { label: 'Alerta de Contacto', done: true },
                { label: 'Contacto Realizado', done: selectedSeg.contactoRealizado },
                { label: 'Encuesta Completada', done: selectedSeg.encuestaCompletada },
                { label: 'Registro de Calidad', done: selectedSeg.estado === 'completado' },
              ].map((step, i) => (
                <div key={i} className="timeline-item">
                  <div className={`timeline-dot ${step.done ? 'completed' : ''}`}>{step.done ? <CheckCircle size={16} /> : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neutral-300)' }} />}</div>
                  <div className="timeline-content"><div className="timeline-title" style={{ color: step.done ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{step.label}</div></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Encuesta Modal */}
      <Modal isOpen={showEncuesta} onClose={() => setShowEncuesta(false)} title={`Encuesta de Satisfacción — ${selectedSeg?.clienteNombre || ''}`} size="lg"
        footer={<><button className="btn btn-secondary" onClick={() => setShowEncuesta(false)}>Cancelar</button><button className="btn btn-primary" onClick={guardarEncuesta}>Guardar Encuesta</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label">Satisfacción General <span className="required">*</span></label>
            <StarRating value={encuestaData.satisfaccion} onChange={(v) => setEncuestaData(prev => ({ ...prev, satisfaccion: v }))} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Calificación del Técnico</label>
              <StarRating value={encuestaData.calificacionTecnico} onChange={(v) => setEncuestaData(prev => ({ ...prev, calificacionTecnico: v }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Calificación del Servicio</label>
              <StarRating value={encuestaData.calificacionServicio} onChange={(v) => setEncuestaData(prev => ({ ...prev, calificacionServicio: v }))} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">¿Recomendaría nuestro servicio?</label>
            <div className="flex gap-3">
              <button className={`btn ${encuestaData.recomendaria === true ? 'btn-success' : 'btn-secondary'} btn-sm`} onClick={() => setEncuestaData(prev => ({ ...prev, recomendaria: true }))}><ThumbsUp size={16} /> Sí</button>
              <button className={`btn ${encuestaData.recomendaria === false ? 'btn-danger' : 'btn-secondary'} btn-sm`} onClick={() => setEncuestaData(prev => ({ ...prev, recomendaria: false }))}><ThumbsDown size={16} /> No</button>
            </div>
          </div>
          <div className="form-group"><label className="form-label">Comentarios</label><textarea className="form-textarea" value={encuestaData.comentarios} onChange={e => setEncuestaData(prev => ({ ...prev, comentarios: e.target.value }))} placeholder="Comentarios del cliente..." rows={2} /></div>
          <div className="form-group"><label className="form-label">Sugerencias</label><textarea className="form-textarea" value={encuestaData.sugerencias} onChange={e => setEncuestaData(prev => ({ ...prev, sugerencias: e.target.value }))} placeholder="Sugerencias del cliente..." rows={2} /></div>
          <div className="form-group"><label className="form-label">Reclamos</label><textarea className="form-textarea" value={encuestaData.reclamos} onChange={e => setEncuestaData(prev => ({ ...prev, reclamos: e.target.value }))} placeholder="Reclamos del cliente (si los hay)..." rows={2} /></div>
        </div>
      </Modal>
    </div>
  );
};

export default Postventa;
