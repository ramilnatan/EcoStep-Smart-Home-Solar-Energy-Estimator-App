import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Refrigerator,
  Lightbulb,
  Wind,
  Monitor,
  Droplets,
  Wifi,
  Tv,
  ChefHat,
  Zap,
  DollarSign,
  WashingMachine,
  Fan,
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Slider } from './ui/Slider';
import { appliances } from '../data/appliances';
import { currencies, formatCurrency } from '../data/currencies';
import { Appliance, CalculationResult } from '../types';
import { calculateEnergyResults } from '../utils/calculations';

const iconMap: Record<string, React.ElementType> = {
  Refrigerator,
  Lightbulb,
  Wind,
  Monitor,
  Droplets,
  Wifi,
  Tv,
  ChefHat,
  WashingMachine,
  Fan,
};

type EnergyEstimatorProps = {
  onCalculate: (monthlyBill: number, selectedAppliances: Appliance[], results: CalculationResult, currency: string) => void;
};

export function EnergyEstimator({ onCalculate }: EnergyEstimatorProps) {
  const [currency, setCurrency] = useState<string>('USD');
  const [monthlyBill, setMonthlyBill] = useState(150);
  const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);
  const [panelWattage, setPanelWattage] = useState(550);
  const [results, setResults] = useState<CalculationResult | null>(null);

  const currentCurrency = currencies.find((c) => c.code === currency) || currencies[0];

  useEffect(() => {
    const calculationResults = calculateEnergyResults(monthlyBill, selectedAppliances, currency);
    setResults(calculationResults);
    onCalculate(monthlyBill, selectedAppliances, calculationResults, currency);
  }, [monthlyBill, selectedAppliances, currency, onCalculate]);

  // Reset monthly bill when currency changes to fit the new range
  const handleCurrencyChange = (newCurrency: string) => {
    const newCurrencyData = currencies.find((c) => c.code === newCurrency) || currencies[0];
    setCurrency(newCurrency);
    setMonthlyBill(newCurrencyData.minBill);
  };

  const toggleAppliance = (appliance: Appliance) => {
    setSelectedAppliances((prev) => {
      const isSelected = prev.some((a) => a.id === appliance.id);
      if (isSelected) {
        return prev.filter((a) => a.id !== appliance.id);
      }
      return [...prev, appliance];
    });
  };

  const updateApplianceQuantity = (applianceId: string, change: number) => {
    setSelectedAppliances((prev) =>
      prev.map((app) =>
        app.id === applianceId
          ? { ...app, quantity: Math.max(1, (app.quantity ?? 1) + change) }
          : app
      )
    );
  };

  const updateApplianceHours = (applianceId: string, change: number) => {
    setSelectedAppliances((prev) =>
      prev.map((app) =>
        app.id === applianceId
    ? { ...app, hoursPerDay: Math.max(1, Math.min(24, app.hoursPerDay + change)) }
    : app
  )
);
};

const updateApplianceWatts = (applianceId: string, watts: number) => {
  setSelectedAppliances((prev) =>
    prev.map((app) =>
      app.id === applianceId
        ? { ...app, watts: Math.max(1, watts) }
        : app
    )
  );
};

  return (
    <section id="estimator" className="relative py-24 bg-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Customize Your{' '}
            <span className="text-eco-green">Energy Profile</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Adjust your monthly bill and select your appliances to get a personalized solar system recommendation.
          </p>
        </motion.div>

        {/* Currency Selector & Monthly Bill Slider */}
        <motion.div
          className="max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard glow="green" className="p-8">
            {/* Currency Selector */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Select Your Currency
              </label>
              <div className="flex flex-wrap gap-2">
                {currencies.map((curr) => (
                  <motion.button
                    key={curr.code}
                    onClick={() => handleCurrencyChange(curr.code)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                      transition-all duration-300
                      ${currency === curr.code
                        ? 'bg-eco-green/20 border-2 border-eco-green text-eco-green'
                        : 'bg-white/5 border border-white/10 text-gray-400 hover:border-white/30'
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>{curr.symbol}</span>
                    <span className="hidden sm:inline">{curr.code}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Monthly Bill Slider */}
            <Slider
              value={monthlyBill}
              onChange={setMonthlyBill}
              min={currentCurrency.minBill}
              max={currentCurrency.maxBill}
              step={currentCurrency.step}
              label="Monthly Electric Bill"
              formatValue={(v) => formatCurrency(v, currency)}
            />
          </GlassCard>
        </motion.div>

        {/* Appliance Selection */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-2 mb-8">
            <Zap className="w-5 h-5 text-eco-cyan" />
            <h3 className="text-xl font-semibold text-white">Select Your Appliances</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {appliances.map((appliance, index) => {
              const Icon = iconMap[appliance.icon] || Zap;
              const isSelected = selectedAppliances.some((a) => a.id === appliance.id);
              const selectedAppliance = selectedAppliances.find((a) => a.id === appliance.id);
              const displayQuantity = selectedAppliance?.quantity ?? appliance.quantity ?? 1;
              const displayHours = selectedAppliance?.hoursPerDay ?? appliance.hoursPerDay;
              const displayWatts = selectedAppliance?.watts ?? appliance.watts;

              return (
                <motion.button
                  key={appliance.id}
                  onClick={() => toggleAppliance(appliance)}
                  className="relative group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <GlassCard
                    hover
                    glow={isSelected ? 'green' : 'none'}
                    className={`p-4 h-full transition-all duration-300 ${
                      isSelected
                        ? 'border-eco-green/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
                        : ''
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      {/* Icon Container */}
                      <div
                        className={`
                          w-14 h-14 rounded-xl flex items-center justify-center
                          transition-all duration-300
                          ${isSelected ? 'bg-eco-green/20' : 'bg-white/5'}
                        `}
                        >
                        <Icon
                          className={`w-7 h-7 transition-colors ${
                            isSelected ? 'text-eco-green' : 'text-gray-400'
                          }`}
                        />
                      </div>

                      {/* Name */}
                      <div className="text-center">
                        <div className="text-sm font-medium text-white">{appliance.name}</div>
                        <div className="text-xs text-gray-500 mt-1">
                        <div
                         className="flex items-center justify-center gap-1"
                           onClick={(e) => e.stopPropagation()}
                             >
                        <input
                         type="number"
                              min="1"
                              value={displayWatts}
                              onChange={(e) => updateApplianceWatts(appliance.id, Number(e.target.value))}
                              className="w-16 rounded bg-dark-700 px-2 py-1 text-center text-white outline-none focus:ring-1 focus:ring-eco-green"
                          />
                         <span>W</span>
                        </div>

                        {appliance.id === 'ac' && (
                          <div
                               className="mt-2 flex items-center justify-center gap-1"
                               onClick={(e) => e.stopPropagation()}
                          >
                         <button
                               type="button"
                               onClick={() => updateApplianceWatts(appliance.id, 674)}
                               className="rounded bg-dark-700 px-2 py-1 text-[10px] text-white hover:bg-dark-600"
                         >
                             1 HP
                        </button>

                        <button
                                 type="button"
                                 onClick={() => updateApplianceWatts(appliance.id, 1011)}
                                 className="rounded bg-dark-700 px-2 py-1 text-[10px] text-white hover:bg-dark-600"
                              >
                                 1.5 HP
                        </button>

                         <button
                                  type="button"
                                  onClick={() => updateApplianceWatts(appliance.id, 1348)}
                                  className="rounded bg-dark-700 px-2 py-1 text-[10px] text-white hover:bg-dark-600"
                         >
                              2 HP
                         </button>
                         </div>
                        )}

                          <div
                            className="flex items-center justify-center gap-2"
                             onClick={(e) => e.stopPropagation()}
                           >
                            <button
                              type="button"
                              onClick={() => updateApplianceQuantity(appliance.id, -1)}
                              className="w-6 h-6 rounded-full bg-dark-700 text-white hover:bg-dark-600"
                           >
                              -
                           </button>
                             <span>Qty: {displayQuantity}</span>
                         
                           <button
                            type="button"
                            onClick={() => updateApplianceQuantity(appliance.id, 1)}
                            className="w-6 h-6 rounded-full bg-dark-700 text-white hover:bg-dark-600"
                           >
                             +
                           </button>
                        </div>
         
                        <div
                        className="flex items-center justify-center gap-2"
                        onClick={(e) => e.stopPropagation()}
                        >
                          <button
                          type="button"
                          onClick={() => updateApplianceHours(appliance.id, -1)}
                          className="w-6 h-6 rounded-full bg-dark-700 text-white hover:bg-dark-600"
                          >
                            -
                          </button>

                          <span>{displayHours} hrs/day</span>

                          <button
                           type="button"
                           onClick={() => updateApplianceHours(appliance.id, 1)}
                           className="w-6 h-6 rounded-full bg-dark-700 text-white hover:bg-dark-600"
                          >
                            +
                            </button> 
                            
                        </div>
                        </div>
                        </div>
                      {/* Selection Indicator */}
                      <AnimatePresence>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute top-2 right-2 w-5 h-5 bg-eco-green rounded-full flex items-center justify-center"
                          >
                            <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </GlassCard>
                </motion.button>
              );
            })}
          </div>

          {/* Selection Summary */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500">
              {selectedAppliances.length === 0
                ? 'No appliances selected'
                : `${selectedAppliances.length} appliance${selectedAppliances.length > 1 ? 's' : ''} selected`}
            </span>
          </div>
        </motion.div>

        {/* Results Display */}
        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            
            <ResultsDisplay
              results={results}
              currency={currency}
              monthlyBill={monthlyBill}
              panelWattage={panelWattage}
              setPanelWattage={setPanelWattage}
            />

          </motion.div>
        )}
      </div>
    </section>
  );
}

function ResultsDisplay({
  results,
  currency,
  monthlyBill,
  panelWattage,
  setPanelWattage,
}: {
  results: CalculationResult;
  currency: string;
  monthlyBill: number;
  panelWattage: number;
  setPanelWattage: (value: number) => void;
}) {
 
  // Monthly savings is already converted to selected currency
  const formattedSavings = formatCurrency(results.monthlySavings, currency);
  const hasAppliances = results.dailyConsumptionKWh > 0;
  const costPerKwByCurrency: Record<string, number> = {
    PHP: 45000,
    USD: 900,
  };
  
  const costPerKw = costPerKwByCurrency[currency] ?? 900;
  const estimatedSystemCost = hasAppliances ? results.systemSizeKW * costPerKw : 0;
  
  const estimatedNewBill = Math.max(0, monthlyBill - results.monthlySavings);
  const annualSavings = results.monthlySavings * 12;
  
  const expectedPaybackYears =
    annualSavings > 0 ? estimatedSystemCost / annualSavings : 0;
  
  const optimisticPaybackYears = expectedPaybackYears * 0.85;
  const conservativePaybackYears = expectedPaybackYears * 1.3;
  
  const formattedCurrentBill = formatCurrency(monthlyBill, currency);
  const formattedNewBill = formatCurrency(estimatedNewBill, currency);
  const formattedAnnualSavings = formatCurrency(annualSavings, currency);
  const formattedSystemCost = formatCurrency(estimatedSystemCost, currency);
  const safePanelWattage = Math.max(1, panelWattage);
  const panelsNeeded = hasAppliances
  ? Math.ceil((results.systemSizeKW * 1000) / safePanelWattage)
  : 0;
  const totalPvCapacityKW = hasAppliances
  ? ((panelsNeeded * safePanelWattage) / 1000).toFixed(1)
  : '0.0';
  const metrics = [
    {
      label: 'Solar System Size',
      value: hasAppliances ? results.systemSizeKW : 0,
      unit: 'kW',
      color: 'green',
    },
    {
      label: 'Battery Capacity',
      value: hasAppliances ? results.batteryCapacityKWh : 0,
      unit: 'kWh',
      color: 'cyan',
    },
    {
      label: 'Daily Consumption',
      value: hasAppliances ? results.dailyConsumptionKWh.toFixed(1) : '0.0',
      unit: 'kWh',
      color: 'amber',
    },
    {
      label: 'Backup Runtime',
      value: hasAppliances ? results.backupRuntimeHours.toFixed(0) : 0,
      unit: 'hrs',
      color: 'green',
    },
    {
      label: 'Monthly Savings',
      value: formattedSavings,
      unit: '',
      color: 'cyan',
    },
    {
       label: 'ROI Timeline',
       value: expectedPaybackYears.toFixed(1),
       unit: 'years',
       color: 'amber',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <GlassCard
            glow={metric.color as 'green' | 'cyan' | 'amber'}
            className="p-4 text-center"
          >
            <div className={`text-3xl font-bold text-eco-${metric.color} mb-1`}>
              {metric.value}
              <span className="text-sm text-gray-400 ml-1">{metric.unit}</span>
            </div>
            <div className="text-xs text-gray-500">{metric.label}</div>
          </GlassCard>
        </motion.div>
      ))}

      {/* Grid Independence */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.6 }}
        className="col-span-2 md:col-span-3"
      >
        <GlassCard glow="green" className="p-4 text-center">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <div className="text-2xl font-bold text-eco-green mb-1">
                {results.gridIndependencePercent}%
              </div>
              <div className="text-xs text-gray-500">Grid Independence</div>
            </div>
            <div className="flex-1 ml-4">
              <div className="h-3 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-eco-green to-eco-cyan rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${results.gridIndependencePercent}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
             {/* Solar Panel Recommendation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.7 }}
        className="col-span-2 md:col-span-3 lg:col-span-6"
      >
        <GlassCard glow="cyan" className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-bold text-white">
                Recommended Solar Panel Setup
              </div>
              <div className="text-xs text-gray-500">
                Estimated using editable panel wattage.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Panel Wattage:</span>
              <input
                type="number"
                min="1"
                value={panelWattage}
                onChange={(e) =>
                  setPanelWattage(Math.max(1, Number(e.target.value) || 1))
                }
                className="w-20 rounded bg-dark-700 px-2 py-1 text-center text-white outline-none focus:ring-1 focus:ring-eco-cyan"
              />
              <span className="text-xs text-gray-400">W</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-2xl font-bold text-eco-green">
                {panelsNeeded}
              </div>
              <div className="text-xs text-gray-500">Panels Needed</div>
            </div>

            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-2xl font-bold text-eco-cyan">
                {safePanelWattage}W
              </div>
              <div className="text-xs text-gray-500">Panel Size</div>
            </div>

            <div className="rounded-xl bg-white/5 p-4 text-center col-span-2 md:col-span-1">
              <div className="text-2xl font-bold text-eco-amber">
                {totalPvCapacityKW} kW
              </div>
              <div className="text-xs text-gray-500">Total PV Capacity</div>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            Final panel count, roof layout, inverter MPPT voltage, and string design should be verified by a qualified solar installer.
          </p>
        </GlassCard>
      </motion.div>

            {/* ROI Savings Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.8 }}
        className="col-span-2 md:col-span-3 lg:col-span-6"
      >
        <GlassCard glow="green" className="p-4">
          <div className="mb-4">
            <div className="text-lg font-bold text-white">
              ROI Savings Breakdown
            </div>
            <div className="text-xs text-gray-500">
              Transparent estimate based on your monthly bill, selected appliances, and estimated system size.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-xl font-bold text-white">
                {formattedCurrentBill}
              </div>
              <div className="text-xs text-gray-500">Current Bill</div>
            </div>

            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-xl font-bold text-eco-green">
                {formattedNewBill}
              </div>
              <div className="text-xs text-gray-500">Estimated New Bill</div>
            </div>

            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-xl font-bold text-eco-cyan">
                {formattedSavings}
              </div>
              <div className="text-xs text-gray-500">Monthly Savings</div>
            </div>

            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-xl font-bold text-eco-amber">
                {formattedAnnualSavings}
              </div>
              <div className="text-xs text-gray-500">Annual Savings</div>
            </div>

            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-xl font-bold text-white">
                {formattedSystemCost}
              </div>
              <div className="text-xs text-gray-500">Estimated System Cost</div>
            </div>

            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-xl font-bold text-eco-green">
                {expectedPaybackYears.toFixed(1)} yrs
              </div>
              <div className="text-xs text-gray-500">Expected Payback</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-lg font-bold text-eco-green">
                {optimisticPaybackYears.toFixed(1)} yrs
              </div>
              <div className="text-xs text-gray-500">Optimistic Payback</div>
            </div>

            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-lg font-bold text-eco-cyan">
                {expectedPaybackYears.toFixed(1)} yrs
              </div>
              <div className="text-xs text-gray-500">Expected Payback</div>
            </div>

            <div className="rounded-xl bg-white/5 p-4 text-center">
              <div className="text-lg font-bold text-eco-amber">
                {conservativePaybackYears.toFixed(1)} yrs
              </div>
              <div className="text-xs text-gray-500">Conservative Payback</div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-white/5 p-4">
            <div className="text-sm font-semibold text-white mb-2">
              Assumptions
            </div>
            <p className="text-xs text-gray-500">
              Assumes {results.gridIndependencePercent}% solar offset and an estimated system cost of {formatCurrency(costPerKw, currency)} per kW.
              Actual savings depend on sunlight, roof angle, battery size, appliance usage, utility rate, and final installation design.
              Professional site assessment is recommended.
            </p>
          </div>
        </GlassCard>
      </motion.div>

    </div>
  );
}
