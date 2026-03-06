-- Equipment Management SaaS Database Schema
-- This creates all tables with RLS policies for multi-tenant isolation

-- Companies table (tenant isolation)
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Departments table
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Equipment table
CREATE TABLE IF NOT EXISTS public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  purchase_date DATE NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  warranty_months INTEGER,
  maintenance_interval_months INTEGER,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  assigned_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'damaged', 'lost')),
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

-- Assignment History table
CREATE TABLE IF NOT EXISTS public.assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  department_id UUID NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  department_name TEXT NOT NULL,
  assigned_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_date TIMESTAMPTZ,
  condition_when_assigned TEXT NOT NULL,
  condition_when_returned TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assignment_history ENABLE ROW LEVEL SECURITY;

-- User profiles table (links auth.users to companies)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for companies (users can only see their own company)
CREATE POLICY "companies_select" ON public.companies FOR SELECT USING (
  id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "companies_insert" ON public.companies FOR INSERT WITH CHECK (true);
CREATE POLICY "companies_update" ON public.companies FOR UPDATE USING (
  id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- RLS Policies for departments
CREATE POLICY "departments_select" ON public.departments FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "departments_insert" ON public.departments FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "departments_update" ON public.departments FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "departments_delete" ON public.departments FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- RLS Policies for employees
CREATE POLICY "employees_select" ON public.employees FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "employees_insert" ON public.employees FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "employees_update" ON public.employees FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "employees_delete" ON public.employees FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- RLS Policies for equipment
CREATE POLICY "equipment_select" ON public.equipment FOR SELECT USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "equipment_insert" ON public.equipment FOR INSERT WITH CHECK (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "equipment_update" ON public.equipment FOR UPDATE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);
CREATE POLICY "equipment_delete" ON public.equipment FOR DELETE USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())
);

-- RLS Policies for assignment_history
CREATE POLICY "assignment_history_select" ON public.assignment_history FOR SELECT USING (
  equipment_id IN (
    SELECT id FROM public.equipment WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);
CREATE POLICY "assignment_history_insert" ON public.assignment_history FOR INSERT WITH CHECK (
  equipment_id IN (
    SELECT id FROM public.equipment WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);
CREATE POLICY "assignment_history_update" ON public.assignment_history FOR UPDATE USING (
  equipment_id IN (
    SELECT id FROM public.equipment WHERE company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_departments_company ON public.departments(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_company ON public.employees(company_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON public.employees(department_id);
CREATE INDEX IF NOT EXISTS idx_equipment_company ON public.equipment(company_id);
CREATE INDEX IF NOT EXISTS idx_equipment_department ON public.equipment(department_id);
CREATE INDEX IF NOT EXISTS idx_equipment_employee ON public.equipment(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_assignment_history_equipment ON public.assignment_history(equipment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_history_employee ON public.assignment_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company_id);
