import React from 'react';
import { Download, ExternalLink, Database, CheckCircle } from 'lucide-react';

const SQLDownloader: React.FC = () => {
  const downloadSQL = () => {
    const sqlContent = `-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== ORGANIZATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT 'Default Organization',
  email TEXT UNIQUE NOT NULL DEFAULT 'admin@example.com',
  phone TEXT DEFAULT '+971501234567',
  address TEXT DEFAULT 'Dubai, UAE',
  fleet_mode TEXT DEFAULT 'rental' CHECK (fleet_mode IN ('rental', 'taxi')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ar', 'hi', 'ur')),
  subscription_plan TEXT DEFAULT 'basic' CHECK (subscription_plan IN ('basic', 'pro', 'enterprise')),
  max_drivers INTEGER DEFAULT 50,
  max_vehicles INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID DEFAULT uuid_generate_v4()
);

-- ==================== DRIVERS TABLE ====================
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '',
  trips INTEGER DEFAULT 0,
  earnings DECIMAL(10,2) DEFAULT 0.00,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'offline', 'suspended')),
  performance_score DECIMAL(5,2) DEFAULT 85.00 CHECK (performance_score >= 0 AND performance_score <= 100),
  join_date TIMESTAMPTZ DEFAULT NOW(),
  location_lat DECIMAL(10,8) DEFAULT 25.2048,
  location_lng DECIMAL(11,8) DEFAULT 55.2708,
  vehicle_id TEXT,
  contract_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID REFERENCES organizations(id) DEFAULT (SELECT id FROM organizations LIMIT 1)
);

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
  current_driver_id UUID REFERENCES drivers(id),
  last_maintenance DATE,
  next_maintenance DATE,
  mileage INTEGER DEFAULT 0,
  fuel_type TEXT DEFAULT 'petrol' CHECK (fuel_type IN ('petrol', 'diesel', 'hybrid', 'electric')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID REFERENCES organizations(id) DEFAULT (SELECT id FROM organizations LIMIT 1)
);

-- ==================== FINES TABLE ====================
CREATE SEQUENCE IF NOT EXISTS fines_id_seq START 1;

CREATE TABLE IF NOT EXISTS fines (
  id TEXT PRIMARY KEY DEFAULT 'FN-' || LPAD(nextval('fines_id_seq')::TEXT, 6, '0'),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_plate TEXT NOT NULL,
  violation TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'deducted')),
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  organization_id UUID REFERENCES organizations(id) DEFAULT (SELECT id FROM organizations LIMIT 1)
);

-- ==================== CONTRACTS TABLE ====================
CREATE SEQUENCE IF NOT EXISTS contracts_id_seq START 1;

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY DEFAULT 'CNT-' || LPAD(nextval('contracts_id_seq')::TEXT, 6, '0'),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
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
  organization_id UUID REFERENCES organizations(id) DEFAULT (SELECT id FROM organizations LIMIT 1)
);

-- ==================== INCIDENTS TABLE ====================
CREATE SEQUENCE IF NOT EXISTS incidents_id_seq START 1;

CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY DEFAULT 'INC-' || LPAD(nextval('incidents_id_seq')::TEXT, 6, '0'),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id TEXT REFERENCES vehicles(id),
  type TEXT NOT NULL CHECK (type IN ('crash', 'breakdown', 'theft', 'damage', 'other')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
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
  organization_id UUID REFERENCES organizations(id) DEFAULT (SELECT id FROM organizations LIMIT 1)
);

-- ==================== GPS LOCATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS gps_locations (
  id BIGSERIAL PRIMARY KEY,
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id TEXT REFERENCES vehicles(id),
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  speed DECIMAL(5,2) DEFAULT 0,
  heading INTEGER DEFAULT 0 CHECK (heading >= 0 AND heading <= 360),
  accuracy DECIMAL(8,2) DEFAULT 0,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  organization_id UUID REFERENCES organizations(id) DEFAULT (SELECT id FROM organizations LIMIT 1)
);

-- ==================== ENABLE ROW LEVEL SECURITY ====================
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE gps_locations ENABLE ROW LEVEL SECURITY;

-- ==================== RLS POLICIES FOR ANON ACCESS ====================

-- Organizations policies (allow anon access for development)
CREATE POLICY "Allow anon access to organizations"
  ON organizations
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to organizations"
  ON organizations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Drivers policies (allow anon access for development)
CREATE POLICY "Allow anon access to drivers"
  ON drivers
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to drivers"
  ON drivers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Vehicles policies
CREATE POLICY "Allow anon access to vehicles"
  ON vehicles
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to vehicles"
  ON vehicles
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Fines policies
CREATE POLICY "Allow anon access to fines"
  ON fines
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to fines"
  ON fines
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Contracts policies
CREATE POLICY "Allow anon access to contracts"
  ON contracts
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to contracts"
  ON contracts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Incidents policies
CREATE POLICY "Allow anon access to incidents"
  ON incidents
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to incidents"
  ON incidents
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- GPS locations policies
CREATE POLICY "Allow anon access to gps_locations"
  ON gps_locations
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated access to gps_locations"
  ON gps_locations
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

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

-- GPS location indexes
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

-- Insert default organization
INSERT INTO organizations (name, email, phone, fleet_mode, language)
VALUES ('NavEdge Fleet Management', 'admin@navedge.com', '+971501234567', 'rental', 'en')
ON CONFLICT (email) DO NOTHING;

-- Insert sample drivers
INSERT INTO drivers (name, email, phone, avatar, trips, earnings, status, performance_score, join_date, location_lat, location_lng, vehicle_id)
VALUES 
  ('Ahmed Al-Rashid', 'ahmed@example.com', '+971501234567', 'AR', 24, 1250.00, 'active', 92.0, '2024-01-15', 25.2048, 55.2708, 'DXB-A-12345'),
  ('Mohammed Hassan', 'mohammed@example.com', '+971559876543', 'MH', 18, 980.00, 'active', 88.0, '2023-11-20', 25.1972, 55.2744, 'DXB-B-67890'),
  ('Omar Khalil', 'omar@example.com', '+971524567890', 'OK', 31, 1680.00, 'active', 95.0, '2024-02-10', 25.2084, 55.2719, 'DXB-C-11111'),
  ('Yusuf Ahmad', 'yusuf@example.com', '+971567890123', 'YA', 15, 820.00, 'offline', 78.0, '2024-03-05', 25.2011, 55.2762, 'DXB-D-22222'),
  ('Khalid Saeed', 'khalid@example.com', '+971543456789', 'KS', 22, 1150.00, 'active', 90.0, '2023-12-01', 25.2103, 55.2681, 'DXB-E-33333')
ON CONFLICT (email) DO NOTHING;

-- Insert sample vehicles
INSERT INTO vehicles (id, make, model, year, color, license_plate, status, mileage, fuel_type)
VALUES 
  ('DXB-A-12345', 'Toyota', 'Camry', 2023, 'White', 'DXB-A-12345', 'rented', 15000, 'petrol'),
  ('DXB-B-67890', 'Honda', 'Accord', 2022, 'Silver', 'DXB-B-67890', 'rented', 22000, 'petrol'),
  ('DXB-C-11111', 'Nissan', 'Altima', 2023, 'Black', 'DXB-C-11111', 'rented', 8000, 'petrol'),
  ('DXB-D-22222', 'Hyundai', 'Elantra', 2022, 'Blue', 'DXB-D-22222', 'rented', 18000, 'petrol'),
  ('DXB-E-33333', 'Kia', 'Optima', 2023, 'Red', 'DXB-E-33333', 'rented', 12000, 'petrol')
ON CONFLICT (license_plate) DO NOTHING;

-- Update drivers with correct UUIDs after vehicles are created
DO $$
DECLARE
    driver_record RECORD;
    vehicle_record RECORD;
BEGIN
    -- Update Ahmed Al-Rashid with DXB-A-12345
    SELECT id INTO vehicle_record FROM vehicles WHERE license_plate = 'DXB-A-12345';
    UPDATE drivers SET vehicle_id = vehicle_record.id WHERE email = 'ahmed@example.com';
    
    -- Update Mohammed Hassan with DXB-B-67890
    SELECT id INTO vehicle_record FROM vehicles WHERE license_plate = 'DXB-B-67890';
    UPDATE drivers SET vehicle_id = vehicle_record.id WHERE email = 'mohammed@example.com';
    
    -- Update Omar Khalil with DXB-C-11111
    SELECT id INTO vehicle_record FROM vehicles WHERE license_plate = 'DXB-C-11111';
    UPDATE drivers SET vehicle_id = vehicle_record.id WHERE email = 'omar@example.com';
    
    -- Update Yusuf Ahmad with DXB-D-22222
    SELECT id INTO vehicle_record FROM vehicles WHERE license_plate = 'DXB-D-22222';
    UPDATE drivers SET vehicle_id = vehicle_record.id WHERE email = 'yusuf@example.com';
    
    -- Update Khalid Saeed with DXB-E-33333
    SELECT id INTO vehicle_record FROM vehicles WHERE license_plate = 'DXB-E-33333';
    UPDATE drivers SET vehicle_id = vehicle_record.id WHERE email = 'khalid@example.com';
END $$;`;

    const blob = new Blob([sqlContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'create_drivers_table.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ SQL file downloaded successfully! Now go to your Supabase dashboard and run this SQL in the SQL Editor.');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">📁 Download NavEdge Database Migration</h1>
            <p className="text-gray-600">Click the button below to download the complete SQL migration file for your NavEdge fleet management database</p>
          </div>
          
          <div className="text-center mb-8">
            <button
              onClick={downloadSQL}
              className="inline-flex items-center space-x-3 px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Download className="w-6 h-6" />
              <span>📥 Download create_drivers_table.sql</span>
            </button>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <div className="flex items-start space-x-3">
              <div className="text-yellow-600 mt-1">⚠️</div>
              <div>
                <h4 className="font-semibold text-yellow-900 mb-2">Important:</h4>
                <p className="text-yellow-800 text-sm">This file contains the complete database schema including drivers, vehicles, fines, contracts, incidents, and GPS tracking tables with sample data.</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Next Steps:</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Download the file</h3>
                  <p className="text-gray-600 text-sm">Click the download button above to save the SQL file to your computer.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Open Supabase Dashboard</h3>
                  <p className="text-gray-600 text-sm mb-2">Go to your Supabase dashboard and navigate to your project:</p>
                  <a 
                    href="https://supabase.com/dashboard/project/evvitqxojvdtyeswdkub" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Supabase Project</span>
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Open SQL Editor</h3>
                  <p className="text-gray-600 text-sm">Click on <strong>"SQL Editor"</strong> in the left sidebar of your Supabase dashboard.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Paste and Run</h3>
                  <p className="text-gray-600 text-sm">Open the downloaded SQL file in a text editor, copy all contents, paste into the SQL Editor, and click <strong>"Run"</strong>.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">5</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Verify</h3>
                  <p className="text-gray-600 text-sm">After running the SQL, go to the "Table Editor" to verify that all tables were created successfully.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 What's Included:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'drivers table with UUID primary key',
                'vehicles table for fleet management',
                'fines table for traffic violations',
                'contracts table for rental agreements',
                'incidents table for safety reports',
                'gps_locations table for real-time tracking',
                'organizations table for multi-tenant support',
                'Row Level Security (RLS) policies for anon access',
                'Performance indexes',
                'Sample data (5 drivers, 5 vehicles, etc.)'
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SQLDownloader;