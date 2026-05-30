/*
  # Create leads table for EcoStep Solar Estimator

  1. New Tables
    - `leads`
      - `id` (uuid, primary key)
      - `full_name` (text)
      - `email` (text)
      - `phone` (text)
      - `country_code` (text)
      - `monthly_bill` (numeric)
      - `selected_appliances` (jsonb - stores selected appliance data)
      - `estimated_kw` (numeric - solar system size in kW)
      - `estimated_battery` (numeric - battery capacity in kWh)
      - `daily_consumption` (numeric - daily energy consumption in kWh)
      - `backup_runtime` (numeric - backup hours available)
      - `monthly_savings` (numeric - estimated monthly savings)
      - `roi_years` (numeric - estimated ROI timeline in years)
      - `grid_independence` (numeric - percentage of grid independence)
      - `notes` (text - special requirements)
      - `status` (text - lead status)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `leads` table
    - Add policy allowing inserts from anonymous users (for form submission)
    - Add policy allowing reads only for authenticated users

  3. Important Notes
    - This table stores all lead information from the EcoStep calculator
    - Appliance data is stored as JSONB for flexibility
    - All calculated estimates are stored for reporting
*/

CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  country_code text DEFAULT '+1',
  monthly_bill numeric NOT NULL,
  selected_appliances jsonb DEFAULT '[]'::jsonb,
  estimated_kw numeric DEFAULT 0,
  estimated_battery numeric DEFAULT 0,
  daily_consumption numeric DEFAULT 0,
  backup_runtime numeric DEFAULT 0,
  monthly_savings numeric DEFAULT 0,
  roi_years numeric DEFAULT 0,
  grid_independence numeric DEFAULT 0,
  notes text DEFAULT '',
  status text DEFAULT 'new',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous inserts (for form submission from public website)
CREATE POLICY "Allow anonymous form submissions"
  ON leads FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow authenticated users to read leads
CREATE POLICY "Authenticated users can view leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads (email);

-- Index for created_at sorting
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
