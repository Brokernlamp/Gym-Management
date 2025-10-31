-- Turso (libSQL/SQLite) schema for GymAdminDashboard
-- Paste this into Turso console or CLI

PRAGMA foreign_keys = ON;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Members
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  photo_url TEXT,
  login_code TEXT NOT NULL UNIQUE,
  plan_id TEXT,
  plan_name TEXT,
  start_date TEXT,
  expiry_date TEXT,
  status TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  last_check_in TEXT,
  emergency_contact TEXT,
  trainer_id TEXT,
  notes TEXT,
  gender TEXT,
  age INTEGER
);
CREATE INDEX IF NOT EXISTS idx_members_email ON members(email);
CREATE INDEX IF NOT EXISTS idx_members_status ON members(status);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT NOT NULL,
  status TEXT NOT NULL,
  due_date TEXT,
  paid_date TEXT,
  plan_name TEXT,
  FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_payments_member ON payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  id TEXT PRIMARY KEY,
  member_id TEXT NOT NULL,
  check_in_time TEXT NOT NULL,
  check_out_time TEXT,
  latitude REAL,
  longitude REAL,
  marked_via TEXT NOT NULL DEFAULT 'manual',
  FOREIGN KEY(member_id) REFERENCES members(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);
CREATE INDEX IF NOT EXISTS idx_attendance_checkin ON attendance(check_in_time);

-- Equipment
CREATE TABLE IF NOT EXISTS equipment (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  purchase_date TEXT,
  warranty_expiry TEXT,
  last_maintenance TEXT,
  next_maintenance TEXT,
  status TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);

-- Plans (optional)
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  duration INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  features TEXT,
  is_active INTEGER NOT NULL DEFAULT 1
);

-- Classes (optional)
CREATE TABLE IF NOT EXISTS classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  trainer_id TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  enrolled INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_classes_trainer ON classes(trainer_id);
CREATE INDEX IF NOT EXISTS idx_classes_time ON classes(start_time);

-- Trainers (optional)
CREATE TABLE IF NOT EXISTS trainers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  photo_url TEXT,
  specializations TEXT,
  certifications TEXT,
  rating REAL
);

-- Seed minimal data (optional)
-- INSERT INTO members (id, name, email, phone, login_code, status, payment_status) VALUES
--   ('m1','John Doe','john@example.com','+10000000000','123456','active','paid');
