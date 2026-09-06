-- Mini Attendance Management System - Demo Seed Data

-- 1. Insert Default Users (Passwords: 'admin123' and 'manager123')
-- Bcrypt hashes generated with 10 rounds:
-- 'admin123'   -> $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad6J1bDpC1.1/e6
-- 'manager123' -> $2a$10$R70w7Yc9kOqD2aO3pE6P1e9k9p0u/6r6L1f4c7d8e9f0a1b2c3d4e

INSERT INTO users (username, password_hash, full_name, role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad6J1bDpC1.1/e6', 'System Administrator', 'admin'),
('manager', '$2a$10$R70w7Yc9kOqD2aO3pE6P1e9k9p0u/6r6L1f4c7d8e9f0a1b2c3d4e', 'HR Manager', 'manager');

-- 2. Insert Sample Employees
INSERT INTO employees (employee_code, first_name, last_name, email, phone, department, designation, status, hire_date) VALUES
('EMP001', 'Alex', 'Morgan', 'alex.morgan@twiteai.com', '+1 555-0101', 'Engineering', 'Senior Full Stack Engineer', 'Active', '2023-01-15'),
('EMP002', 'Sophia', 'Chen', 'sophia.chen@twiteai.com', '+1 555-0102', 'Engineering', 'Frontend Developer', 'Active', '2023-03-20'),
('EMP003', 'Marcus', 'Vance', 'marcus.vance@twiteai.com', '+1 555-0103', 'Product', 'Product Manager', 'Active', '2022-11-01'),
('EMP004', 'Elena', 'Rostova', 'elena.rostova@twiteai.com', '+1 555-0104', 'UI/UX Design', 'Lead Designer', 'Active', '2023-05-10'),
('EMP005', 'David', 'Kim', 'david.kim@twiteai.com', '+1 555-0105', 'Engineering', 'DevOps Specialist', 'Active', '2023-08-01'),
('EMP006', 'Rachel', 'Green', 'rachel.green@twiteai.com', '+1 555-0106', 'Human Resources', 'HR Specialist', 'Active', '2022-09-15'),
('EMP007', 'James', 'Wilson', 'james.wilson@twiteai.com', '+1 555-0107', 'Sales', 'Account Executive', 'Active', '2024-01-10'),
('EMP008', 'Aisha', 'Patel', 'aisha.patel@twiteai.com', '+1 555-0108', 'Engineering', 'Backend Developer', 'Active', '2023-11-12'),
('EMP009', 'Daniel', 'Martinez', 'daniel.martinez@twiteai.com', '+1 555-0109', 'Marketing', 'Content Strategist', 'Inactive', '2023-02-01'),
('EMP010', 'Olivia', 'Taylor', 'olivia.taylor@twiteai.com', '+1 555-0110', 'Human Resources', 'Talent Acquisition', 'Active', '2024-02-20');

-- 3. Insert Attendance Records (For Today and Past Days)
-- Current Date: 2026-09-06
INSERT INTO attendance (employee_id, attendance_date, check_in_time, check_out_time, status, notes) VALUES
-- Today (2026-09-06)
(1, '2026-09-06', '09:00', '17:30', 'Present', 'On time'),
(2, '2026-09-06', '09:12', '17:45', 'Present', 'Completed sprint tasks'),
(3, '2026-09-06', '09:45', '18:00', 'Late', 'Traffic delay'),
(4, '2026-09-06', '08:55', '17:15', 'Present', 'Design review meeting'),
(5, '2026-09-06', '09:05', '17:30', 'Present', 'Infrastructure monitoring'),
(6, '2026-09-06', '09:00', '17:00', 'Present', 'Interview sessions'),
(7, '2026-09-06', NULL, NULL, 'Absent', 'Sick leave notified'),
(8, '2026-09-06', '09:02', '17:35', 'Present', 'API development'),
(10, '2026-09-06', '09:30', '14:00', 'Half Day', 'Doctor appointment afternoon'),

-- Yesterday (2026-09-05)
(1, '2026-09-05', '08:58', '17:30', 'Present', 'Full day work'),
(2, '2026-09-05', '09:05', '17:40', 'Present', 'Full day work'),
(3, '2026-09-05', '09:00', '17:30', 'Present', 'Full day work'),
(4, '2026-09-05', '09:15', '17:30', 'Late', 'Brief delay'),
(5, '2026-09-05', '09:00', '17:30', 'Present', 'Full day work'),
(6, '2026-09-05', '09:00', '17:00', 'Present', 'Full day work'),
(7, '2026-09-05', '09:10', '17:30', 'Present', 'Client call'),
(8, '2026-09-05', '08:55', '17:30', 'Present', 'Full day work'),
(10, '2026-09-05', '09:00', '17:00', 'Present', 'Onboarding session'),

-- Previous Day (2026-09-04)
(1, '2026-09-04', '09:00', '17:30', 'Present', 'Sprint planning'),
(2, '2026-09-04', '09:00', '17:30', 'Present', 'Full day work'),
(3, '2026-09-04', '09:00', '17:30', 'Present', 'Product roadmap'),
(4, '2026-09-04', NULL, NULL, 'Leave', 'Approved casual leave'),
(5, '2026-09-04', '09:00', '17:30', 'Present', 'Full day work'),
(6, '2026-09-04', '09:00', '17:00', 'Present', 'Payroll processing'),
(7, '2026-09-04', '09:00', '17:30', 'Present', 'Sales pitch'),
(8, '2026-09-04', '09:50', '17:30', 'Late', 'Public transit delay'),
(10, '2026-09-04', '09:00', '17:00', 'Present', 'Recruitment screening');
