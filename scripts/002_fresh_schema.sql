-- EquipTracking Fresh Database Schema
-- Drop existing tables for clean rebuild
DROP TABLE IF EXISTS public.assignment_history CASCADE;
DROP TABLE IF EXISTS public.equipment CASCADE;
DROP TABLE IF EXISTS public.employees CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.subscriptions CASCADE;

-- Profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3b82f6',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_select_own" ON public.categories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "categories_insert_own" ON public.categories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "categories_update_own" ON public.categories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "categories_delete_own" ON public.categories FOR DELETE USING (auth.uid() = user_id);

-- Departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "departments_select_own" ON public.departments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "departments_insert_own" ON public.departments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "departments_update_own" ON public.departments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "departments_delete_own" ON public.departments FOR DELETE USING (auth.uid() = user_id);

-- Employees table
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  position TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees_select_own" ON public.employees FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "employees_insert_own" ON public.employees FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "employees_update_own" ON public.employees FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "employees_delete_own" ON public.employees FOR DELETE USING (auth.uid() = user_id);

-- Equipment table
CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'maintenance', 'damaged', 'lost')),
  purchase_date DATE NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY "equipment_select_own" ON public.equipment FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "equipment_insert_own" ON public.equipment FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "equipment_update_own" ON public.equipment FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "equipment_delete_own" ON public.equipment FOR DELETE USING (auth.uid() = user_id);

-- Assignment history table
CREATE TABLE public.assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  assigned_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  returned_date TIMESTAMPTZ,
  notes TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.assignment_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "history_select_own" ON public.assignment_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "history_insert_own" ON public.assignment_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "history_update_own" ON public.assignment_history FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "history_delete_own" ON public.assignment_history FOR DELETE USING (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_equipment_user ON public.equipment(user_id);
CREATE INDEX idx_equipment_status ON public.equipment(status);
CREATE INDEX idx_employees_user ON public.employees(user_id);
CREATE INDEX idx_departments_user ON public.departments(user_id);
CREATE INDEX idx_categories_user ON public.categories(user_id);
CREATE INDEX idx_history_equipment ON public.assignment_history(equipment_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, company_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(new.raw_user_meta_data ->> 'last_name', NULL),
    COALESCE(new.raw_user_meta_data ->> 'company_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
