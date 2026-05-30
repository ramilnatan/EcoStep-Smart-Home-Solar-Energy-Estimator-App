/*
  # Add currency column to leads table

  1. Changes
    - Add `currency` column to store the selected currency code (USD, PHP, SAR, EUR)
    - Add default value 'USD' for backwards compatibility

  2. Important Notes
    - This column stores which currency the user selected when submitting the lead
    - All monetary values in the database are stored in USD for consistency
    - The monthly_savings column continues to store USD values
    - Frontend converts to display currency using exchange rates
*/

ALTER TABLE leads
ADD COLUMN IF NOT EXISTS currency text DEFAULT 'USD';

-- Update existing records that have null currency
UPDATE leads
SET currency = 'USD'
WHERE currency IS NULL;
