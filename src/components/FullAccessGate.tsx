import { motion } from 'framer-motion';
import { Lock, BarChart3, FileText, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export function FullAccessGate() {
  return (
    <section id="visualization" className="relative bg-dark-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 border border-white/10 mb-4">
            <Lock className="w-4 h-4 text-eco-cyan" />
            <span className="text-xs text-gray-400">Full Access Feature</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Unlock the <span className="text-eco-cyan">EcoStep Business Tools</span>
          </h2>

          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
             Turn EcoStep into a business tool for solar installers and distributors with
             branded lead capture, custom pricing, reports, and company-ready workflows.
         </p>

        </motion.div>

        <GlassCard glow="cyan" className="p-8">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-6 text-center">
              <BarChart3 className="w-10 h-10 text-eco-cyan mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Branded Estimator</h3>
              <p className="text-sm text-gray-500">
                 Use EcoStep with your company name, logo, colors, and contact details.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 text-center">
              <FileText className="w-10 h-10 text-eco-green mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Custom Reports</h3>
              <p className="text-sm text-gray-500">
                 Generate professional solar estimate summaries for customers and sales follow-up.
              </p>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 text-center">
              <Users className="w-10 h-10 text-eco-amber mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Lead Capture</h3>
              <p className="text-sm text-gray-500">
                 Collect customer inquiries directly for your solar company or sales team.
              </p>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-eco-cyan/30 bg-eco-cyan/5 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-eco-cyan/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-eco-cyan" />
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    Want to test the full dashboard?
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Request full access for a demo account, branded preview, or white-label setup for your solar company.
                  </p>
                </div>
              </div>

              <a
                href="#lead-form"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan px-5 py-3 text-sm font-semibold text-black transition-transform hover:scale-105"
              >
                Request Full Access
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}
