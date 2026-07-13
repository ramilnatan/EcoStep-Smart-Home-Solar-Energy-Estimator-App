import { motion } from 'framer-motion';
import { Battery, Zap, Shield, Sun, ChevronDown, BatteryCharging, Plug } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';

const features = [
  { icon: Sun, label: 'Solar Savings', value: 'Up to 85%', color: 'green' },
  { icon: Battery, label: 'Backup Power', value: '24/7', color: 'cyan' },
  { icon: Shield, label: 'Outage Protection', value: '100%', color: 'amber' },
  { icon: Zap, label: 'Energy Independent', value: 'Grid-Free', color: 'green' },
];

export function Hero({
  onScrollToEstimator,
  onOpenTrialModal,
}: {
  onScrollToEstimator: () => void;
  onOpenTrialModal: () => void;
}) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900 pt-24 pb-24">
    
    {/* Animated Background */}
        <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,197,94,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.05),transparent_50%)]" />

        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-eco-green/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Central Energy Visualization */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          className="relative w-96 h-96"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 2 }}
        >
          {/* Core Glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-40 h-40 bg-eco-green/20 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </div>

          {/* Rotating Ring */}
          <motion.div
            className="absolute inset-8 border-2 border-dashed border-eco-cyan/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-16 border border-eco-green/30 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>

      {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center -translate-y-4 sm:-translate-y-6">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
        >
          <BatteryCharging className="w-4 h-4 text-eco-green" />
          <span className="text-sm text-gray-300">Smart Home Solar Solutions</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl sm:text-6xl lg:text-6xl xl:text-7xl font-bold mb-6"
        >
          <span className="text-white">Power Your Home </span>
          <span className="bg-gradient-to-r from-eco-green via-eco-cyan to-eco-green bg-clip-text text-transparent">
            Smarter
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-xl text-gray-400 max-w-3xl mx-auto mb-12"
        >
          Unlock massive solar savings, secure battery backup, complete outage protection,
          and achieve true energy independence with our intelligent home energy system estimator.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
  <Button size="lg" onClick={onScrollToEstimator}>
    <Plug className="w-5 h-5" />
    Estimate My System
  </Button>

  <Button
  size="lg"
  variant="secondary"
  onClick={onOpenTrialModal}
>
  🚀 Start Free Trial
</Button>
</div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
            >
              <GlassCard
                glow={feature.color as 'green' | 'cyan' | 'amber'}
                className="p-4 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:scale-[1.08] hover:shadow-xl hover:shadow-eco-green/10"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${feature.color === 'green' ? 'bg-eco-green/20' : ''}
                    ${feature.color === 'cyan' ? 'bg-eco-cyan/20' : ''}
                    ${feature.color === 'amber' ? 'bg-eco-amber/20' : ''}
                  `}>
                    <feature.icon className={`w-5 h-5 text-eco-${feature.color}`} />
                  </div>
                  <div className="text-lg font-bold text-white">{feature.value}</div>
                  <div className="text-xs text-gray-400">{feature.label}</div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 cursor-pointer"
          onClick={onScrollToEstimator}
        >
          <span className="text-xs text-gray-500">Scroll to explore</span>
          <ChevronDown className="w-5 h-5 text-eco-green" />
        </motion.div>
      </motion.div>
    </section>
  );
}
