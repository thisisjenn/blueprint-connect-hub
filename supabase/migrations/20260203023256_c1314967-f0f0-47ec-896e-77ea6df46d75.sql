-- Create user role enum
CREATE TYPE public.app_role AS ENUM ('client', 'contractor');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  address TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_files table
CREATE TABLE public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('document', 'image', 'blueprint', 'contract', 'invoice', 'photo_upload')),
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category TEXT DEFAULT 'general',
  description TEXT,
  is_shared_with_client BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_tasks table (for project milestones/tasks)
CREATE TABLE public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create client_checklist_items table (items we need from clients)
CREATE TABLE public.client_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_messages table
CREATE TABLE public.project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create client_photo_uploads table for organized photo submissions
CREATE TABLE public.client_photo_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('site_progress', 'issue_report', 'reference', 'document_scan')),
  description TEXT,
  location_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_photo_uploads ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to check if user is contractor
CREATE OR REPLACE FUNCTION public.is_contractor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'contractor'
  )
$$;

-- Create function to check if user is client for a project
CREATE OR REPLACE FUNCTION public.is_client_for_project(_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.projects
    WHERE id = _project_id AND client_id = auth.uid()
  )
$$;

-- Create function to check project membership (client or contractor)
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_contractor() OR public.is_client_for_project(_project_id)
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Contractors can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_contractor());

-- RLS Policies for projects
CREATE POLICY "Clients can view own projects" ON public.projects
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Contractors can view all projects" ON public.projects
  FOR SELECT USING (public.is_contractor());

CREATE POLICY "Contractors can create projects" ON public.projects
  FOR INSERT WITH CHECK (public.is_contractor());

CREATE POLICY "Contractors can update projects" ON public.projects
  FOR UPDATE USING (public.is_contractor());

CREATE POLICY "Contractors can delete projects" ON public.projects
  FOR DELETE USING (public.is_contractor());

-- RLS Policies for project_files
CREATE POLICY "Clients can view shared files" ON public.project_files
  FOR SELECT USING (
    is_shared_with_client = true AND public.is_client_for_project(project_id)
  );

CREATE POLICY "Contractors can view all files" ON public.project_files
  FOR SELECT USING (public.is_contractor());

CREATE POLICY "Contractors can manage files" ON public.project_files
  FOR ALL USING (public.is_contractor());

CREATE POLICY "Clients can upload files to their projects" ON public.project_files
  FOR INSERT WITH CHECK (
    public.is_client_for_project(project_id) AND uploaded_by = auth.uid()
  );

-- RLS Policies for project_tasks
CREATE POLICY "Project members can view tasks" ON public.project_tasks
  FOR SELECT USING (public.is_project_member(project_id));

CREATE POLICY "Contractors can manage tasks" ON public.project_tasks
  FOR ALL USING (public.is_contractor());

-- RLS Policies for client_checklist_items
CREATE POLICY "Project members can view checklist" ON public.client_checklist_items
  FOR SELECT USING (public.is_project_member(project_id));

CREATE POLICY "Contractors can manage checklist" ON public.client_checklist_items
  FOR ALL USING (public.is_contractor());

CREATE POLICY "Clients can update checklist completion" ON public.client_checklist_items
  FOR UPDATE USING (public.is_client_for_project(project_id))
  WITH CHECK (public.is_client_for_project(project_id));

-- RLS Policies for project_messages
CREATE POLICY "Project members can view messages" ON public.project_messages
  FOR SELECT USING (public.is_project_member(project_id));

CREATE POLICY "Project members can send messages" ON public.project_messages
  FOR INSERT WITH CHECK (
    public.is_project_member(project_id) AND sender_id = auth.uid()
  );

-- RLS Policies for invoices
CREATE POLICY "Clients can view own invoices" ON public.invoices
  FOR SELECT USING (public.is_client_for_project(project_id));

CREATE POLICY "Contractors can manage invoices" ON public.invoices
  FOR ALL USING (public.is_contractor());

-- RLS Policies for client_photo_uploads
CREATE POLICY "Clients can view own uploads" ON public.client_photo_uploads
  FOR SELECT USING (public.is_client_for_project(project_id));

CREATE POLICY "Clients can upload photos" ON public.client_photo_uploads
  FOR INSERT WITH CHECK (
    public.is_client_for_project(project_id) AND uploaded_by = auth.uid()
  );

CREATE POLICY "Clients can delete own uploads" ON public.client_photo_uploads
  FOR DELETE USING (uploaded_by = auth.uid());

CREATE POLICY "Contractors can view all uploads" ON public.client_photo_uploads
  FOR SELECT USING (public.is_contractor());

CREATE POLICY "Contractors can manage uploads" ON public.client_photo_uploads
  FOR ALL USING (public.is_contractor());

-- Create trigger for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_tasks_updated_at
  BEFORE UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for client uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('client-uploads', 'client-uploads', true);

-- Storage policies for client-uploads bucket
CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'client-uploads' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view their uploaded files" ON storage.objects
  FOR SELECT USING (bucket_id = 'client-uploads');

CREATE POLICY "Users can delete their own files" ON storage.objects
  FOR DELETE USING (bucket_id = 'client-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_messages;