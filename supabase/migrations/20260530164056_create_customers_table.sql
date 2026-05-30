/*
  # Create customers table

  1. New Tables
    - `customers`
      - `id` (uuid, primary key) - Unique identifier for each customer
      - `full_name` (text) - Customer's full name
      - `email` (text) - Customer's email address
      - `phone_number` (text) - Customer's phone number
      - `location` (text) - Customer's location/address
      - `created_at` (timestamptz) - Timestamp when the record was created

  2. Security
    - Enable RLS on `customers` table
    - Add policy for public inserts (allows anonymous users to submit quotes from the frontend estimator)

  3. Important Notes
    - This table stores customer lead information from the energy estimator
    - RLS is enabled to protectively restrictive policies
    - Only INSERT is allowed for public (anonymous) users to submit quotes
    - No SELECT, UPDATE, or DELETE access for anonymous users
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone_number text,
  location text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Create policy for public inserts (anonymous users can submit quotes)
CREATE POLICY "Public can insert customer quotes"
  ON customers
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Note: No SELECT, UPDATE, or DELETE policies for anon users
-- This ensures anonymous users can only submit data, not read or modify it