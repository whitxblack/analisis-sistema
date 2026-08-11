// ============================================
// TecnoInnova S.A. - Dashboard Page
// ============================================

import { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatCurrency } from '../../utils/helpers';
import {
  ClipboardList, CheckCircle, XCircle, Clock, Wrench, Users,
  Package, AlertTriangle, FileText, DollarSign, HeadphonesIcon, Star,
  TrendingUp, Calendar
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const COLORS = ['#3b82f6', '#06b6d4', '#22c55e', '#f59e0b', '#ef4444', '#a855f7', '#94a3b8', '#16a34a'];

const KPICard = ({ icon: Icon, label, value, subtitle, colorClass }) => (
  <div className="kpi-card">
    <div className={`kpi-icon ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div className="kpi-content">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      {subtitle && <div className="kpi-subtitle">{subtitle}</div>}
    </div>
  </div>
);

const Dashboard = () => {
  const { getStats } = useData();
  const stats = useMemo(() => getStats(), [getStats]);

  return (
    <div className="slide-up">
      {/* KPI Grid */}
      <div className="kpi-grid" style={{ marginBottom: 32 }}>
        <KPICard icon={ClipboardList} label="Total Pedidos" value={stats.totalPedidos} subtitle={`${stats.pedidosPendientes} pendientes`} colorClass="blue" />
        <KPICard icon={CheckCircle} label="Aprobados" value={stats.pedidosAprobados} subtitle="Pedidos aprobados" colorClass="green" />
        <KPICard icon={XCircle} label="Rechazados" value={stats.pedidosRechazados} subtitle="Pedidos rechazados" colorClass="red" />
        <KPICard icon={Calendar} label="Programados" value={stats.pedidosProgramados} subtitle="Instalaciones por realizar" colorClass="purple" />
        <KPICard icon={CheckCircle} label="Finalizados" value={stats.pedidosFinalizados} subtitle="Instalaciones completadas" colorClass="green" />
        <KPICard icon={Wrench} label="Técnicos Disponibles" value={stats.tecnicosDisponibles} subtitle={`de ${stats.totalTecnicos} técnicos`} colorClass="cyan" />
        <KPICard icon={Package} label="Stock Bajo" value={stats.productosStockBajo} subtitle={`${stats.productosAgotados} agotados`} colorClass="yellow" />
        <KPICard icon={FileText} label="Facturas Pendientes" value={stats.facturasPendientes} subtitle={`de ${stats.totalFacturas} facturas`} colorClass="blue" />
        <KPICard icon={DollarSign} label="Total Facturado" value={formatCurrency(stats.totalFacturado)} subtitle={`Cobrado: ${formatCurrency(stats.totalCobrado)}`} colorClass="green" />
        <KPICard icon={Star} label="Satisfacción" value={`${stats.satisfaccionPromedio}/5`} subtitle={`${stats.clientesRecomendarian} recomendarían`} colorClass="yellow" />
        <KPICard icon={HeadphonesIcon} label="Seguimientos Pendientes" value={stats.seguimientosPendientes} subtitle={`de ${stats.totalSeguimientos} total`} colorClass="cyan" />
        <KPICard icon={TrendingUp} label="Tasa de Aprobación" value={stats.totalPedidos > 0 ? Math.round(((stats.pedidosAprobados + stats.pedidosFinalizados + stats.pedidosProgramados) / stats.totalPedidos) * 100) + '%' : '0%'} subtitle="Pedidos exitosos" colorClass="green" />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Pedidos por Estado */}
        <div className="chart-card">
          <h3 className="chart-title">📊 Pedidos por Estado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.pedidosPorEstado}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {stats.pedidosPorEstado.map((entry, index) => (
                  <Cell key={index} fill={entry.fill || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Carga de Técnicos */}
        <div className="chart-card">
          <h3 className="chart-title">👷 Carga de Trabajo — Técnicos</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.cargaTecnicos}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="carga" name="Asignadas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="disponible" name="Disponible" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Inventario por Categoría */}
        <div className="chart-card">
          <h3 className="chart-title">📦 Inventario por Categoría</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.inventarioPorCategoria} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
              <Tooltip />
              <Legend />
              <Bar dataKey="disponible" name="Disponible" fill="#22c55e" radius={[0, 4, 4, 0]} />
              <Bar dataKey="reservado" name="Reservado" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Facturación */}
        <div className="chart-card">
          <h3 className="chart-title">💰 Facturación por Período</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.facturacionMensual}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="total" name="Total Facturado" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cobrado" name="Cobrado" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Satisfacción de Clientes */}
        <div className="chart-card">
          <h3 className="chart-title">⭐ Distribución de Satisfacción</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.distribucionSatisfaccion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name="Clientes" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                {stats.distribucionSatisfaccion.map((entry, index) => (
                  <Cell key={index} fill={index < 2 ? '#ef4444' : index < 3 ? '#f59e0b' : '#22c55e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Resumen General */}
        <div className="chart-card">
          <h3 className="chart-title">📋 Resumen del Sistema</h3>
          <div style={{ padding: '16px 0' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'Pedidos Activos', value: stats.totalPedidos - stats.pedidosRechazados - stats.pedidosFinalizados, total: stats.totalPedidos, color: '#3b82f6' },
                { label: 'Instalaciones Completadas', value: stats.pedidosFinalizados, total: stats.totalPedidos, color: '#22c55e' },
                { label: 'Ocupación de Técnicos', value: stats.tecnicosOcupados, total: stats.totalTecnicos, color: '#f59e0b' },
                { label: 'Facturas Cobradas', value: stats.facturasPagadas, total: stats.totalFacturas, color: '#06b6d4' },
                { label: 'Seguimientos Completados', value: stats.seguimientosCompletados, total: stats.totalSeguimientos, color: '#a855f7' },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2" style={{ fontSize: '0.875rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span className="font-semibold">{item.value} / {item.total}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--neutral-100)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%`,
                      background: item.color,
                      borderRadius: 'var(--radius-full)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
