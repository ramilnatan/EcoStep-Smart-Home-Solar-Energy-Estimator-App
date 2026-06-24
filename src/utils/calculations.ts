import { Appliance, CalculationResult } from '../types';
import { convertToUSD, convertFromUSD } from '../data/currencies';

// Solar system calculation constants
const SOLAR_PEAK_SUN_HOURS = 5; // Average peak sun hours per day
const SYSTEM_EFFICIENCY = 0.85; // 85% system efficiency (inverter, wiring losses)
const ELECTRICITY_RATE = 0.12; // $/kWh average rate
const SOLAR_SYSTEM_COST_PER_KW = 2500; // $/kW installed cost
const BATTERY_COST_PER_KWH = 500; // $/kWh
const ESTIMATED_SOLAR_OFFSET_PERCENT = 0.75; // 75% of bill can be offset by solar (typical range 60-85%)

export function calculateEnergyResults(
  monthlyBill: number,
  selectedAppliances: Appliance[],
  currencyCode: string = 'USD'
): CalculationResult {
  // Convert bill to USD for consistent calculations
  const monthlyBillUSD = currencyCode === 'USD' ? monthlyBill : convertToUSD(monthlyBill, currencyCode);

  // Calculate daily consumption from selected appliances ONLY
  const dailyConsumptionKWh = selectedAppliances.reduce((total, app) => {
    return total + (app.watts * (app.quantity ?? 1) * app.hoursPerDay) / 1000; // Convert to kWh
  }, 0);

  // Appliance-based calculations (only when appliances selected)
  let systemSizeKW = 0;
  let batteryCapacityKWh = 0;
  let backupRuntimeHours = 0;
  let gridIndependencePercent = 0;

  if (selectedAppliances.length > 0 && dailyConsumptionKWh > 0) {
    // Calculate required solar system size for appliance load
    const requiredProduction = dailyConsumptionKWh / SYSTEM_EFFICIENCY;
    systemSizeKW = Math.max(2, Math.ceil(requiredProduction / SOLAR_PEAK_SUN_HOURS));

    // Calculate battery capacity for backup (50% of daily consumption)
    batteryCapacityKWh = Math.ceil(dailyConsumptionKWh * 0.5);

    // Calculate backup runtime (hours at reduced load - essential loads only)
    const essentialLoadRatio = 0.4; // Assume 40% of load is essential during backup
    backupRuntimeHours = batteryCapacityKWh / (dailyConsumptionKWh * essentialLoadRatio / 24);
  }

  // Monthly savings based on bill and estimated solar offset (capped at bill amount)
  const monthlySavingsUSD = Math.min(monthlyBillUSD, monthlyBillUSD * ESTIMATED_SOLAR_OFFSET_PERCENT);

  // Grid independence based on solar offset percentage (not appliances)
  gridIndependencePercent = Math.round(ESTIMATED_SOLAR_OFFSET_PERCENT * 100);

  // Calculate ROI (use system size from appliances or minimum if none selected)
  const effectiveSystemSizeKW = systemSizeKW > 0 ? systemSizeKW : 2;
  const effectiveBatteryKWh = batteryCapacityKWh > 0 ? batteryCapacityKWh : 5;
  const totalSystemCost = (effectiveSystemSizeKW * SOLAR_SYSTEM_COST_PER_KW) + (effectiveBatteryKWh * BATTERY_COST_PER_KWH);
  const yearlySavings = monthlySavingsUSD * 12;
  const roiYears = Math.max(3, Math.round(totalSystemCost / yearlySavings));

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

export function generateEnergyData(): {
  hour: number;
  solar: number;
  consumption: number;
  batteryLevel: number;
  batteryFlow: number;
  batteryCharge: number;
  batteryDischarge: number;
  gridImport: number;
  gridExport: number;
  gridFlow: number;
}[] {
  const data = [];
  let batteryLevel = 65; // Start at 65% SoC
  const BATTERY_CAPACITY_KWH = 10;
  const BATTERY_MAX_CHARGE_KW = 5; // Max charge rate
  const BATTERY_MAX_DISCHARGE_KW = 5; // Max discharge rate

  for (let hour = 0; hour < 24; hour++) {
    // Solar generation: bell curve peaking at ~12-13, 0 before 6 and after 18
    // Realistic 6kW system peak
    let solarRaw = 0;
    if (hour >= 6 && hour <= 18) {
      const normalizedHour = (hour - 6) / 12;
      solarRaw = Math.sin(normalizedHour * Math.PI) * 6.0;
    }
    const solar = Math.max(0, Math.round(solarRaw * 10) / 10);

    // Home consumption: realistic daily pattern
    // Base load ~0.5kW, morning peak ~2.5kW, evening peak ~3.5kW
    let consumption = 0.5;
    if (hour >= 6 && hour <= 9) {
      // Morning peak (coffee, heating, getting ready)
      consumption += 1.5 + (hour === 7 ? 0.5 : 0);
    }
    if (hour >= 17 && hour <= 22) {
      // Evening peak (cooking, TV, heating/cooling)
      consumption += 2.0 + (hour === 19 ? 1.0 : 0);
    }
    if (hour >= 0 && hour <= 5) {
      // Night: minimal load, maybe some EV charging
      consumption += 0.2;
    }
    // Add small random variation for realism
    consumption += (Math.random() - 0.5) * 0.2;
    consumption = Math.max(0.3, Math.round(consumption * 10) / 10);

    // Energy flow logic:
    // home_consumption = solar_generation + battery_discharge + grid_import
    // If solar > consumption: excess goes to battery_charge, then grid_export

    let batteryCharge = 0;
    let batteryDischarge = 0;
    let gridImport = 0;
    let gridExport = 0;

    const energyBalance = solar - consumption;

    if (energyBalance >= 0) {
      // Solar surplus: charge battery first, then export
      const surplus = energyBalance;
      const batterySpace = (100 - batteryLevel) / 100 * BATTERY_CAPACITY_KWH;
      const canCharge = Math.min(surplus, batterySpace, BATTERY_MAX_CHARGE_KW);
      batteryCharge = canCharge;
      batteryDischarge = 0;
      gridImport = 0;
      gridExport = Math.max(0, surplus - batteryCharge);
    } else {
      // Solar deficit: discharge battery first, then import from grid
      const deficit = -energyBalance;
      const batteryAvailable = (batteryLevel / 100) * BATTERY_CAPACITY_KWH;
      const canDischarge = Math.min(deficit, batteryAvailable, BATTERY_MAX_DISCHARGE_KW);
      batteryDischarge = canDischarge;
      batteryCharge = 0;
      gridImport = Math.max(0, deficit - batteryDischarge);
      gridExport = 0;
    }

    // Update battery level
    batteryLevel += (batteryCharge / BATTERY_CAPACITY_KWH) * 100;
    batteryLevel -= (batteryDischarge / BATTERY_CAPACITY_KWH) * 100;
    batteryLevel = Math.max(5, Math.min(100, Math.round(batteryLevel * 10) / 10));

    // Battery flow is positive when charging, negative when discharging
    const batteryFlow = batteryCharge - batteryDischarge;
    // Grid flow is positive when importing, negative when exporting
    const gridFlow = gridImport - gridExport;

    // Verify: consumption should equal solar + battery_discharge + grid_import
    const check = solar + batteryDischarge + gridImport;
    // Small floating point tolerance
    if (Math.abs(check - consumption) > 0.01) {
      // Adjust gridImport to balance exactly
      gridImport = Math.max(0, consumption - solar - batteryDischarge);
      gridExport = Math.max(0, solar + batteryDischarge - consumption);
    }

    data.push({
      hour,
      solar,
      consumption,
      batteryLevel,
      batteryFlow,
      batteryCharge,
      batteryDischarge,
      gridImport,
      gridExport,
      gridFlow,
    });
  }

  return data;
}

export function formatNumber(value: number, decimals: number = 1): string {
  return value.toFixed(decimals);
}
