export type Currency = {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  exchangeRate: number; // Rate to USD (1 USD = X currency units)
  minBill: number;
  maxBill: number;
  step: number;
};

export const currencies: Currency[] = [
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    locale: 'en-US',
    exchangeRate: 1,
    minBill: 50,
    maxBill: 1000,
    step: 10,
  },
  {
    code: 'PHP',
    symbol: '₱',
    name: 'Philippine Peso',
    locale: 'en-PH',
    exchangeRate: 56.5, // Approximate: 1 USD = 56.5 PHP
    minBill: 2000,
    maxBill: 50000,
    step: 500,
  },
  {
    code: 'SAR',
    symbol: '﷼',
    name: 'Saudi Riyal',
    locale: 'ar-SA',
    exchangeRate: 3.75, // 1 USD = 3.75 SAR
    minBill: 100,
    maxBill: 4000,
    step: 50,
  },
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    locale: 'de-DE',
    exchangeRate: 0.92, // Approximate: 1 USD = 0.92 EUR
    minBill: 45,
    maxBill: 900,
    step: 10,
  },
];

export const DEFAULT_CURRENCY = currencies[0];

export function getCurrencyByCode(code: string): Currency {
  return currencies.find((c) => c.code === code) || DEFAULT_CURRENCY;
}

export function formatCurrency(value: number, currencyCode: string): string {
  const currency = getCurrencyByCode(currencyCode);

  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function convertToUSD(value: number, currencyCode: string): number {
  const currency = getCurrencyByCode(currencyCode);
  return value / currency.exchangeRate;
}

export function convertFromUSD(value: number, currencyCode: string): number {
  const currency = getCurrencyByCode(currencyCode);
  return value * currency.exchangeRate;
}
