-- Add 'designer' role for Architects/Designers (treated as pros, same dashboard as contractors)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'designer';