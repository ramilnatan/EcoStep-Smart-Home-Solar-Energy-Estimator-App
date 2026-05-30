import { Appliance, CalculationResult } from '../types';
import { convertToUSD, convertFromUSD } from '../data/currencies';

// Solar system calculation constants
const SOLAR_PEAK_SUN_HOURS = 5; // Average peak sun hours per day
const SYSTEM_EFFICIENCY = 0.85; // 85% system efficiency (inverter, wiring losses)
const ELECTRICITY_RATE = 0.12; // $/kWh average rate
const SOLAR_SYSTEM_COST_PER_KW = 2500; // $/kW installed cost
const BATTERY_COST_PER_KWH = 500; // $/kWh

export function calculateEnergyResults(
  monthlyBill: number,
  selectedAppliances: Appliance[],
  currencyCode: string = 'USD'
): CalculationResult {
  // Convert bill to USD for consistent calculations
  const monthlyBillUSD = currencyCode === 'USD' ? monthlyBill : convertToUSD(monthlyBill, currencyCode);

  // Calculate daily consumption from appliances
  const dailyConsumptionFromAppliances = selectedAppliances.reduce((total, app) => {
    return total + (app.watts * app.hoursPerDay) / 1000; // Convert to kWh
  }, 0);

  // Estimate from monthly bill (if no appliances selected or as baseline)
  const monthlyKWh = monthlyBillUSD / ELECTRICITY_RATE;
  const dailyFromBill = monthlyKWh / 30;

  // Use the higher of the two for more accurate estimation
  const dailyConsumptionKWh = Math.max(dailyConsumptionFromAppliances, dailyFromBill);

  // Calculate required solar system size
  const requiredProduction = dailyConsumptionKWh / SYSTEM_EFFICIENCY;
  const systemSizeKW = Math.max(2, Math.ceil(requiredProduction / SOLAR_PEAK_SUN_HOURS));

  // Calculate battery capacity for backup
  const batteryCapacityKWh = Math.ceil(dailyConsumptionKWh * 0.5); // 50% daily backup

  // Calculate backup runtime (hours at reduced load)
  const essentialLoadRatio = 0.4; // Assume 40% of load is essential
  const backupRuntimeHours = (batteryCapacityKWh / (dailyConsumptionKWh * essentialLoadRatio / 24));

  // Calculate monthly savings (in USD, then convert back)
  const monthlySavingsUSD = monthlyBillUSD * 0.85; // 85% savings potential with solar

  // Calculate ROI
  const totalSystemCost = (systemSizeKW * SOLAR_SYSTEM_COST_PER_KW) + (batteryCapacityKWh * BATTERY_COST_PER_KWH);
  const yearlySavings = monthlySavingsUSD * 12;
  const roiYears = Math.max(3, Math.round(totalSystemCost / yearlySavings));

  // Calculate grid independence percentage
  const gridIndependencePercent = Math.min(95, Math.round(85 + (systemSizeKW / dailyConsumptionKWh) * 5));

  return {
    systemSizeKW,
    batteryCapacityKWh,
    dailyConsumptionKWh,
    backupRuntimeHours,
    monthlySavings: Math.round(convertFromUSD(monthlySavingsUSD, currencyCode)),
    monthlySavingsUSD: Math.round(monthlySavingsUSD),
    roiYears,
    gridIndependencePercent,
    electricityRateUSD: ELECTRICITY_RATE,
  };
}

export function generateEnergyData(): { hour: number; solar: number; consumption: number; battery: number; grid: number }[] {
  const data = [];
  for (let hour = 0; hour < 24; hour++) {
    // Solar production follows a bell curve peaking at noon
    const solarBase = Math.max(0, Math.sin((hour - 6) * Math.PI / 12) * 100);
    const solar = solarBase + Math.random() * 10;

    // Consumption has morning and evening peaks
    const morningPeak = hour >= 6 && hour <= 9 ? 40 : 0;
    const eveningPeak = hour >= 17 && hour <= 22 ? 60 : 0;
    const baseLoad = 20;
    const consumption = baseLoad + morningPeak + eveningPeak + Math.random() * 15;

    // Battery charges during solar production, discharges at night
    let battery = 50;
    if (solar > consumption) {
      battery = 50 + ((solar - consumption) * 0.3);
    } else {
      battery = 50 - ((consumption - solar) * 0.2);
    }
    battery = Math.max(0, Math.min(100, battery));

    // Grid import/export
    const grid = consumption > solar ? (consumption - solar) * 0.5 : -(solar - consumption) * 0.3;

    data.push({
      hour,
      solar: Math.round(solar * 10) / 10,
      consumption: Math.round(consumption * 10) / 10,
      battery: Math.round(battery * 10) / 10,
      grid: Math.round(grid * 10) / 10,
    });
  }
  return data;
}

export function formatNumber(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}
