import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  country_code?: string;
  monthly_bill: number;
  selected_appliances: Appliance[];
  estimated_kw: number;
  estimated_battery: number;
  daily_consumption: number;
  backup_runtime: number;
  monthly_savings: number;
  roi_years: number;
  grid_independence: number;
  notes?: string;
  status: string;
  created_at: string;
};

export type Appliance = {
  id: string;
  name: string;
  icon: string;
  watts: number;
  hoursPerDay: number;
};
