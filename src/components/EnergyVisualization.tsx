import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Line,
} from 'recharts';
import { Sun, Battery, Zap, ArrowDown, ArrowUp, Activity } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { generateEnergyData } from '../utils/calculations';

export function EnergyVisualization() {
  const [energyData, setEnergyData] = useState(generateEnergyData());
  const [currentTime, setCurrentTime] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnergyData(generateEnergyData());
      setCurrentTime((prev) => (prev + 1) % 24);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const currentData = energyData[currentTime] || energyData[12];
  const batteryLevel = currentData?.battery || 50;

  return (
    <section id="visualization" className="py-24 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-eco-cyan/10 border border-eco-cyan/30 mb-6">
            <Activity className="w-4 h-4 text-eco-cyan" />
            <span className="text-sm text-eco-cyan">Live Energy Dashboard</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Visualize Your{' '}
            <span className="text-eco-cyan">Energy Flow</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Watch how solar energy powers your home throughout the day, charges your battery, and feeds excess back to the grid.
          </p>
        </motion.div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <GlassCard glow="green" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-eco-green/20 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-eco-green" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Solar Generation</div>
                  <div className="text-2xl font-bold text-white">
                    {currentData?.solar?.toFixed(1) || 0}
                    <span className="text-sm text-gray-400 ml-1">kW</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <GlassCard glow="cyan" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-eco-cyan/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-eco-cyan" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Home Consumption</div>
                  <div className="text-2xl font-bold text-white">
                    {currentData?.consumption?.toFixed(1) || 0}
                    <span className="text-sm text-gray-400 ml-1">kW</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <GlassCard glow="amber" className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-eco-amber/20 flex items-center justify-center">
                  <Battery className="w-6 h-6 text-eco-amber" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Battery Level</div>
                  <div className="text-2xl font-bold text-white">
                    {batteryLevel.toFixed(0)}
                    <span className="text-sm text-gray-400 ml-1">%</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <GlassCard
              glow={currentData?.grid > 0 ? 'amber' : 'green'}
              className={`p-4 ${currentData?.grid < 0 ? 'border-eco-green/50' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentData?.grid < 0 ? 'bg-eco-green/20' : 'bg-eco-amber/20'}`}>
                  {currentData?.grid < 0 ? (
                    <ArrowUp className="w-6 h-6 text-eco-green" />
                  ) : (
                    <ArrowDown className="w-6 h-6 text-eco-amber" />
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500">
                    {currentData?.grid < 0 ? 'Exporting to Grid' : 'Importing from Grid'}
                  </div>
                  <div className="text-2xl font-bold text-white">
                    {Math.abs(currentData?.grid || 0).toFixed(1)}
                    <span className="text-sm text-gray-400 ml-1">kW</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Solar vs Consumption Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Solar vs Consumption</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={energyData}>
                  <defs>
                    <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="consumptionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="hour"
                    stroke="#71717a"
                    tickFormatter={(value) => `${value}:00`}
                  />
                  <YAxis stroke="#71717a" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '12px',
                    }}
                    labelFormatter={(value) => `${value}:00`}
                  />
                  <Area
                    type="monotone"
                    dataKey="solar"
                    stroke="#22c55e"
                    fill="url(#solarGradient)"
                    name="Solar"
                  />
                  <Area
                    type="monotone"
                    dataKey="consumption"
                    stroke="#06b6d4"
                    fill="url(#consumptionGradient)"
                    name="Consumption"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>

          {/* Battery & Grid Flow */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Battery & Grid Flow</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={energyData}>
                  <defs>
                    <linearGradient id="batteryGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis
                    dataKey="hour"
                    stroke="#71717a"
                    tickFormatter={(value) => `${value}:00`}
                  />
                  <YAxis stroke="#71717a" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '12px',
                    }}
                    labelFormatter={(value) => `${value}:00`}
                  />
                  <Area
                    type="monotone"
                    dataKey="battery"
                    stroke="#f59e0b"
                    fill="url(#batteryGradient)"
                    name="Battery %"
                  />
                  <Line
                    type="monotone"
                    dataKey="grid"
                    stroke="#a855f7"
                    strokeWidth={2}
                    dot={false}
                    name="Grid Flow"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </GlassCard>
          </motion.div>
        </div>

        {/* Battery Status Bar */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard glow="amber" className="p-6">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-xl bg-eco-amber/20 flex items-center justify-center">
                  <Battery className="w-8 h-8 text-eco-amber" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Battery Storage</span>
                  <span className="text-lg font-bold text-eco-amber">{batteryLevel.toFixed(0)}%</span>
                </div>
                <div className="h-6 bg-dark-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-eco-amber to-eco-green rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${batteryLevel}%` }}
                    transition={{ duration: 1 }}
                  >
                    {/* Charging indicator */}
                    {currentData?.solar > currentData?.consumption && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>0 kWh</span>
                  <span>5 kWh</span>
                  <span>10 kWh</span>
                </div>
              </div>
              <div className="flex-shrink-0 hidden sm:block">
                <div className={`text-sm px-3 py-1 rounded-full ${
                  currentData?.solar > currentData?.consumption
                    ? 'bg-eco-green/20 text-eco-green'
                    : 'bg-eco-amber/20 text-eco-amber'
                }`}>
                  {currentData?.solar > currentData?.consumption ? 'Charging' : 'Discharging'}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
