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
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Slider } from './ui/Slider';
import { appliances } from '../data/appliances';
import { currencies, formatCurrency, convertFromUSD } from '../data/currencies';
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
};

type EnergyEstimatorProps = {
  onCalculate: (monthlyBill: number, selectedAppliances: Appliance[], results: CalculationResult, currency: string) => void;
};

export function EnergyEstimator({ onCalculate }: EnergyEstimatorProps) {
  const [currency, setCurrency] = useState<string>('USD');
  const [monthlyBill, setMonthlyBill] = useState(150);
  const [selectedAppliances, setSelectedAppliances] = useState<Appliance[]>([]);
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
                          {appliance.watts}W
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
            <ResultsDisplay results={results} currency={currency} />
          </motion.div>
        )}
      </div>
    </section>
  );
}

function ResultsDisplay({ results, currency }: { results: CalculationResult; currency: string }) {
  // Convert monthly savings from USD to selected currency
  const savingsInCurrency = convertFromUSD(results.monthlySavingsUSD, currency);
  const formattedSavings = formatCurrency(savingsInCurrency, currency);

  const metrics = [
    {
      label: 'Solar System Size',
      value: results.systemSizeKW,
      unit: 'kW',
      color: 'green',
    },
    {
      label: 'Battery Capacity',
      value: results.batteryCapacityKWh,
      unit: 'kWh',
      color: 'cyan',
    },
    {
      label: 'Daily Consumption',
      value: results.dailyConsumptionKWh.toFixed(1),
      unit: 'kWh',
      color: 'amber',
    },
    {
      label: 'Backup Runtime',
      value: results.backupRuntimeHours.toFixed(0),
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
      value: results.roiYears,
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
    </div>
  );
}
