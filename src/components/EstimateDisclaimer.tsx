import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle, Wrench, FileWarning } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export function EstimateDisclaimer() {
  return (
    <section className="relative bg-dark-900 px-4 pb-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard glow="amber" className="p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-eco-amber/10">
                  <ShieldAlert className="h-6 w-6 text-eco-amber" />
                </div>

                <div>
                  <div className="mb-2 inline-flex rounded-full border border-eco-amber/20 bg-eco-amber/10 px-3 py-1 text-xs font-semibold text-eco-amber">
                    Estimate Notice
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    EcoStep estimates are for planning and preview purposes.
                  </h3>

                  <p className="mt-2 max-w-4xl text-sm leading-relaxed text-gray-400">
                    System size, battery capacity, panel count, savings, and ROI are approximate
                    estimates based on user inputs. Final design, electrical protection,
                    roof layout, inverter compatibility, battery sizing, and local code compliance
                    should always be verified by a qualified solar installer or engineer.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 text-sm text-gray-400 sm:grid-cols-3 lg:min-w-[430px]">
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <CheckCircle className="h-4 w-4 text-eco-green" />
                  <span>Planning preview</span>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <Wrench className="h-4 w-4 text-eco-cyan" />
                  <span>Installer verified</span>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <FileWarning className="h-4 w-4 text-eco-amber" />
                  <span>Not final design</span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
