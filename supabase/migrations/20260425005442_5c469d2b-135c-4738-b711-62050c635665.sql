-- Roles enum & user_roles table (security best practice)
CREATE TYPE public.app_role AS ENUM ('bendahara', 'viewer');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email), NEW.email);
  -- First user becomes bendahara automatically
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'bendahara') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'bendahara');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles policies
CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- user_roles policies
CREATE POLICY "Roles viewable by authenticated" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Bendahara manages roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'bendahara'));

-- Transactions table
CREATE TYPE public.transaction_type AS ENUM ('pemasukan', 'pengeluaran');

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.transaction_type NOT NULL,
  date DATE NOT NULL,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  notes TEXT,
  proof_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Transactions public read" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Bendahara insert transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'bendahara'));
CREATE POLICY "Bendahara update transactions" ON public.transactions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'bendahara'));
CREATE POLICY "Bendahara delete transactions" ON public.transactions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'bendahara'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER trg_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX idx_transactions_type ON public.transactions(type);

-- Storage bucket for proofs (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('proofs', 'proofs', true);

CREATE POLICY "Proofs public read" ON storage.objects FOR SELECT USING (bucket_id = 'proofs');
CREATE POLICY "Bendahara upload proofs" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'proofs' AND public.has_role(auth.uid(), 'bendahara'));
CREATE POLICY "Bendahara update proofs" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'proofs' AND public.has_role(auth.uid(), 'bendahara'));
CREATE POLICY "Bendahara delete proofs" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'proofs' AND public.has_role(auth.uid(), 'bendahara'));