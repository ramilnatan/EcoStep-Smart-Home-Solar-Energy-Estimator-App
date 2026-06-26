import { motion } from 'framer-motion';
import { FileText, PlayCircle, ShieldCheck, ArrowRight, Sun, Battery, Home, Zap } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';

export function SolarGuide({ onScrollToEstimator }: { onScrollToEstimator: () => void }) {
  return (
    <section id="resources" className="relative bg-dark-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 border border-white/10 mb-4">
            <Sun className="w-4 h-4 text-eco-green" />
            <span className="text-xs text-gray-400">Resources / Solar Guide</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Understand Your <span className="text-eco-green">Hybrid Solar System</span>
          </h2>

          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Learn how hybrid solar works, what devices are included, and why a professional site assessment is important before installation.
          </p>
        </motion.div>

        {/* Hybrid Solar Flow */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GlassCard glow="green" className="p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="rounded-2xl bg-white/5 p-5 text-center">
                <Sun className="w-8 h-8 text-eco-green mx-auto mb-3" />
                <div className="font-semibold text-white">Solar Panels</div>
                <p className="mt-2 text-xs text-gray-500">Capture sunlight and produce DC power.</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-5 text-center">
                <Zap className="w-8 h-8 text-eco-cyan mx-auto mb-3" />
                <div className="font-semibold text-white">Hybrid Inverter</div>
                <p className="mt-2 text-xs text-gray-500">Converts power and manages solar, battery, grid, and load.</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-5 text-center">
                <Battery className="w-8 h-8 text-eco-amber mx-auto mb-3" />
                <div className="font-semibold text-white">Battery Backup</div>
                <p className="mt-2 text-xs text-gray-500">Stores energy for night use and brownout protection.</p>
              </div>

              <div className="rounded-2xl bg-white/5 p-5 text-center">
                <Home className="w-8 h-8 text-eco-green mx-auto mb-3" />
                <div className="font-semibold text-white">Home Loads</div>
                <p className="mt-2 text-xs text-gray-500">Powers selected appliances based on your usage profile.</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Resource Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlassCard glow="cyan" className="p-6 h-full">
              <FileText className="w-10 h-10 text-eco-cyan mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Sample Schematic Layout</h3>
              <p className="text-sm text-gray-400 mb-4">
                View a sample hybrid solar layout showing panels, protection devices, inverter, battery, grid, and home loads.
              </p>
              <div className="rounded-xl bg-white/5 p-4 text-xs text-gray-500">
                PDF guide placeholder — final schematic file will be added here.
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <GlassCard glow="green" className="p-6 h-full">
              <PlayCircle className="w-10 h-10 text-eco-green mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Short Video Guide</h3>
              <p className="text-sm text-gray-400 mb-4">
                A simple video explanation of how hybrid solar powers your home during daytime, nighttime, and power outages.
              </p>
              <div className="rounded-xl bg-white/5 p-4 text-xs text-gray-500">
                Video placeholder — hybrid solar explainer video will be embedded here.
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <GlassCard glow="amber" className="p-6 h-full">
              <ShieldCheck className="w-10 h-10 text-eco-amber mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Safety Reminder</h3>
              <p className="text-sm text-gray-400 mb-4">
                Solar sizing, breaker selection, MPPT string design, grounding, and installation must be verified by a qualified solar installer.
              </p>
              <div className="rounded-xl bg-white/5 p-4 text-xs text-gray-500">
                EcoStep estimates are for planning and quotation guidance only.
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <Button size="lg" onClick={onScrollToEstimator}>
            Generate My Solar Estimate
            <ArrowRight className="w-5 h-5" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
