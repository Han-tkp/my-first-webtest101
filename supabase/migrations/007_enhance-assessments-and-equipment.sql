-- Yonchuw Database Schema Enhancement
-- Migration 007: Enhance assessments table and equipment table for Thai government form compliance
-- Run this in Supabase SQL Editor after 001_initial.sql

-- Add brand, model, purchase_year to equipment table
ALTER TABLE equipment 
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS purchase_year INTEGER;

-- Create assessments table if it doesn't exist (from 001_initial.sql base schema)
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

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Base RLS policies (from 001_initial.sql)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'Anyone can view assessments') THEN
    CREATE POLICY "Anyone can view assessments" ON assessments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'Tech/Admin can create assessments') THEN
    CREATE POLICY "Tech/Admin can create assessments" ON assessments FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'technician'))
    );
  END IF;
END $$;

-- Enhance assessments table with missing fields from paper form
-- แบบรายงานผลการประเมินมาตรฐานเครื่องพ่นเคมี

ALTER TABLE assessments
-- Equipment details (ข้อมูลเครื่อง)
ADD COLUMN IF NOT EXISTS equipment_type TEXT,          -- ชนิดเครื่อง
ADD COLUMN IF NOT EXISTS equipment_brand TEXT,         -- ยี่ห้อ
ADD COLUMN IF NOT EXISTS equipment_model TEXT,         -- รุ่น
ADD COLUMN IF NOT EXISTS equipment_purchase_year INTEGER, -- ปีที่ซื้อ

-- Flow control (ตัวควบคุมการไหล)
ADD COLUMN IF NOT EXISTS flow_control_type TEXT,       -- ตัวควบคุมการไหล (วาล์ว/หัวพ่น/ขนาด)
ADD COLUMN IF NOT EXISTS flow_control_size TEXT,       -- ขนาดตัวควบคุม

-- Spray distance (ระยะห่าง)
ADD COLUMN IF NOT EXISTS spray_distance TEXT,          -- ระยะห่างจากจุดพ่นถึงปลาย

-- External condition classification (สภาพภายนอก)
ADD COLUMN IF NOT EXISTS exterior_condition_class TEXT, -- เก่า/ปานกลาง/ใหม่
ADD COLUMN IF NOT EXISTS clean_exterior TEXT,          -- สะอาด/ไม่สะอาด
ADD COLUMN IF NOT EXISTS clean_nozzle TEXT,            -- มีเขม่า/ไม่มีเขม่า

-- Engine start quality (การติดเครื่องยนต์)
ADD COLUMN IF NOT EXISTS engine_start_quality TEXT,    -- ติดง่าย/ติดยาก

-- Chemical testing data (ข้อมูลการทดสอบสารเคมี)
ADD COLUMN IF NOT EXISTS chemical_substance TEXT,      -- สารเคมี
ADD COLUMN IF NOT EXISTS chemical_concentration TEXT,  -- ความเข้มข้น%
ADD COLUMN IF NOT EXISTS chemical_volume TEXT,         -- ปริมาณ
ADD COLUMN IF NOT EXISTS chemical_mix_ratio TEXT,      -- อัตราส่วนผสม

-- Test environment (สภาพแวดล้อมการทดสอบ)
ADD COLUMN IF NOT EXISTS season TEXT,                  -- ฤดูกาล
ADD COLUMN IF NOT EXISTS location TEXT,                -- สถานที่

-- Measurement results (ผลการวัด)
ADD COLUMN IF NOT EXISTS vmd_value TEXT,               -- VMD (ไม่เกิน 30 ไมครอน)
ADD COLUMN IF NOT EXISTS span_value TEXT,              -- SPAN (ไม่เกิน 2)

-- Recommendations (ข้อเสนอแนะ)
ADD COLUMN IF NOT EXISTS recommendations TEXT,         -- ข้อเสนอแนะ

-- Assessor info (ข้อมูลผู้ประเมิน)
ADD COLUMN IF NOT EXISTS assessor_name TEXT,           -- ผู้ประเมิน (denormalized for display)
ADD COLUMN IF NOT EXISTS report_date DATE;             -- วันที่ออกรายงาน

-- Add borrows table columns for official document fields
ALTER TABLE borrows
ADD COLUMN IF NOT EXISTS document_reference TEXT,  -- มีหนังสือเลขที่
ADD COLUMN IF NOT EXISTS subject TEXT;             -- เรื่อง

-- Add updated_at column and trigger for assessments
ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS update_assessments_updated_at ON assessments;
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policy for UPDATE on assessments (only SELECT and INSERT existed in 001_initial.sql)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'assessments' AND policyname = 'Tech/Admin can update assessments') THEN
    CREATE POLICY "Tech/Admin can update assessments" ON assessments
      FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'technician'))
      );
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN assessments.equipment_type IS 'ชนิดเครื่อง';
COMMENT ON COLUMN assessments.equipment_brand IS 'ยี่ห้อ';
COMMENT ON COLUMN assessments.equipment_model IS 'รุ่น';
COMMENT ON COLUMN assessments.equipment_purchase_year IS 'ปีที่ซื้อ';
COMMENT ON COLUMN assessments.flow_control_type IS 'ตัวควบคุมการไหล (วาล์ว/หัวพ่น/ขนาด)';
COMMENT ON COLUMN assessments.flow_control_size IS 'ขนาดตัวควบคุม';
COMMENT ON COLUMN assessments.spray_distance IS 'ระยะห่างจากจุดพ่นถึงปลาย';
COMMENT ON COLUMN assessments.exterior_condition_class IS 'สภาพภายนอก (เก่า/ปานกลาง/ใหม่)';
COMMENT ON COLUMN assessments.clean_exterior IS 'ความสะอาดภายนอก (สะอาด/ไม่สะอาด)';
COMMENT ON COLUMN assessments.clean_nozzle IS 'หัวพ่น (มีเขม่า/ไม่มีเขม่า)';
COMMENT ON COLUMN assessments.engine_start_quality IS 'การติดเครื่องยนต์ (ติดง่าย/ติดยาก)';
COMMENT ON COLUMN assessments.chemical_substance IS 'สารเคมี';
COMMENT ON COLUMN assessments.chemical_concentration IS 'ความเข้มข้น%';
COMMENT ON COLUMN assessments.chemical_volume IS 'ปริมาณ';
COMMENT ON COLUMN assessments.chemical_mix_ratio IS 'อัตราส่วนผสม';
COMMENT ON COLUMN assessments.season IS 'ฤดูกาล';
COMMENT ON COLUMN assessments.location IS 'สถานที่';
COMMENT ON COLUMN assessments.vmd_value IS 'VMD (ไม่เกิน 30 ไมครอน)';
COMMENT ON COLUMN assessments.span_value IS 'SPAN (ไม่เกิน 2)';
COMMENT ON COLUMN assessments.recommendations IS 'ข้อเสนอแนะ';
COMMENT ON COLUMN assessments.assessor_name IS 'ผู้ประเมิน';
COMMENT ON COLUMN assessments.report_date IS 'วันที่ออกรายงาน';
