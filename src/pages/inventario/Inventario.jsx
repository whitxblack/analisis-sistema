// ============================================
// TecnoInnova S.A. - Control de Inventario
// ============================================

import { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatCurrency, getStockLevel, searchFilter, getCurrentDate } from '../../utils/helpers';
import { validateRequired, validateCantidad, validatePrecio } from '../../utils/validators';
import {
  Plus, Search, Edit, Trash2, Package, ArrowUpCircle, ArrowDownCircle,
  AlertTriangle, RefreshCw, Eye
} from 'lucide-react';

const Inventario = () => {
  const { productos, movimientos, reposiciones, addProducto, updateProducto, deleteProducto, addMovimiento, addReposicion, updateReposicion, showToast } = useData();

  const [tab, setTab] = useState('productos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMovModal, setShowMovModal] = useState(false);
  const [showRepModal, setShowRepModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedProducto, setSelectedProducto] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    nombre: '', codigo: '', categoria: '', stockTotal: '', stockDisponible: '',
    stockReservado: '0', stockMinimo: '', precioUnitario: '', proveedor: '', ubicacion: '',
  });

  const [movData, setMovData] = useState({ tipo: 'entrada', cantidad: '', motivo: '' });
  const [repData, setRepData] = useState({ cantidadSolicitada: '', observaciones: '' });

  const categorias = useMemo(() => [...new Set(productos.map(p => p.categoria))], [productos]);

  const filteredProductos = useMemo(() => {
    let results = searchFilter(productos, searchTerm, ['nombre', 'codigo', 'categoria', 'proveedor']);
    if (filterCategoria) results = results.filter(p => p.categoria === filterCategoria);
    return results;
  }, [productos, searchTerm, filterCategoria]);

  const productosStockBajo = useMemo(() => productos.filter(p => p.stockDisponible <= p.stockMinimo), [productos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (validateRequired(formData.nombre, 'El nombre')) newErrors.nombre = validateRequired(formData.nombre, 'El nombre');
    if (validateRequired(formData.codigo, 'El código')) newErrors.codigo = validateRequired(formData.codigo, 'El código');
    if (validateRequired(formData.categoria, 'La categoría')) newErrors.categoria = validateRequired(formData.categoria, 'La categoría');
    if (validateCantidad(formData.stockTotal, 'El stock total')) newErrors.stockTotal = validateCantidad(formData.stockTotal, 'El stock total');
    if (validateCantidad(formData.stockDisponible, 'El stock disponible')) newErrors.stockDisponible = validateCantidad(formData.stockDisponible, 'El stock disponible');
    if (validateCantidad(formData.stockMinimo, 'El stock mínimo')) newErrors.stockMinimo = validateCantidad(formData.stockMinimo, 'El stock mínimo');
    if (validatePrecio(formData.precioUnitario, 'El precio')) newErrors.precioUnitario = validatePrecio(formData.precioUnitario, 'El precio');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const openCreate = () => {
    setFormData({ nombre: '', codigo: '', categoria: '', stockTotal: '', stockDisponible: '', stockReservado: '0', stockMinimo: '', precioUnitario: '', proveedor: '', ubicacion: '' });
    setEditMode(false); setErrors({}); setShowModal(true);
  };

  const openEdit = (prod) => {
    setFormData({ ...prod, stockTotal: String(prod.stockTotal), stockDisponible: String(prod.stockDisponible), stockReservado: String(prod.stockReservado), stockMinimo: String(prod.stockMinimo), precioUnitario: String(prod.precioUnitario) });
    setSelectedProducto(prod); setEditMode(true); setErrors({}); setShowModal(true);
  };

  const handleSave = () => {
    if (!validate()) return;
    const data = { ...formData, stockTotal: Number(formData.stockTotal), stockDisponible: Number(formData.stockDisponible), stockReservado: Number(formData.stockReservado), stockMinimo: Number(formData.stockMinimo), precioUnitario: Number(formData.precioUnitario) };
    if (editMode) updateProducto(selectedProducto.id, data);
    else addProducto(data);
    setShowModal(false);
  };

  const openMov = (prod) => {
    setSelectedProducto(prod);
    setMovData({ tipo: 'entrada', cantidad: '', motivo: '' });
    setShowMovModal(true);
  };

  const handleMov = () => {
    const cant = Number(movData.cantidad);
    if (!cant || cant <= 0) { showToast('Ingrese una cantidad válida', 'error'); return; }
    if (!movData.motivo.trim()) { showToast('Ingrese un motivo', 'error'); return; }
    if (movData.tipo === 'salida' && cant > selectedProducto.stockDisponible) { showToast('Stock insuficiente', 'error'); return; }

    const newStock = movData.tipo === 'entrada'
      ? { stockTotal: selectedProducto.stockTotal + cant, stockDisponible: selectedProducto.stockDisponible + cant }
      : { stockTotal: selectedProducto.stockTotal - cant, stockDisponible: selectedProducto.stockDisponible - cant };

    updateProducto(selectedProducto.id, newStock);
    addMovimiento({ productoId: selectedProducto.id, productoNombre: selectedProducto.nombre, tipo: movData.tipo, cantidad: cant, fecha: getCurrentDate(), motivo: movData.motivo, responsable: 'Sistema' });
    showToast(`${movData.tipo === 'entrada' ? 'Entrada' : 'Salida'} registrada: ${cant} unidades`);
    setShowMovModal(false);
  };

  const openRep = (prod) => {
    setSelectedProducto(prod);
    setRepData({ cantidadSolicitada: '', observaciones: '' });
    setShowRepModal(true);
  };

  const handleRep = () => {
    const cant = Number(repData.cantidadSolicitada);
    if (!cant || cant <= 0) { showToast('Ingrese una cantidad válida', 'error'); return; }
    addReposicion({ productoId: selectedProducto.id, productoNombre: selectedProducto.nombre, cantidadSolicitada: cant, fecha: getCurrentDate(), estado: 'pendiente', proveedor: selectedProducto.proveedor, observaciones: repData.observaciones, solicitadoPor: 'Sistema' });
    setShowRepModal(false);
  };

  const getStockColor = (prod) => {
    const level = getStockLevel(prod.stockDisponible, prod.stockMinimo);
    if (level === 'agotado') return 'low';
    if (level === 'bajo') return 'low';
    if (level === 'medio') return 'medium';
    return 'high';
  };

  const getStockPercent = (prod) => Math.min(100, (prod.stockDisponible / Math.max(prod.stockTotal, 1)) * 100);

  return (
    <div className="slide-up">
      <div className="page-header">
        <div>
          <h2 className="page-title">Control de Inventario</h2>
          <p className="page-subtitle">Gestión de productos, stock y solicitudes de reposición</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={18} /> Nuevo Producto</button>
      </div>

      {/* Stock Alerts */}
      {productosStockBajo.length > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: 20 }}>
          <AlertTriangle size={18} />
          <span><strong>{productosStockBajo.length}</strong> producto(s) con stock bajo o agotado: {productosStockBajo.map(p => p.nombre).join(', ')}</span>
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === 'productos' ? 'active' : ''}`} onClick={() => setTab('productos')}><Package size={16} style={{ marginRight: 6 }} /> Productos</button>
        <button className={`tab ${tab === 'movimientos' ? 'active' : ''}`} onClick={() => setTab('movimientos')}><ArrowUpCircle size={16} style={{ marginRight: 6 }} /> Movimientos</button>
        <button className={`tab ${tab === 'reposiciones' ? 'active' : ''}`} onClick={() => setTab('reposiciones')}><RefreshCw size={16} style={{ marginRight: 6 }} /> Reposiciones</button>
      </div>

      {tab === 'productos' && (
        <>
          <div className="toolbar" style={{ marginBottom: 20 }}>
            <div className="search-input"><Search className="search-icon" size={18} /><input type="text" className="form-input" placeholder="Buscar producto..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ paddingLeft: 40 }} /></div>
            <select className="form-select filter-select" value={filterCategoria} onChange={e => setFilterCategoria(e.target.value)}>
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {filteredProductos.length === 0 ? (
            <div className="empty-state"><div className="empty-state-icon"><Package size={28} /></div><div className="empty-state-title">No se encontraron productos</div></div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th>Stock</th><th>Disponible</th><th>Reservado</th><th>Precio Unit.</th><th>Acciones</th></tr></thead>
                <tbody>
                  {filteredProductos.map(prod => {
                    const level = getStockLevel(prod.stockDisponible, prod.stockMinimo);
                    return (
                      <tr key={prod.id}>
                        <td><span className="text-sm font-medium" style={{ color: 'var(--primary-600)' }}>{prod.codigo}</span></td>
                        <td className="font-medium">{prod.nombre}</td>
                        <td><span className="badge badge-blue">{prod.categoria}</span></td>
                        <td>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{prod.stockTotal}</span>
                            <div className="stock-bar"><div className={`stock-bar-fill ${getStockColor(prod)}`} style={{ width: `${getStockPercent(prod)}%` }} /></div>
                          </div>
                        </td>
                        <td><span className={`font-medium ${level === 'bajo' || level === 'agotado' ? '' : ''}`} style={{ color: level === 'agotado' ? 'var(--danger-500)' : level === 'bajo' ? 'var(--warning-600)' : 'var(--text-primary)' }}>{prod.stockDisponible}</span></td>
                        <td>{prod.stockReservado}</td>
                        <td>{formatCurrency(prod.precioUnitario)}</td>
                        <td>
                          <div className="flex gap-1">
                            <button className="btn btn-ghost btn-icon btn-sm" title="Movimiento" onClick={() => openMov(prod)}><ArrowUpCircle size={16} /></button>
                            <button className="btn btn-ghost btn-icon btn-sm" title="Reposición" onClick={() => openRep(prod)}><RefreshCw size={16} /></button>
                            <button className="btn btn-ghost btn-icon btn-sm" title="Editar" onClick={() => openEdit(prod)}><Edit size={16} /></button>
                            <button className="btn btn-ghost btn-icon btn-sm" title="Eliminar" onClick={() => { setSelectedProducto(prod); setShowConfirm(true); }} style={{ color: 'var(--danger-500)' }}><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'movimientos' && (
        movimientos.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><ArrowUpCircle size={28} /></div><div className="empty-state-title">No hay movimientos registrados</div></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Motivo</th><th>Responsable</th></tr></thead>
              <tbody>
                {[...movimientos].reverse().map(mov => (
                  <tr key={mov.id}>
                    <td className="text-sm">{mov.fecha}</td>
                    <td className="font-medium">{mov.productoNombre}</td>
                    <td><span className={`badge ${mov.tipo === 'entrada' ? 'badge-green' : 'badge-red'}`}>{mov.tipo === 'entrada' ? '↑ Entrada' : '↓ Salida'}</span></td>
                    <td className="font-medium">{mov.cantidad}</td>
                    <td className="text-sm">{mov.motivo}</td>
                    <td className="text-sm">{mov.responsable}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {tab === 'reposiciones' && (
        reposiciones.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon"><RefreshCw size={28} /></div><div className="empty-state-title">No hay solicitudes de reposición</div></div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Fecha</th><th>Producto</th><th>Cantidad</th><th>Proveedor</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {reposiciones.map(rep => (
                  <tr key={rep.id}>
                    <td className="text-sm">{rep.fecha}</td>
                    <td className="font-medium">{rep.productoNombre}</td>
                    <td className="font-medium">{rep.cantidadSolicitada}</td>
                    <td className="text-sm">{rep.proveedor}</td>
                    <td><span className={`badge ${rep.estado === 'pendiente' ? 'badge-yellow' : rep.estado === 'aprobada' ? 'badge-green' : 'badge-gray'}`}>{rep.estado.charAt(0).toUpperCase() + rep.estado.slice(1)}</span></td>
                    <td>
                      {rep.estado === 'pendiente' && (
                        <button className="btn btn-success btn-sm" onClick={() => updateReposicion(rep.id, { estado: 'aprobada' })}>Aprobar</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Product Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editMode ? 'Editar Producto' : 'Nuevo Producto'} size="lg"
        footer={<><button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleSave}>{editMode ? 'Guardar' : 'Crear'}</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Nombre <span className="required">*</span></label><input name="nombre" className={`form-input ${errors.nombre ? 'error' : ''}`} value={formData.nombre} onChange={handleChange} />{errors.nombre && <span className="form-error">{errors.nombre}</span>}</div>
            <div className="form-group"><label className="form-label">Código <span className="required">*</span></label><input name="codigo" className={`form-input ${errors.codigo ? 'error' : ''}`} value={formData.codigo} onChange={handleChange} />{errors.codigo && <span className="form-error">{errors.codigo}</span>}</div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Categoría <span className="required">*</span></label><input name="categoria" className={`form-input ${errors.categoria ? 'error' : ''}`} value={formData.categoria} onChange={handleChange} placeholder="Ej: Cámaras, Sensores" />{errors.categoria && <span className="form-error">{errors.categoria}</span>}</div>
            <div className="form-group"><label className="form-label">Proveedor</label><input name="proveedor" className="form-input" value={formData.proveedor} onChange={handleChange} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Stock Total <span className="required">*</span></label><input name="stockTotal" type="number" min="0" className={`form-input ${errors.stockTotal ? 'error' : ''}`} value={formData.stockTotal} onChange={handleChange} />{errors.stockTotal && <span className="form-error">{errors.stockTotal}</span>}</div>
            <div className="form-group"><label className="form-label">Stock Disponible <span className="required">*</span></label><input name="stockDisponible" type="number" min="0" className={`form-input ${errors.stockDisponible ? 'error' : ''}`} value={formData.stockDisponible} onChange={handleChange} />{errors.stockDisponible && <span className="form-error">{errors.stockDisponible}</span>}</div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Stock Reservado</label><input name="stockReservado" type="number" min="0" className="form-input" value={formData.stockReservado} onChange={handleChange} /></div>
            <div className="form-group"><label className="form-label">Stock Mínimo <span className="required">*</span></label><input name="stockMinimo" type="number" min="0" className={`form-input ${errors.stockMinimo ? 'error' : ''}`} value={formData.stockMinimo} onChange={handleChange} />{errors.stockMinimo && <span className="form-error">{errors.stockMinimo}</span>}</div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Precio Unitario (Bs.) <span className="required">*</span></label><input name="precioUnitario" type="number" step="0.01" min="0" className={`form-input ${errors.precioUnitario ? 'error' : ''}`} value={formData.precioUnitario} onChange={handleChange} />{errors.precioUnitario && <span className="form-error">{errors.precioUnitario}</span>}</div>
            <div className="form-group"><label className="form-label">Ubicación</label><input name="ubicacion" className="form-input" value={formData.ubicacion} onChange={handleChange} placeholder="Ej: Almacén A" /></div>
          </div>
        </div>
      </Modal>

      {/* Movement Modal */}
      <Modal isOpen={showMovModal} onClose={() => setShowMovModal(false)} title={`Registrar Movimiento — ${selectedProducto?.nombre || ''}`}
        footer={<><button className="btn btn-secondary" onClick={() => setShowMovModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleMov}>Registrar</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedProducto && <div className="alert alert-info"><span>Stock actual: <strong>{selectedProducto.stockDisponible}</strong> disponibles de <strong>{selectedProducto.stockTotal}</strong> total</span></div>}
          <div className="form-group"><label className="form-label">Tipo <span className="required">*</span></label><select className="form-select" value={movData.tipo} onChange={e => setMovData(prev => ({ ...prev, tipo: e.target.value }))}><option value="entrada">↑ Entrada</option><option value="salida">↓ Salida</option></select></div>
          <div className="form-group"><label className="form-label">Cantidad <span className="required">*</span></label><input type="number" min="1" className="form-input" value={movData.cantidad} onChange={e => setMovData(prev => ({ ...prev, cantidad: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Motivo <span className="required">*</span></label><textarea className="form-textarea" value={movData.motivo} onChange={e => setMovData(prev => ({ ...prev, motivo: e.target.value }))} placeholder="Motivo del movimiento..." rows={2} /></div>
        </div>
      </Modal>

      {/* Reposición Modal */}
      <Modal isOpen={showRepModal} onClose={() => setShowRepModal(false)} title={`Solicitar Reposición — ${selectedProducto?.nombre || ''}`}
        footer={<><button className="btn btn-secondary" onClick={() => setShowRepModal(false)}>Cancelar</button><button className="btn btn-primary" onClick={handleRep}>Solicitar</button></>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {selectedProducto && <div className="alert alert-warning"><span>Proveedor: <strong>{selectedProducto.proveedor}</strong> — Stock actual: {selectedProducto.stockDisponible} (mínimo: {selectedProducto.stockMinimo})</span></div>}
          <div className="form-group"><label className="form-label">Cantidad a Solicitar <span className="required">*</span></label><input type="number" min="1" className="form-input" value={repData.cantidadSolicitada} onChange={e => setRepData(prev => ({ ...prev, cantidadSolicitada: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Observaciones</label><textarea className="form-textarea" value={repData.observaciones} onChange={e => setRepData(prev => ({ ...prev, observaciones: e.target.value }))} rows={2} /></div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={showConfirm} onClose={() => setShowConfirm(false)} onConfirm={() => deleteProducto(selectedProducto?.id)} title="¿Eliminar producto?" message={`Se eliminará ${selectedProducto?.nombre} del inventario.`} />
    </div>
  );
};

export default Inventario;
