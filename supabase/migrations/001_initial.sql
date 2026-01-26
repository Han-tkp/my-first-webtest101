-- Yonchuw Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Profiles table (extends auth.users)
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

-- Equipment table
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Borrows table
CREATE TABLE IF NOT EXISTS borrows (
  id SERIAL PRIMARY KEY,
  equipment_ids JSONB NOT NULL, -- Array of equipment IDs
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

-- Repairs table
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

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id SERIAL PRIMARY KEY,
  equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
  assessor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assessment_date DATE DEFAULT CURRENT_DATE,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  message TEXT NOT NULL,
  target_roles TEXT[], -- Array of roles that should see this notification
  target_user_ids UUID[], -- Specific user IDs
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrows ENABLE ROW LEVEL SECURITY;
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Approver can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'approver')
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can update any profile" ON profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Allow insert during registration" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for equipment (everyone can read, admin can modify)
CREATE POLICY "Anyone can view equipment" ON equipment
  FOR SELECT USING (true);

CREATE POLICY "Admin can insert equipment" ON equipment
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can update equipment" ON equipment
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can delete equipment" ON equipment
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS Policies for borrows
CREATE POLICY "Users can view their own borrows" ON borrows
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin/Approver/Tech can view all borrows" ON borrows
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'approver', 'technician'))
  );

CREATE POLICY "Users can create borrows" ON borrows
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin/Approver/Tech can update borrows" ON borrows
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'approver', 'technician'))
  );

-- RLS Policies for repairs
CREATE POLICY "Anyone can view repairs" ON repairs
  FOR SELECT USING (true);

CREATE POLICY "Tech/Admin can manage repairs" ON repairs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'technician', 'approver'))
  );

-- RLS Policies for assessments
CREATE POLICY "Anyone can view assessments" ON assessments
  FOR SELECT USING (true);

CREATE POLICY "Tech/Admin can create assessments" ON assessments
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'technician'))
  );

-- RLS Policies for notifications
CREATE POLICY "Users can view notifications for them" ON notifications
  FOR SELECT USING (
    auth.uid() = ANY(target_user_ids) OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = ANY(target_roles)
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_borrows_updated_at BEFORE UPDATE ON borrows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_repairs_updated_at BEFORE UPDATE ON repairs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial equipment data (same as original)
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
