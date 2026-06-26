import { motion } from 'framer-motion';
import { Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export function DemoAccessBanner() {
  return (
    <section className="relative bg-dark-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <GlassCard glow="cyan" className="p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-eco-cyan/20 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-eco-cyan" />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-eco-cyan">
                      Demo Mode
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-gray-400 border border-white/10">
                      Full access available on request
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">
                    Preview EcoStep as a solar sales and quotation tool.
                  </h3>

                  <p className="mt-1 text-sm text-gray-400 max-w-3xl">
                    This public demo uses sample estimates. A branded full-access version can include your company logo, colors, contact details, lead capture, reports, and protected installer tools.
                  </p>
                </div>
              </div>

              <a
                href="#lead-form"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan px-5 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
              >
                <ShieldCheck className="w-4 h-4" />
                Request Full Access
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
}
