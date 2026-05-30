export type Appliance = {
  id: string;
  name: string;
  icon: string;
  watts: number;
  hoursPerDay: number;
  category: string;
};

export type CalculationResult = {
  systemSizeKW: number;
  batteryCapacityKWh: number;
  dailyConsumptionKWh: number;
  backupRuntimeHours: number;
  monthlySavings: number;
  monthlySavingsUSD: number;
  roiYears: number;
  gridIndependencePercent: number;
  electricityRateUSD: number;
};

export type LeadFormData = {
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  currency: string;
  notes: string;
};

export type EnergyData = {
  hour: number;
  solar: number;
  consumption: number;
  battery: number;
  grid: number;
};
