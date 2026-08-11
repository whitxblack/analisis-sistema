// ============================================
// TecnoInnova S.A. - Facturación
// ============================================

import { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import Modal from '../../components/common/Modal';
import { formatDate, formatCurrency, getStatusBadge, getStatusLabel, searchFilter, getCurrentDate, getDateFromNow } from '../../utils/helpers';
import {
  Plus, Search, Eye, FileText, Send, CheckCircle, Archive,
  DollarSign, Printer, Mail
} from 'lucide-react';

const Facturacion = () => {
  const { facturas, pedidos, addFactura, updateFactura, showToast } = useData();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedFactura, setSelectedFactura] = useState(null);
  const [createPedidoId, setCreatePedidoId] = useState('');

  const filteredFacturas = useMemo(() => {
    let results = searchFilter(facturas, searchTerm, ['clienteNombre', 'numeroFactura', 'id']);
    if (filterEstado) results = results.filter(f => f.estado === filterEstado);
    return results.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [facturas, searchTerm, filterEstado]);

  const pedidosParaFacturar = useMemo(() =>
    pedidos.filter(p => ['finalizado', 'programado', 'aprobado'].includes(p.estado) && !facturas.some(f => f.pedidoId === p.id)),
    [pedidos, facturas]
  );

  const totalFacturado = useMemo(() => facturas.reduce((sum, f) => sum + f.total, 0), [facturas]);
  const totalCobrado = useMemo(() => facturas.filter(f => f.estado === 'pagada').reduce((sum, f) => sum + f.total, 0), [facturas]);
  const totalPendiente = totalFacturado - totalCobrado;

  const openDetail = (fac) => { setSelectedFactura(fac); setShowDetail(true); };

  const crearFactura = () => {
    if (!createPedidoId) { showToast('Seleccione un pedido', 'error'); return; }
    const pedido = pedidos.find(p => p.id === createPedidoId);
    if (!pedido) return;

    const subtotal = pedido.importe || 0;
    const impuestos = Math.round(subtotal * 0.13 * 100) / 100;
    const total = subtotal + impuestos;

    const newFactura = {
      pedidoId: pedido.id,
      clienteId: pedido.clienteId,
      clienteNombre: pedido.clienteNombre,
      fecha: getCurrentDate(),
      fechaVencimiento: getDateFromNow(30),
      subtotal,
      impuestos,
      total,
      estado: 'generada',
      metodoPago: null,
      numeroFactura: `FV-${new Date().getFullYear()}-${String(facturas.length + 1).padStart(4, '0')}`,
      enviada: false,
      fechaEnvio: null,
      archivada: false,
      observaciones: `Factura generada para pedido ${pedido.id.toUpperCase()} — ${pedido.tipoServicio}`,
      items: [
        { descripcion: pedido.tipoServicio, cantidad: 1, precioUnit: subtotal, subtotal },
      ],
    };

    addFactura(newFactura);
    setShowCreate(false);
    setCreatePedidoId('');
  };

  const cambiarEstado = (fac, nuevoEstado) => {
    const updates = { estado: nuevoEstado };
    if (nuevoEstado === 'enviada') {
      updates.enviada = true;
      updates.fechaEnvio = getCurrentDate();
    }
    if (nuevoEstado === 'archivada') {
      updates.archivada = true;
    }
    updateFactura(fac.id, updates);
    if (showDetail) setSelectedFactura({ ...fac, ...updates });
  };

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h2 className="page-title">Facturación</h2>
          <p className="page-subtitle">Gestión de facturas, pagos y registros contables</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={18} /> Nueva Factura
        </button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: 20 }}>
          <div className="text-sm text-secondary" style={{ marginBottom: 4 }}>Total Facturado</div>
          <div className="text-2xl font-bold" style={{ color: 'var(--primary-600)' }}>{formatCurrency(totalFacturado)}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="text-sm text-secondary" style={{ marginBottom: 4 }}>Total Cobrado</div>
          <div className="text-2xl font-bold" style={{ color: 'var(--success-600)' }}>{formatCurrency(totalCobrado)}</div>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <div className="text-sm text-secondary" style={{ marginBottom: 4 }}>Pendiente de Cobro</div>
          <div className="text-2xl font-bold" style={{ color: 'var(--warning-600)' }}>{formatCurrency(totalPendiente)}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar" style={{ marginBottom: 20 }}>
        <div className="search-input">
          <Search className="search-icon" size={18} />
          <input type="text" className="form-input" placeholder="Buscar factura..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: 40 }} />
        </div>
        <select className="form-select filter-select" value={filterEstado} onChange={e => setFilterEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="generada">Generada</option>
          <option value="enviada">Enviada</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagada">Pagada</option>
          <option value="archivada">Archivada</option>
        </select>
      </div>

      {/* Table */}
      {filteredFacturas.length === 0 ? (
        <div className="empty-state"><div className="empty-state-icon"><FileText size={28} /></div><div className="empty-state-title">No se encontraron facturas</div></div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead><tr><th>N° Factura</th><th>Cliente</th><th>Fecha</th><th>Vencimiento</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              {filteredFacturas.map(fac => (
                <tr key={fac.id}>
                  <td><span className="font-medium" style={{ color: 'var(--primary-600)' }}>{fac.numeroFactura}</span></td>
                  <td className="font-medium">{fac.clienteNombre}</td>
                  <td className="text-sm">{formatDate(fac.fecha)}</td>
                  <td className="text-sm">{formatDate(fac.fechaVencimiento)}</td>
                  <td className="font-semibold">{formatCurrency(fac.total)}</td>
                  <td><span className={`badge ${getStatusBadge(fac.estado)}`}>{getStatusLabel(fac.estado)}</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openDetail(fac)} title="Ver detalle"><Eye size={16} /></button>
                      {fac.estado === 'generada' && (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => cambiarEstado(fac, 'enviada')} title="Enviar"><Send size={16} /></button>
                      )}
                      {(fac.estado === 'enviada' || fac.estado === 'pendiente') && (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => cambiarEstado(fac, 'pagada')} title="Marcar pagada" style={{ color: 'var(--success-500)' }}><CheckCircle size={16} /></button>
                      )}
                      {fac.estado === 'pagada' && (
                        <button className="btn btn-ghost btn-icon btn-sm" onClick={() => cambiarEstado(fac, 'archivada')} title="Archivar"><Archive size={16} /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={`Factura ${selectedFactura?.numeroFactura || ''}`} size="lg">
        {selectedFactura && (
          <div>
            <div className="detail-grid" style={{ marginBottom: 24 }}>
              <div className="detail-item"><span className="detail-label">N° Factura</span><span className="detail-value">{selectedFactura.numeroFactura}</span></div>
              <div className="detail-item"><span className="detail-label">Cliente</span><span className="detail-value">{selectedFactura.clienteNombre}</span></div>
              <div className="detail-item"><span className="detail-label">Fecha Emisión</span><span className="detail-value">{formatDate(selectedFactura.fecha)}</span></div>
              <div className="detail-item"><span className="detail-label">Vencimiento</span><span className="detail-value">{formatDate(selectedFactura.fechaVencimiento)}</span></div>
              <div className="detail-item"><span className="detail-label">Estado</span><span className={`badge ${getStatusBadge(selectedFactura.estado)}`}>{getStatusLabel(selectedFactura.estado)}</span></div>
              <div className="detail-item"><span className="detail-label">Pedido</span><span className="detail-value">{selectedFactura.pedidoId?.toUpperCase()}</span></div>
              {selectedFactura.metodoPago && <div className="detail-item"><span className="detail-label">Método de Pago</span><span className="detail-value">{selectedFactura.metodoPago}</span></div>}
              {selectedFactura.enviada && <div className="detail-item"><span className="detail-label">Enviada</span><span className="detail-value">✅ {formatDate(selectedFactura.fechaEnvio)}</span></div>}
            </div>

            {/* Invoice items */}
            <h4 className="font-semibold" style={{ marginBottom: 12 }}>Detalle de Factura</h4>
            <div className="table-container" style={{ marginBottom: 20 }}>
              <table className="data-table">
                <thead><tr><th>Descripción</th><th>Cant.</th><th>Precio Unit.</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {selectedFactura.items?.map((item, i) => (
                    <tr key={i}>
                      <td>{item.descripcion}</td>
                      <td>{item.cantidad}</td>
                      <td>{formatCurrency(item.precioUnit)}</td>
                      <td className="font-medium">{formatCurrency(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <div className="flex justify-between" style={{ width: 250 }}><span className="text-secondary">Subtotal:</span><span className="font-medium">{formatCurrency(selectedFactura.subtotal)}</span></div>
              <div className="flex justify-between" style={{ width: 250 }}><span className="text-secondary">Impuestos (13%):</span><span className="font-medium">{formatCurrency(selectedFactura.impuestos)}</span></div>
              <hr className="divider" style={{ width: 250 }} />
              <div className="flex justify-between" style={{ width: 250 }}><span className="font-semibold text-lg">Total:</span><span className="font-bold text-lg" style={{ color: 'var(--primary-600)' }}>{formatCurrency(selectedFactura.total)}</span></div>
            </div>

            {/* Status flow */}
            <hr className="divider" />
            <h4 className="font-semibold" style={{ marginBottom: 12 }}>Flujo de Factura</h4>
            <div className="timeline">
              {[
                { label: 'Factura Generada', done: true },
                { label: 'Envío por Correo', done: selectedFactura.enviada },
                { label: 'Pago Recibido', done: selectedFactura.estado === 'pagada' || selectedFactura.estado === 'archivada' },
                { label: 'Archivo Digital', done: selectedFactura.archivada },
                { label: 'Datos Contables', done: selectedFactura.archivada },
              ].map((step, i) => (
                <div key={i} className="timeline-item">
                  <div className={`timeline-dot ${step.done ? 'completed' : ''}`}>{step.done ? <CheckCircle size={16} /> : <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--neutral-300)' }} />}</div>
                  <div className="timeline-content"><div className="timeline-title" style={{ color: step.done ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>{step.label}</div></div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <hr className="divider" />
            <div className="flex gap-2 flex-wrap">
              {selectedFactura.estado === 'generada' && <button className="btn btn-primary btn-sm" onClick={() => cambiarEstado(selectedFactura, 'enviada')}><Send size={14} /> Enviar al Cliente</button>}
              {(selectedFactura.estado === 'enviada' || selectedFactura.estado === 'pendiente') && <button className="btn btn-success btn-sm" onClick={() => cambiarEstado(selectedFactura, 'pagada')}><DollarSign size={14} /> Registrar Pago</button>}
              {selectedFactura.estado === 'pagada' && <button className="btn btn-secondary btn-sm" onClick={() => cambiarEstado(selectedFactura, 'archivada')}><Archive size={14} /> Archivar</button>}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Invoice Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Crear Nueva Factura"
        footer={<><button className="btn btn-secondary" onClick={() => setShowCreate(false)}>Cancelar</button><button className="btn btn-primary" onClick={crearFactura}>Generar Factura</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p className="text-sm text-secondary">Seleccione un pedido aprobado o finalizado para generar la factura correspondiente.</p>
          <div className="form-group">
            <label className="form-label">Pedido <span className="required">*</span></label>
            <select className="form-select" value={createPedidoId} onChange={e => setCreatePedidoId(e.target.value)}>
              <option value="">Seleccionar pedido</option>
              {pedidosParaFacturar.map(p => (
                <option key={p.id} value={p.id}>
                  {p.id.toUpperCase()} — {p.clienteNombre} — {p.tipoServicio} — {formatCurrency(p.importe)}
                </option>
              ))}
            </select>
          </div>
          {pedidosParaFacturar.length === 0 && (
            <div className="alert alert-info"><span>No hay pedidos pendientes de facturación.</span></div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Facturacion;
