/*
  # Fleet Management Database Schema

  1. New Tables
    - `drivers` - Store driver information and performance data
    - `fines` - Track traffic violations and penalties
    - `contracts` - Manage rental contracts and agreements
    - `vehicles` - Vehicle information and status
    - `incidents` - Safety incidents and reports
    - `gps_locations` - Real-time GPS tracking data

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Ensure data isolation per organization

  3. Indexes
    - Performance optimization for common queries
    - Spatial indexes for GPS data
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ==================== DRIVERS TABLE ====================
CREATE TABLE IF NOT EXISTS drivers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '',
  trips INTEGER DEFAULT 0,
  earnings DECIMAL(10,2) DEFAULT 0.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'offline', 'suspended')),
  performance_score INTEGER DEFAULT 85 CHECK (performance_score >= 0 AND performance_score <= 100),
  join_date DATE DEFAULT CURRENT_DATE,
  location_lat DECIMAL(10,8) DEFAULT 25.2048,
  location_lng DECIMAL(11,8) DEFAULT 55.2708,
  vehicle_id TEXT,
  contract_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID DEFAULT auth.uid()
);

-- ==================== FINES TABLE ====================
CREATE TABLE IF NOT EXISTS fines (
  id TEXT PRIMARY KEY DEFAULT 'FN-' || LPAD(nextval('fines_id_seq')::TEXT, 6, '0'),
  driver_id BIGINT REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_plate TEXT NOT NULL,
  violation TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'deducted')),
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID DEFAULT auth.uid()
);

-- Create sequence for fines
CREATE SEQUENCE IF NOT EXISTS fines_id_seq START 1;

-- ==================== CONTRACTS TABLE ====================
CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY DEFAULT 'CNT-' || LPAD(nextval('contracts_id_seq')::TEXT, 6, '0'),
  driver_id BIGINT REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL,
  daily_km_limit INTEGER DEFAULT 300,
  monthly_rent DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'terminated')),
  terms TEXT[] DEFAULT ARRAY[
    'Driver must maintain valid UAE driving license',
    'Vehicle must be returned in same condition',
    'Fines will be deducted from deposit',
    'Monthly rent due by 1st of each month'
  ],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID DEFAULT auth.uid()
);

-- Create sequence for contracts
CREATE SEQUENCE IF NOT EXISTS contracts_id_seq START 1;

-- ==================== VEHICLES TABLE ====================
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  color TEXT,
  license_plate TEXT UNIQUE NOT NULL,
  vin TEXT UNIQUE,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance', 'out_of_service')),
  current_driver_id BIGINT REFERENCES drivers(id),
  last_maintenance DATE,
  next_maintenance DATE,
  mileage INTEGER DEFAULT 0,
  fuel_type TEXT DEFAULT 'petrol' CHECK (fuel_type IN ('petrol', 'diesel', 'hybrid', 'electric')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID DEFAULT auth.uid()
);

-- ==================== INCIDENTS TABLE ====================
CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY DEFAULT 'INC-' || LPAD(nextval('incidents_id_seq')::TEXT, 6, '0'),
  driver_id BIGINT REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id TEXT REFERENCES vehicles(id),
  type TEXT NOT NULL CHECK (type IN ('crash', 'breakdown', 'theft', 'damage', 'other')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  coordinates POINT,
  date_time TIMESTAMPTZ NOT NULL,
  reported_by TEXT DEFAULT 'admin' CHECK (reported_by IN ('driver', 'admin', 'automatic')),
  status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'resolved', 'closed')),
  photos TEXT[],
  witnesses TEXT[],
  police_report TEXT,
  insurance_claim TEXT,
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID DEFAULT auth.uid()
);

-- Create sequence for incidents
CREATE SEQUENCE IF NOT EXISTS incidents_id_seq START 1;

-- ==================== GPS LOCATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS gps_locations (
  id BIGSERIAL PRIMARY KEY,
  driver_id BIGINT REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id TEXT REFERENCES vehicles(id),
  location POINT NOT NULL,
  speed DECIMAL(5,2) DEFAULT 0,
  heading INTEGER DEFAULT 0 CHECK (heading >= 0 AND heading <= 360),
  accuracy DECIMAL(8,2) DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  organization_id UUID DEFAULT auth.uid()
);

-- ==================== ORGANIZATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  fleet_mode TEXT DEFAULT 'rental' CHECK (fleet_mode IN ('rental', 'taxi')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar', 'hi', 'ur')),
  subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro', 'enterprise')),
  max_drivers INTEGER DEFAULT 50,
  max_vehicles INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID DEFAULT auth.uid()
);

-- ==================== ENABLE ROW LEVEL SECURITY ====================
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- ==================== RLS POLICIES ====================

-- Drivers policies
CREATE POLICY "Users can manage their organization's drivers"
  ON drivers
  FOR ALL
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

-- Fines policies
CREATE POLICY "Users can manage their organization's fines"
  ON fines
  FOR ALL
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

-- Contracts policies
CREATE POLICY "Users can manage their organization's contracts"
  ON contracts
  FOR ALL
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

-- Vehicles policies
CREATE POLICY "Users can manage their organization's vehicles"
  ON vehicles
  FOR ALL
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

-- Incidents policies
CREATE POLICY "Users can manage their organization's incidents"
  ON incidents
  FOR ALL
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

-- GPS locations policies
CREATE POLICY "Users can manage their organization's GPS data"
  ON gps_locations
  FOR ALL
  TO authenticated
  USING (organization_id = auth.uid())
  WITH CHECK (organization_id = auth.uid());

-- Organizations policies
CREATE POLICY "Users can manage their own organization"
  ON organizations
  FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- ==================== INDEXES FOR PERFORMANCE ====================

-- Driver indexes
CREATE INDEX IF NOT EXISTS idx_drivers_organization ON drivers(organization_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_drivers_email ON drivers(email);

-- Fines indexes
CREATE INDEX IF NOT EXISTS idx_fines_driver ON fines(driver_id);
CREATE INDEX IF NOT EXISTS idx_fines_status ON fines(status);
CREATE INDEX IF NOT EXISTS idx_fines_date ON fines(date);

-- Contracts indexes
CREATE INDEX IF NOT EXISTS idx_contracts_driver ON contracts(driver_id);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_dates ON contracts(start_date, end_date);

-- GPS location indexes (spatial)
CREATE INDEX IF NOT EXISTS idx_gps_location ON gps_locations USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_gps_driver_time ON gps_locations(driver_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_gps_active ON gps_locations(is_active, timestamp);

-- ==================== TRIGGERS FOR UPDATED_AT ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON drivers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== SAMPLE DATA FOR TESTING ====================

-- Insert sample organization (only if none exists)
INSERT INTO organizations (name, email, phone, fleet_mode, language)
SELECT 'NavEdge Fleet Management', 'admin@navedge.com', '+971501234567', 'rental', 'en'
WHERE NOT EXISTS (SELECT 1 FROM organizations LIMIT 1);

-- Insert sample drivers (only if none exist)
INSERT INTO drivers (name, email, phone, avatar, trips, earnings, status, performance_score, join_date, location_lat, location_lng, vehicle_id)
SELECT * FROM (VALUES
  ('Ahmed Al-Rashid', 'ahmed@example.com', '+971501234567', 'AR', 24, 1250.00, 'active', 92, '2024-01-15', 25.2048, 55.2708, 'DXB-A-12345'),
  ('Mohammed Hassan', 'mohammed@example.com', '+971559876543', 'MH', 18, 980.00, 'active', 88, '2023-11-20', 25.1972, 55.2744, 'DXB-B-67890'),
  ('Omar Khalil', 'omar@example.com', '+971524567890', 'OK', 31, 1680.00, 'active', 95, '2024-02-10', 25.2084, 55.2719, 'DXB-C-11111'),
  ('Yusuf Ahmad', 'yusuf@example.com', '+971567890123', 'YA', 15, 820.00, 'offline', 78, '2024-03-05', 25.2011, 55.2762, 'DXB-D-22222'),
  ('Khalid Saeed', 'khalid@example.com', '+971543456789', 'KS', 22, 1150.00, 'active', 90, '2023-12-01', 25.2103, 55.2681, 'DXB-E-33333')
) AS v(name, email, phone, avatar, trips, earnings, status, performance_score, join_date, location_lat, location_lng, vehicle_id)
WHERE NOT EXISTS (SELECT 1 FROM drivers LIMIT 1);

-- Insert sample vehicles
INSERT INTO vehicles (id, make, model, year, color, license_plate, status, mileage, fuel_type)
SELECT * FROM (VALUES
  ('DXB-A-12345', 'Toyota', 'Camry', 2023, 'White', 'DXB-A-12345', 'rented', 15000, 'petrol'),
  ('DXB-B-67890', 'Honda', 'Accord', 2022, 'Silver', 'DXB-B-67890', 'rented', 22000, 'petrol'),
  ('DXB-C-11111', 'Nissan', 'Altima', 2023, 'Black', 'DXB-C-11111', 'rented', 8000, 'petrol'),
  ('DXB-D-22222', 'Hyundai', 'Elantra', 2022, 'Blue', 'DXB-D-22222', 'rented', 18000, 'petrol'),
  ('DXB-E-33333', 'Kia', 'Optima', 2023, 'Red', 'DXB-E-33333', 'rented', 12000, 'petrol')
) AS v(id, make, model, year, color, license_plate, status, mileage, fuel_type)
WHERE NOT EXISTS (SELECT 1 FROM vehicles LIMIT 1);

-- Insert sample fines
INSERT INTO fines (driver_id, vehicle_plate, violation, amount, date, status, location)
SELECT * FROM (VALUES
  (1, 'DXB-A-12345', 'Speeding (80 km/h in 60 zone)', 600.00, '2024-01-20', 'pending', 'Sheikh Zayed Road'),
  (2, 'DXB-B-67890', 'Illegal Parking', 200.00, '2024-01-18', 'deducted', 'Dubai Mall'),
  (3, 'DXB-C-11111', 'Running Red Light', 1000.00, '2024-01-15', 'paid', 'Al Wasl Road'),
  (1, 'DXB-A-12345', 'Mobile Phone Usage', 800.00, '2024-01-22', 'pending', 'Business Bay'),
  (5, 'DXB-E-33333', 'Lane Violation', 400.00, '2024-01-19', 'deducted', 'Emirates Road')
) AS v(driver_id, vehicle_plate, violation, amount, date, status, location)
WHERE NOT EXISTS (SELECT 1 FROM fines LIMIT 1);

-- Insert sample contracts
INSERT INTO contracts (driver_id, vehicle_id, start_date, end_date, deposit_amount, daily_km_limit, monthly_rent, status)
SELECT * FROM (VALUES
  (1, 'DXB-A-12345', '2024-01-15', '2025-08-22', 5000.00, 300, 1200.00, 'active'),
  (2, 'DXB-B-67890', '2023-11-20', '2025-05-15', 6000.00, 350, 1500.00, 'active'),
  (3, 'DXB-C-11111', '2024-02-10', '2025-12-30', 4500.00, 280, 1100.00, 'active'),
  (4, 'DXB-D-22222', '2024-03-05', '2025-07-18', 4000.00, 250, 1000.00, 'active'),
  (5, 'DXB-E-33333', '2023-12-01', '2025-09-10', 5500.00, 320, 1300.00, 'active')
) AS v(driver_id, vehicle_id, start_date, end_date, deposit_amount, daily_km_limit, monthly_rent, status)
WHERE NOT EXISTS (SELECT 1 FROM contracts LIMIT 1);