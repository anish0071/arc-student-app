-- Create field_permissions table for admin-controlled field editing
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.field_permissions (
  id SERIAL PRIMARY KEY,
  field_name VARCHAR(100) NOT NULL UNIQUE,
  editable BOOLEAN DEFAULT true,
  category VARCHAR(50) DEFAULT 'general',
  display_name VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default permissions for all fields (all editable by default)
-- Admin can update 'editable' to false to lock specific fields

-- Profile Fields
INSERT INTO public.field_permissions (field_name, editable, category, display_name) VALUES
('NAME', true, 'basic', 'Full Name'),
('REGNO', false, 'basic', 'Registration Number'),  -- Usually locked
('DEPT', false, 'basic', 'Department'),            -- Usually locked
('SECTION', false, 'basic', 'Section'),            -- Usually locked
('YEAR', false, 'basic', 'Year'),                  -- Usually locked
('GENDER', true, 'basic', 'Gender'),
('EMAIL', false, 'contact', 'Email'),              -- Usually locked (login email)
('OFFICIAL_MAIL', true, 'contact', 'Official Email'),
('MOBILE_NO', true, 'contact', 'Mobile Number'),
('ALT_MOBILE_NO', true, 'contact', 'Alternate Mobile'),
('CURRENT_ADDRESS', true, 'contact', 'Current Address'),
('PERMANENT_ADDRESS', true, 'contact', 'Permanent Address'),
('PINCODE', true, 'contact', 'Pincode'),
('STATE', true, 'contact', 'State')
ON CONFLICT (field_name) DO NOTHING;

-- Educational Fields
INSERT INTO public.field_permissions (field_name, editable, category, display_name) VALUES
('10TH_BOARD_MARKS', true, 'education', '10th Board Marks'),
('10TH_BOARD_PCT', true, 'education', '10th Board Percentage'),
('10TH_BOARD_YEAR', true, 'education', '10th Board Year'),
('12TH_BOARD_MARKS', true, 'education', '12th Board Marks'),
('12TH_BOARD_PCT', true, 'education', '12th Board Percentage'),
('12TH_BOARD_YEAR', true, 'education', '12th Board Year'),
('DIPLOMA_YEAR', true, 'education', 'Diploma Year'),
('DIPLOMA_PCT', true, 'education', 'Diploma Percentage')
ON CONFLICT (field_name) DO NOTHING;

-- GPA Fields
INSERT INTO public.field_permissions (field_name, editable, category, display_name) VALUES
('GPA_SEM1', false, 'gpa', 'GPA Semester 1'),      -- Usually admin-controlled
('GPA_SEM2', false, 'gpa', 'GPA Semester 2'),
('GPA_SEM3', false, 'gpa', 'GPA Semester 3'),
('GPA_SEM4', false, 'gpa', 'GPA Semester 4'),
('GPA_SEM5', false, 'gpa', 'GPA Semester 5'),
('GPA_SEM6', false, 'gpa', 'GPA Semester 6'),
('GPA_SEM7', false, 'gpa', 'GPA Semester 7'),
('GPA_SEM8', false, 'gpa', 'GPA Semester 8'),
('CGPA', false, 'gpa', 'CGPA')
ON CONFLICT (field_name) DO NOTHING;

-- Identification Fields
INSERT INTO public.field_permissions (field_name, editable, category, display_name) VALUES
('AADHAR_NO', true, 'identification', 'Aadhar Number'),
('PAN_NO', true, 'identification', 'PAN Number')
ON CONFLICT (field_name) DO NOTHING;

-- Family Fields
INSERT INTO public.field_permissions (field_name, editable, category, display_name) VALUES
('FATHER_NAME', true, 'family', 'Father Name'),
('MOTHER_NAME', true, 'family', 'Mother Name'),
('GUARDIAN_NAME', true, 'family', 'Guardian Name')
ON CONFLICT (field_name) DO NOTHING;

-- Skills & Career Fields
INSERT INTO public.field_permissions (field_name, editable, category, display_name) VALUES
('KNOWN_TECH_STACK', true, 'skills', 'Known Tech Stack'),
('INTERNSHIP_COMPANY', true, 'skills', 'Internship Company'),
('INTERNSHIP_OFFER_LINK', true, 'skills', 'Internship Offer Link'),
('PLACEMENT_HS', true, 'career', 'Placement / Higher Studies'),
('WILLING_TO_RELOCATE', true, 'career', 'Willing to Relocate'),
('COE_NAME', true, 'coe', 'COE Name'),
('COE_INCHARGE_NAME', true, 'coe', 'COE Incharge Name'),
('COE_PROJECTS_DONE', true, 'coe', 'COE Projects Done')
ON CONFLICT (field_name) DO NOTHING;

-- Coding Platform Fields
INSERT INTO public.field_permissions (field_name, editable, category, display_name) VALUES
('LEETCODE_ID', true, 'leetcode', 'LeetCode ID'),
('LC_TOTAL_PROBLEMS', true, 'leetcode', 'LeetCode Total Problems'),
('LC_EASY', true, 'leetcode', 'LeetCode Easy'),
('LC_MEDIUM', true, 'leetcode', 'LeetCode Medium'),
('LC_HARD', true, 'leetcode', 'LeetCode Hard'),
('LC_RATING', true, 'leetcode', 'LeetCode Rating'),
('LC_BADGES', true, 'leetcode', 'LeetCode Badges'),
('LC_MAX_RATING', true, 'leetcode', 'LeetCode Max Rating'),
('SKILLRACK_ID', true, 'skillrack', 'Skillrack ID'),
('SR_PROBLEMS_SOLVED', true, 'skillrack', 'Skillrack Problems Solved'),
('SR_RANK', true, 'skillrack', 'Skillrack Rank'),
('CODECHEF_ID', true, 'codechef', 'CodeChef ID'),
('CC_TOTAL_PROBLEMS', true, 'codechef', 'CodeChef Problems'),
('CC_RATING', true, 'codechef', 'CodeChef Rating'),
('CC_RANK', true, 'codechef', 'CodeChef Rank'),
('CC_BADGES', true, 'codechef', 'CodeChef Badges'),
('GITHUB_ID', true, 'github', 'GitHub Username'),
('LINKEDIN_URL', true, 'linkedin', 'LinkedIn URL'),
('RESUME_LINK', true, 'resume', 'Resume Link')
ON CONFLICT (field_name) DO NOTHING;

-- Enable Row Level Security (optional - remove if not needed)
-- ALTER TABLE public.field_permissions ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read permissions
-- CREATE POLICY "Allow read access to all" ON public.field_permissions FOR SELECT USING (true);

-- Only allow admin to update permissions (you'll need to implement admin role)
-- CREATE POLICY "Admin can update" ON public.field_permissions FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Example: To lock a field (from admin website or SQL):
-- UPDATE public.field_permissions SET editable = false WHERE field_name = 'GPA_SEM1';

-- Example: To unlock a field:
-- UPDATE public.field_permissions SET editable = true WHERE field_name = 'GPA_SEM1';

-- Example: To lock all GPA fields:
-- UPDATE public.field_permissions SET editable = false WHERE category = 'gpa';

-- Example: To lock all basic profile fields:
-- UPDATE public.field_permissions SET editable = false WHERE category = 'basic';
