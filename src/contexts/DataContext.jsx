import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';

const DataContext = createContext();

// Helper functions to map snake_case and camelCase keys
const snakeToCamel = (str) =>
  str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );

const camelToSnake = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const mapKeys = (obj, mappingFn) => {
  if (Array.isArray(obj)) {
    return obj.map(val => mapKeys(val, mappingFn));
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      const nextKey = mappingFn(key);
      const val = obj[key];
      // Keep jsonb structure of 'items' inside facturas untouched
      if (key === 'items') {
        acc[nextKey] = val;
      } else {
        acc[nextKey] = mapKeys(val, mappingFn);
      }
      return acc;
    }, {});
  }
  return obj;
};

const toCamel = (obj) => mapKeys(obj, snakeToCamel);
const toSnake = (obj) => mapKeys(obj, camelToSnake);

export const DataProvider = ({ children }) => {
  const [pedidos, setPedidos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [reposiciones, setReposiciones] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [seguimientos, setSeguimientos] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [
        { data: dPedidos },
        { data: dTecnicos },
        { data: dProductos },
        { data: dMovimientos },
        { data: dReposiciones },
        { data: dFacturas },
        { data: dSeguimientos },
        { data: dUsers }
      ] = await Promise.all([
        supabase.from('pedidos').select('*').order('created_at', { ascending: false }),
        supabase.from('tecnicos').select('*').order('nombre', { ascending: true }),
        supabase.from('productos').select('*').order('nombre', { ascending: true }),
        supabase.from('movimientos').select('*').order('fecha', { ascending: false }),
        supabase.from('reposiciones').select('*').order('fecha', { ascending: false }),
        supabase.from('facturas').select('*').order('created_at', { ascending: false }),
        supabase.from('seguimientos').select('*').order('created_at', { ascending: false }),
        supabase.from('usuarios').select('*').order('created_at', { ascending: false })
      ]);

      setPedidos(toCamel(dPedidos) || []);
      setTecnicos(toCamel(dTecnicos) || []);
      setProductos(toCamel(dProductos) || []);
      setMovimientos(toCamel(dMovimientos) || []);
      setReposiciones(toCamel(dReposiciones) || []);
      setFacturas(toCamel(dFacturas) || []);
      setSeguimientos(toCamel(dSeguimientos) || []);
      setUsers(toCamel(dUsers) || []);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('Error cargando datos de Supabase', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Generic CRUD helpers for Supabase
  const addRecord = async (table, data, setter) => {
    const dbData = toSnake(data);
    const { data: inserted, error } = await supabase.from(table).insert([dbData]).select().single();
    if (error) { showToast(`Error al crear en ${table}`, 'error'); console.error(error); return null; }
    const mapped = toCamel(inserted);
    setter(prev => [mapped, ...prev]);
    showToast('Registro creado exitosamente');
    return mapped;
  };

  const updateRecord = async (table, id, data, setter) => {
    const dbData = toSnake(data);
    const { data: updated, error } = await supabase.from(table).update(dbData).eq('id', id).select().single();
    if (error) { showToast(`Error al actualizar en ${table}`, 'error'); console.error(error); return null; }
    const mapped = toCamel(updated);
    setter(prev => prev.map(item => item.id === id ? mapped : item));
    showToast('Registro actualizado exitosamente');
    return mapped;
  };

  const deleteRecord = async (table, id, setter) => {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) { showToast(`Error al eliminar en ${table}`, 'error'); console.error(error); return false; }
    setter(prev => prev.filter(item => item.id !== id));
    showToast('Registro eliminado exitosamente');
    return true;
  };

  // Specific Actions
  const addPedido = (data) => addRecord('pedidos', data, setPedidos);
  const updatePedido = (id, data) => updateRecord('pedidos', id, data, setPedidos);
  const deletePedido = (id) => deleteRecord('pedidos', id, setPedidos);

  const addTecnico = (data) => addRecord('tecnicos', data, setTecnicos);
  const updateTecnico = (id, data) => updateRecord('tecnicos', id, data, setTecnicos);
  const deleteTecnico = (id) => deleteRecord('tecnicos', id, setTecnicos);

  const addProducto = (data) => addRecord('productos', data, setProductos);
  const updateProducto = (id, data) => updateRecord('productos', id, data, setProductos);
  const deleteProducto = (id) => deleteRecord('productos', id, setProductos);

  const addMovimiento = (data) => addRecord('movimientos', data, setMovimientos);
  
  const addReposicion = (data) => addRecord('reposiciones', data, setReposiciones);
  const updateReposicion = (id, data) => updateRecord('reposiciones', id, data, setReposiciones);

  const addFactura = (data) => addRecord('facturas', data, setFacturas);
  const updateFactura = (id, data) => updateRecord('facturas', id, data, setFacturas);

  const addSeguimiento = (data) => addRecord('seguimientos', data, setSeguimientos);
  const updateSeguimiento = (id, data) => updateRecord('seguimientos', id, data, setSeguimientos);

  const updateUser = (id, data) => updateRecord('usuarios', id, data, setUsers);
  const deleteUser = (id) => deleteRecord('usuarios', id, setUsers);

  // Analytics & Stats
  const getStats = () => {
    // Pedidos Stats
    const totalPedidos = pedidos.length;
    const pedidosPendientes = pedidos.filter(p => ['solicitud', 'factibilidad', 'validacion', 'consultaDeuda'].includes(p.estado)).length;
    const pedidosAprobados = pedidos.filter(p => p.estado === 'aprobado').length;
    const pedidosRechazados = pedidos.filter(p => p.estado === 'rechazado').length;
    const pedidosProgramados = pedidos.filter(p => p.estado === 'programado').length;
    const pedidosFinalizados = pedidos.filter(p => p.estado === 'finalizado').length;

    // Tecnicos Stats
    const totalTecnicos = tecnicos.length;
    const tecnicosDisponibles = tecnicos.filter(t => t.estado === 'disponible').length;
    const tecnicosOcupados = tecnicos.filter(t => t.estado === 'ocupado').length;

    // Inventario Stats
    const productosStockBajo = productos.filter(p => p.stockDisponible <= p.stockMinimo && p.stockDisponible > 0).length;
    const productosAgotados = productos.filter(p => p.stockDisponible === 0).length;

    // Facturación Stats
    const totalFacturas = facturas.length;
    const facturasPendientes = facturas.filter(f => ['generada', 'enviada', 'pendiente'].includes(f.estado)).length;
    const facturasPagadas = facturas.filter(f => f.estado === 'pagada' || f.estado === 'archivada').length;
    const totalFacturado = facturas.reduce((sum, f) => sum + f.total, 0);
    const totalCobrado = facturas.filter(f => f.estado === 'pagada' || f.estado === 'archivada').reduce((sum, f) => sum + f.total, 0);

    // Postventa Stats
    const seguimientosCompletados = seguimientos.filter(s => s.encuestaCompletada).length;
    const totalSeguimientos = seguimientos.length;
    const seguimientosPendientes = totalSeguimientos - seguimientosCompletados;
    
    let sumSatisfaccion = 0;
    let recomiendan = 0;
    const distSatisfaccion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    seguimientos.filter(s => s.encuestaCompletada).forEach(s => {
      if (s.satisfaccion) {
        sumSatisfaccion += s.satisfaccion;
        distSatisfaccion[s.satisfaccion]++;
      }
      if (s.recomendaria) recomiendan++;
    });
    
    const satisfaccionPromedio = seguimientosCompletados > 0 ? (sumSatisfaccion / seguimientosCompletados).toFixed(1) : 0;

    // Charts Data
    const pedidosPorEstado = [
      { name: 'Pendientes', value: pedidosPendientes, fill: '#3b82f6' },
      { name: 'Aprobados', value: pedidosAprobados, fill: '#06b6d4' },
      { name: 'Programados', value: pedidosProgramados, fill: '#a855f7' },
      { name: 'Finalizados', value: pedidosFinalizados, fill: '#22c55e' },
      { name: 'Rechazados', value: pedidosRechazados, fill: '#ef4444' },
    ].filter(d => d.value > 0);

    const cargaTecnicos = tecnicos.map(t => ({
      name: t.nombre,
      carga: t.cargaTrabajo,
      disponible: t.maxCarga - t.cargaTrabajo
    }));

    const inventarioPorCategoriaMap = productos.reduce((acc, p) => {
      if (!acc[p.categoria]) acc[p.categoria] = { name: p.categoria, disponible: 0, reservado: 0 };
      acc[p.categoria].disponible += p.stockDisponible;
      acc[p.categoria].reservado += p.stockReservado;
      return acc;
    }, {});
    const inventarioPorCategoria = Object.values(inventarioPorCategoriaMap);

    const facturacionMensual = [
      { name: 'Mes Actual', total: totalFacturado, cobrado: totalCobrado }
    ];

    const distribucionSatisfaccion = Object.entries(distSatisfaccion).map(([key, val]) => ({
      name: `${key} ⭐`,
      value: val
    }));

    return {
      totalPedidos, pedidosPendientes, pedidosAprobados, pedidosRechazados, pedidosProgramados, pedidosFinalizados,
      totalTecnicos, tecnicosDisponibles, tecnicosOcupados,
      productosStockBajo, productosAgotados,
      totalFacturas, facturasPendientes, facturasPagadas, totalFacturado, totalCobrado,
      seguimientosCompletados, totalSeguimientos, seguimientosPendientes,
      satisfaccionPromedio, clientesRecomendarian: recomiendan,
      pedidosPorEstado, cargaTecnicos, inventarioPorCategoria, facturacionMensual, distribucionSatisfaccion
    };
  };

  return (
    <DataContext.Provider value={{
      pedidos, tecnicos, productos, movimientos, reposiciones, facturas, seguimientos, users,
      loading, toasts, showToast, removeToast, refreshData: loadData,
      addPedido, updatePedido, deletePedido,
      addTecnico, updateTecnico, deleteTecnico,
      addProducto, updateProducto, deleteProducto,
      addMovimiento,
      addReposicion, updateReposicion,
      addFactura, updateFactura,
      addSeguimiento, updateSeguimiento,
      updateUser, deleteUser,
      getStats
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
