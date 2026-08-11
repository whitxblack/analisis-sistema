-- ==========================================
-- TecnoInnova S.A. - Supabase PostgreSQL Schema
-- ==========================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Limpiar tablas si ya existen (evita errores al re-ejecutar)
DROP TABLE IF EXISTS seguimientos CASCADE;
DROP TABLE IF EXISTS facturas CASCADE;
DROP TABLE IF EXISTS reposiciones CASCADE;
DROP TABLE IF EXISTS movimientos CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS tecnicos CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 1. Tabla Usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(20) DEFAULT 'usuario',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabla Técnicos
CREATE TABLE tecnicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  telefono VARCHAR(20),
  especialidad VARCHAR(100),
  zona VARCHAR(100),
  estado VARCHAR(20) DEFAULT 'disponible',
  carga_trabajo INTEGER DEFAULT 0,
  max_carga INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabla Pedidos
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id VARCHAR(50),
  cliente_nombre VARCHAR(255) NOT NULL,
  fecha DATE NOT NULL,
  tipo_servicio VARCHAR(100) NOT NULL,
  descripcion TEXT,
  direccion VARCHAR(255) NOT NULL,
  zona VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  estado VARCHAR(50) DEFAULT 'solicitud',
  tecnico_id UUID REFERENCES tecnicos(id) ON DELETE SET NULL,
  tecnico_nombre VARCHAR(255),
  fecha_instalacion DATE,
  horario_instalacion VARCHAR(50),
  importe DECIMAL(10, 2) NOT NULL,
  observaciones TEXT,
  prioridad VARCHAR(20) DEFAULT 'media',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Tabla Productos (Inventario)
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  stock_total INTEGER NOT NULL DEFAULT 0,
  stock_disponible INTEGER NOT NULL DEFAULT 0,
  stock_reservado INTEGER NOT NULL DEFAULT 0,
  stock_minimo INTEGER NOT NULL DEFAULT 0,
  precio_unitario DECIMAL(10, 2) NOT NULL,
  proveedor VARCHAR(255),
  ubicacion VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Tabla Movimientos (Inventario)
CREATE TABLE movimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  producto_nombre VARCHAR(255),
  tipo VARCHAR(20) NOT NULL,
  cantidad INTEGER NOT NULL,
  fecha DATE NOT NULL,
  motivo TEXT,
  responsable VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. Tabla Reposiciones (Inventario)
CREATE TABLE reposiciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
  producto_nombre VARCHAR(255),
  cantidad_solicitada INTEGER NOT NULL,
  fecha DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'pendiente',
  proveedor VARCHAR(255),
  observaciones TEXT,
  solicitado_por VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 7. Tabla Facturas
CREATE TABLE facturas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  cliente_id VARCHAR(50),
  cliente_nombre VARCHAR(255) NOT NULL,
  fecha DATE NOT NULL,
  fecha_vencimiento DATE,
  subtotal DECIMAL(10, 2) NOT NULL,
  impuestos DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(50) DEFAULT 'generada',
  metodo_pago VARCHAR(50),
  numero_factura VARCHAR(50) UNIQUE NOT NULL,
  enviada BOOLEAN DEFAULT false,
  fecha_envio DATE,
  archivada BOOLEAN DEFAULT false,
  observaciones TEXT,
  items JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 8. Tabla Seguimientos (Postventa)
CREATE TABLE seguimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE SET NULL,
  cliente_id VARCHAR(50),
  cliente_nombre VARCHAR(255) NOT NULL,
  tipo_servicio VARCHAR(100),
  fecha_instalacion DATE,
  fecha_contacto_programado DATE,
  fecha_contacto_realizado DATE,
  estado VARCHAR(50) DEFAULT 'pendiente',
  contacto_realizado BOOLEAN DEFAULT false,
  satisfaccion INTEGER,
  encuesta_completada BOOLEAN DEFAULT false,
  tipo_resultado VARCHAR(50),
  comentarios TEXT,
  sugerencias TEXT,
  reclamos TEXT,
  calificacion_tecnico INTEGER,
  calificacion_servicio INTEGER,
  recomendaria BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- ==========================================
-- Desactivar RLS (Row-Level Security)
-- ==========================================
-- Esto evita errores de permisos al crear registros desde la web sin configurar políticas de Supabase Auth complejas.
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos DISABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos DISABLE ROW LEVEL SECURITY;
ALTER TABLE productos DISABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos DISABLE ROW LEVEL SECURITY;
ALTER TABLE reposiciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE facturas DISABLE ROW LEVEL SECURITY;
ALTER TABLE seguimientos DISABLE ROW LEVEL SECURITY;

-- ==========================================
-- Insertar Datos de Demostración
-- ==========================================

-- Admin User (Password: Admin123! hasheado)
INSERT INTO usuarios (nombre, apellido, email, password, rol) 
VALUES ('Administrador', 'Sistema', 'admin@tecnoinnova.com', 'a6df053eaab8a7cb0f455c1b6946ceb1dcd53e9a4f475aeb9fa41e4162ceb7fb', 'admin');

-- Técnicos
INSERT INTO tecnicos (nombre, apellido, email, telefono, especialidad, zona, estado, carga_trabajo, max_carga) VALUES
('Juan', 'Pérez', 'jperez@tecnoinnova.com', '+58 71234567', 'Instalación de Cámaras (CCTV)', 'Zona Norte', 'disponible', 2, 5),
('María', 'Gómez', 'mgomez@tecnoinnova.com', '+58 79876543', 'Sistemas Biométricos', 'Zona Sur', 'ocupado', 4, 4),
('Carlos', 'López', 'clopez@tecnoinnova.com', '+58 71112233', 'Redes y Estructuras', 'Centro', 'disponible', 1, 5),
('Ana', 'Torres', 'atorres@tecnoinnova.com', '+58 75556677', 'Mantenimiento General', 'Zona Este', 'disponible', 0, 4);

-- Productos
INSERT INTO productos (nombre, codigo, categoria, stock_total, stock_disponible, stock_reservado, stock_minimo, precio_unitario, proveedor, ubicacion) VALUES
('Cámara Domo PTZ 1080p', 'CAM-D01', 'Cámaras', 50, 45, 5, 10, 1500.00, 'SecurityGlobal', 'Almacén A - Estante 1'),
('Cámara Bala Infrarroja 4K', 'CAM-B02', 'Cámaras', 30, 25, 5, 15, 2200.00, 'SecurityGlobal', 'Almacén A - Estante 2'),
('DVR 8 Canales HD', 'DVR-008', 'Equipos', 20, 15, 5, 5, 1800.00, 'TechVision', 'Almacén B - Rack 1'),
('NVR 16 Canales 4K', 'NVR-016', 'Equipos', 10, 2, 8, 3, 3500.00, 'TechVision', 'Almacén B - Rack 2'),
('Cable UTP Cat6 (Rollo 300m)', 'CAB-U6', 'Materiales', 100, 80, 20, 20, 850.00, 'CablesAndMore', 'Almacén C'),
('Disco Duro 2TB Surveillance', 'HDD-2TB', 'Almacenamiento', 40, 35, 5, 10, 650.00, 'DataStorageInc', 'Vitrina 1'),
('Fuente de Poder 12V 10A', 'FTE-12V', 'Materiales', 60, 50, 10, 15, 120.00, 'PowerVolt', 'Almacén C'),
('Conector Balun Video HD (Par)', 'CON-BAL', 'Materiales', 200, 180, 20, 50, 35.00, 'SecurityGlobal', 'Almacén C'),
('Lector Biométrico ZKTeco', 'BIO-ZK1', 'Control de Acceso', 15, 0, 15, 5, 1200.00, 'ZKCorp', 'Vitrina 2'),
('Cerradura Electromagnética 600lb', 'CER-600', 'Control de Acceso', 25, 20, 5, 10, 450.00, 'SecureDoors', 'Almacén A - Estante 4');

-- Pedidos (Con UUIDs corregidos a formato hexadecimal válido)
INSERT INTO pedidos (id, cliente_nombre, fecha, tipo_servicio, descripcion, direccion, zona, telefono, email, estado, tecnico_nombre, fecha_instalacion, horario_instalacion, importe, observaciones, prioridad) VALUES
('b3a5b6f0-0d3a-4a8b-b8a9-456b9c9f4d1e', 'Empresa Alpha S.R.L.', '2023-10-25', 'Instalación de Cámaras (CCTV)', 'Instalación de 8 cámaras en oficinas', 'Av. Principal 123', 'Centro', '+58 71234567', 'contacto@alpha.com', 'finalizado', 'Juan Pérez', '2023-11-02', '09:00 - 13:00', 8500.00, 'Cliente muy exigente con estética', 'alta'),
('c4b6c7a1-1e4b-5b9c-c9b0-567c0d0a5e2f', 'Condominio El Bosque', '2023-11-05', 'Control de Acceso Biométrico', 'Lector para puerta principal', 'Calle Los Pinos 456', 'Zona Sur', '+58 79876543', 'admin@elbosque.com', 'programado', 'María Gómez', '2023-11-15', '14:00 - 18:00', 3200.00, 'Llevar taladro percutor pesado', 'media'),
('d5c7d8a2-2f5c-6c0d-d0c1-678d1e1a6f3b', 'Tienda La Esquina', '2023-11-10', 'Alarma contra robos', 'Sistema de alarma con sensores', 'Av. Comercial 789', 'Zona Este', '+58 71112233', 'gerencia@laesquina.com', 'aprobado', NULL, NULL, NULL, 4500.00, 'Requiere instalación urgente', 'alta'),
('e6d8e9a3-3a6d-7d1e-e1d2-789e2f2a7a4b', 'Colegio San Marcos', '2023-11-12', 'Mantenimiento Preventivo', 'Revisión de cámaras existentes', 'Calle Escolar 321', 'Zona Norte', '+58 75556677', 'direccion@sanmarcos.edu', 'consultaDeuda', NULL, NULL, NULL, 1200.00, 'Tienen factura pendiente', 'baja');

-- Facturas
INSERT INTO facturas (pedido_id, cliente_nombre, fecha, fecha_vencimiento, subtotal, impuestos, total, estado, numero_factura, enviada, archivada) VALUES
('b3a5b6f0-0d3a-4a8b-b8a9-456b9c9f4d1e', 'Empresa Alpha S.R.L.', '2023-11-03', '2023-12-03', 8500.00, 1105.00, 9605.00, 'pagada', 'FV-2023-0001', true, true);

-- Seguimientos
INSERT INTO seguimientos (pedido_id, cliente_nombre, tipo_servicio, fecha_instalacion, fecha_contacto_programado, estado, contacto_realizado, satisfaccion, encuesta_completada, calificacion_tecnico, calificacion_servicio, recomendaria) VALUES
('b3a5b6f0-0d3a-4a8b-b8a9-456b9c9f4d1e', 'Empresa Alpha S.R.L.', 'Instalación de Cámaras (CCTV)', '2023-11-02', '2023-11-09', 'completado', true, 5, true, 5, 4, true);
