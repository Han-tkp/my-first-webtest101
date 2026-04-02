-- Yonchuw Complete Database Schema for Supabase
-- Run this ONCE in Supabase SQL Editor to set up all tables
-- This combines 001_initial.sql + 007_enhance-assessments-and-equipment.sql

-- ============== UPDATED_AT TRIGGER FUNCTION (must exist before triggers) ==============
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============== PROFILES TABLE ==============
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'approver', 'technician', 'user')),
  status TEXT DEFAULT 'pending_approval' CHECK (status IN ('pending_approval', 'active', 'suspended')),
  agency TEXT,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============== EQUIPMENT TABLE ==============
CREATE TABLE IF NOT EXISTS equipment (
  id SERIAL PRIMARY KEY,
  serial TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  department TEXT,
  acquisition_date DATE,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'borrowed', 'under_maintenance', 'pending_repair_approval', 'reserved')),
  notes TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  brand TEXT,
  model TEXT,
  purchase_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============== BORROWS TABLE ==============
CREATE TABLE IF NOT EXISTS borrows (
  id SERIAL PRIMARY KEY,
  equipment_ids JSONB NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_name TEXT,
  borrow_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  actual_return_date DATE,
  purpose TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  notes TEXT,
  document_reference TEXT,
  subject TEXT,
  status TEXT DEFAULT 'pending_borrow_approval' CHECK (status IN (
    'pending_borrow_approval',
    'pending_delivery',
    'borrowed',
    'rejected',
    'cancelled',
    'returned_early',
    'returned_late',
    'returned',
    'returned_damaged'
  )),
  pre_delivery_checklist JSONB,
  post_return_checklist JSONB,
  late_return_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============== REPAIRS TABLE ==============
CREATE TABLE IF NOT EXISTS repairs (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
  equipment_name TEXT,
  damage_description TEXT NOT NULL,
  status TEXT DEFAULT 'pending_repair_approval' CHECK (status IN (
    'pending_repair_approval',
    'repair_approved',
    'repair_rejected',
    'completed'
  )),
  technician_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  repair_details TEXT,
  repair_date DATE,
  repair_by TEXT,
  cost DECIMAL(10,2),
  parts_used TEXT,
  request_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============== ASSESSMENTS TABLE (ENHANCED) ==============
CREATE TABLE IF NOT EXISTS assessments (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
  assessor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assessment_date DATE DEFAULT CURRENT_DATE,
  
  -- Original fields
  exterior_condition TEXT,
  engine_start TEXT,
  clean_pipe BOOLEAN DEFAULT FALSE,
  clean_chem_line BOOLEAN DEFAULT FALSE,
  clean_gas_tank BOOLEAN DEFAULT FALSE,
  clean_chem_tank BOOLEAN DEFAULT FALSE,
  chem_name TEXT,
  chem_concentration TEXT,
  chem_mix_ratio TEXT,
  result_temp TEXT,
  result_flow_rate TEXT,
  notes TEXT,
  
  -- Enhanced fields from 007 migration
  equipment_type TEXT,
  equipment_brand TEXT,
  equipment_model TEXT,
  equipment_purchase_year INTEGER,
  flow_control_type TEXT,
  flow_control_size TEXT,
  spray_distance TEXT,
  exterior_condition_class TEXT,
  clean_exterior TEXT,
  clean_nozzle TEXT,
  engine_start_quality TEXT,
  chemical_substance TEXT,
  chemical_concentration TEXT,
  chemical_volume TEXT,
  chemical_mix_ratio TEXT,
  season TEXT,
  location TEXT,
  vmd_value TEXT,
  span_value TEXT,
  recommendations TEXT,
  assessor_name TEXT,
  report_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============== NOTIFICATIONS TABLE ==============
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  target_roles TEXT[],
  target_user_ids UUID[],
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============== SAFELY ADD COLUMNS TO EXISTING TABLES ==============
-- These are no-ops if the table was just created above, but needed if tables already existed

-- Equipment: add brand/model/purchase_year
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS brand TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS purchase_year INTEGER;

-- Borrows: add document_reference/subject
ALTER TABLE borrows ADD COLUMN IF NOT EXISTS document_reference TEXT;
ALTER TABLE borrows ADD COLUMN IF NOT EXISTS subject TEXT;

-- Assessments: add all enhanced columns
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS equipment_type TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS equipment_brand TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS equipment_model TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS equipment_purchase_year INTEGER;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS flow_control_type TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS flow_control_size TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS spray_distance TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS exterior_condition_class TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS clean_exterior TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS clean_nozzle TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS engine_start_quality TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS chemical_substance TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS chemical_concentration TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS chemical_volume TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS chemical_mix_ratio TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS season TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS vmd_value TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS span_value TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS recommendations TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS assessor_name TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS report_date DATE;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Notifications: add columns that may be missing
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_user_ids UUID[];
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS target_roles TEXT[];
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS read_by UUID[] DEFAULT '{}';

-- ============== ENABLE ROW LEVEL SECURITY ==============
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============== RLS POLICIES FOR PROFILES ==============
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Approver can view all profiles" ON profiles;
CREATE POLICY "Approver can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'approver')
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin can update any profile" ON profiles;
CREATE POLICY "Admin can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Allow insert during registration" ON profiles;
CREATE POLICY "Allow insert during registration" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============== RLS POLICIES FOR EQUIPMENT ==============
DROP POLICY IF EXISTS "Anyone can view equipment" ON equipment;
CREATE POLICY "Anyone can view equipment" ON equipment
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can insert equipment" ON equipment;
CREATE POLICY "Admin can insert equipment" ON equipment
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admin can update equipment" ON equipment;
CREATE POLICY "Admin can update equipment" ON equipment
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admin can delete equipment" ON equipment;
CREATE POLICY "Admin can delete equipment" ON equipment
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============== RLS POLICIES FOR BORROWS ==============
DROP POLICY IF EXISTS "Users can view their own borrows" ON borrows;
CREATE POLICY "Users can view their own borrows" ON borrows
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin/Approver/Tech can view all borrows" ON borrows;
CREATE POLICY "Admin/Approver/Tech can view all borrows" ON borrows
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'approver', 'technician'))
  );

DROP POLICY IF EXISTS "Users can create borrows" ON borrows;
CREATE POLICY "Users can create borrows" ON borrows
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admin/Approver/Tech can update borrows" ON borrows;
CREATE POLICY "Admin/Approver/Tech can update borrows" ON borrows
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'approver', 'technician'))
  );

-- ============== RLS POLICIES FOR REPAIRS ==============
DROP POLICY IF EXISTS "Anyone can view repairs" ON repairs;
CREATE POLICY "Anyone can view repairs" ON repairs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tech/Admin can manage repairs" ON repairs;
CREATE POLICY "Tech/Admin can manage repairs" ON repairs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'technician', 'approver'))
  );

-- ============== RLS POLICIES FOR ASSESSMENTS ==============
DROP POLICY IF EXISTS "Anyone can view assessments" ON assessments;
CREATE POLICY "Anyone can view assessments" ON assessments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tech/Admin can create assessments" ON assessments;
CREATE POLICY "Tech/Admin can create assessments" ON assessments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'technician'))
  );

DROP POLICY IF EXISTS "Tech/Admin can update assessments" ON assessments;
CREATE POLICY "Tech/Admin can update assessments" ON assessments
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'technician'))
  );

-- ============== RLS POLICIES FOR NOTIFICATIONS ==============
DROP POLICY IF EXISTS "Users can view notifications for them" ON notifications;
CREATE POLICY "Users can view notifications for them" ON notifications
  FOR SELECT USING (
    auth.uid() = ANY(target_user_ids) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = ANY(target_roles)
    )
  );

-- ============== UPDATED_AT TRIGGERS ==============
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_equipment_updated_at ON equipment;
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_borrows_updated_at ON borrows;
CREATE TRIGGER update_borrows_updated_at BEFORE UPDATE ON borrows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_repairs_updated_at ON repairs;
CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON repairs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_assessments_updated_at ON assessments;
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============== INITIAL EQUIPMENT DATA ==============
-- Only insert if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM equipment LIMIT 1) THEN
    INSERT INTO equipment (serial, name, type, department, acquisition_date, status, price) VALUES
    ('0334 0418 0044', 'HUDSON X-PERT SPRAYER', 'เครื่องพ่นเคมีอัดลม', 'นคม.2', '2008-01-25', 'available', 2500),
    ('0334 0418 0045', 'HUDSON X-PERT SPRAYER', 'เครื่องพ่นเคมีอัดลม', 'นคม.2', '2008-01-25', 'available', 2500),
    ('0334 0418 0046', 'HUDSON X-PERT SPRAYER', 'เครื่องพ่นเคมีอัดลม', 'นคม.2', '2008-01-25', 'available', 2500),
    ('0334 0418 0047', 'HUDSON X-PERT SPRAYER', 'เครื่องพ่นเคมีอัดลม', 'นคม.3', '2008-01-25', 'available', 2500),
    ('0334 0418 0048', 'HUDSON X-PERT SPRAYER', 'เครื่องพ่นเคมีอัดลม', 'นคม.3', '2008-01-25', 'available', 2500),
    ('0332 048 0001 (8551)', 'SWING FOG SN 11 P', 'เครื่องพ่นหมอกควัน', 'ศตม.', '1997-06-13', 'available', 45000),
    ('0332 048 0001 (8666)', 'SWING FOG SN 50', 'เครื่องพ่นหมอกควัน', 'ศตม.', '1997-06-13', 'available', 45000),
    ('0332 012.4 0010 (NR070542604)', 'IGEBA PORT 123 ULV', 'เครื่องพ่นฝอยละออง ULV', 'ศดม.', '2006-02-18', 'available', 68000),
    ('51 6640 007 00005 (67)', 'Micron CS10', 'เครื่องพ่นฝอยละออง', 'ศตม.', '2024-05-14', 'available', 15000),
    ('0332 00418 00049', 'ULV Leco 1800 E', 'เครื่องพ่นฝอยละอองแบบติดรถยนต์', 'ศดม.', '2009-05-25', 'available', 250000);
  END IF;
END $$;
