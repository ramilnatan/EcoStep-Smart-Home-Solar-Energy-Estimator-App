import { Appliance, CalculationResult } from '../types';
import { convertToUSD, convertFromUSD } from '../data/currencies';

// Hybrid solar calculation constants
const DAYTIME_SOLAR_HOURS = 6; // Usable daytime solar window
const NIGHTTIME_HOURS = 18; // Off-peak / night coverage window
const SOLAR_PEAK_SUN_HOURS = 4.5; // Peak summer usable sun hours
const SYSTEM_EFFICIENCY = 0.8; // 80% system efficiency after inverter/wiring losses
const BATTERY_DEPTH_OF_DISCHARGE = 0.8; // Safe usable LiFePO4 capacity
const ELECTRICITY_RATE = 0.12; // $/kWh reference rate

// Default cost assumptions used only for backend/default ROI fallback
const SOLAR_SYSTEM_COST_PER_KW = 2500; // $/kW installed cost assumption
const BATTERY_COST_PER_KWH = 500; // $/kWh battery cost assumption

export function calculateEnergyResults(
  monthlyBill: number,
  selectedAppliances: Appliance[],
  currencyCode: string = 'USD'
): CalculationResult {
  // Convert bill to USD for consistent calculations
  const monthlyBillUSD =
    currencyCode === 'USD'
      ? monthlyBill
      : convertToUSD(monthlyBill, currencyCode);

  let dailyConsumptionKWh = 0;
  let dayLoadKWh = 0;
  let nightLoadKWh = 0;

  selectedAppliances.forEach((app) => {
    const quantity = app.quantity ?? 1;
    const watts = Math.max(0, app.watts);
    const hoursPerDay = Math.max(0, Math.min(24, app.hoursPerDay));
    const loadKW = (watts * quantity) / 1000;
    const applianceEnergyKWh = loadKW * hoursPerDay;

    dailyConsumptionKWh += applianceEnergyKWh;

    const applianceName = app.name.toLowerCase();
    const applianceId = app.id.toLowerCase();
    const applianceCategory = app.category.toLowerCase();

    const isNightPriorityLoad =
      applianceName.includes('light') ||
      applianceId.includes('light') ||
      applianceCategory.includes('lighting');

    if (isNightPriorityLoad) {
      // Lights are normally used after dark, so count them as night load.
      nightLoadKWh += applianceEnergyKWh;
      return;
    }

    if (hoursPerDay >= 24) {
      // 24-hour appliances, like refrigerators, are split into day and night.
      dayLoadKWh += loadKW * DAYTIME_SOLAR_HOURS;
      nightLoadKWh += loadKW * NIGHTTIME_HOURS;
      return;
    }

    // Default rule for other appliances:
    // first 6 hours are assumed daytime solar usage, remaining hours are night/off-peak.
    const daytimeHours = Math.min(hoursPerDay, DAYTIME_SOLAR_HOURS);
    const nighttimeHours = Math.max(0, hoursPerDay - DAYTIME_SOLAR_HOURS);

    dayLoadKWh += loadKW * daytimeHours;
    nightLoadKWh += loadKW * nighttimeHours;
  });

  let systemSizeKW = 0;
  let batteryCapacityKWh = 0;
  let backupRuntimeHours = 0;
  let gridIndependencePercent = 0;

  if (selectedAppliances.length > 0 && dailyConsumptionKWh > 0) {
    // Battery is sized to safely cover the calculated night load.
    batteryCapacityKWh = nightLoadKWh / BATTERY_DEPTH_OF_DISCHARGE;

    // Solar must cover daytime load and recharge the battery bank during peak sun.
    const totalGenerationNeededKWh = dayLoadKWh + batteryCapacityKWh;

    const rawSystemSizeKW =
      totalGenerationNeededKWh / (SOLAR_PEAK_SUN_HOURS * SYSTEM_EFFICIENCY);

    // Round up to nearest 0.5kW for practical installer sizing.
    systemSizeKW = Math.ceil(rawSystemSizeKW * 2) / 2;

    // True backup runtime based on usable battery capacity and average daily load.
    const averageHourlyLoadKW = dailyConsumptionKWh / 24;
    const usableBatteryKWh = batteryCapacityKWh * BATTERY_DEPTH_OF_DISCHARGE;

    backupRuntimeHours =
      averageHourlyLoadKW > 0 ? usableBatteryKWh / averageHourlyLoadKW : 0;

    // Under the peak summer hybrid assumption, correctly sized solar + battery can reach 100%.
    gridIndependencePercent = 100;
  }

  // Estimated savings during optimal sun months.
  const monthlySavingsUSD =
    monthlyBillUSD * (gridIndependencePercent / 100);

  // Default ROI fallback calculation.
  // The UI can still refine ROI using the editable cost/kW assumption.
  const effectiveSystemSizeKW = systemSizeKW > 0 ? systemSizeKW : 0;
  const effectiveBatteryKWh = batteryCapacityKWh > 0 ? batteryCapacityKWh : 0;

  const totalSystemCost =
    effectiveSystemSizeKW * SOLAR_SYSTEM_COST_PER_KW +
    effectiveBatteryKWh * BATTERY_COST_PER_KWH;

  const yearlySavings = monthlySavingsUSD * 12;

  const roiYears =
    yearlySavings > 0
      ? Math.round((totalSystemCost / yearlySavings) * 10) / 10
      : 0;

  return {
    systemSizeKW,
    batteryCapacityKWh: Math.round(batteryCapacityKWh * 10) / 10,
    dailyConsumptionKWh: Math.round(dailyConsumptionKWh * 10) / 10,
    backupRuntimeHours: Math.round(backupRuntimeHours * 10) / 10,
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
