import { motion } from 'framer-motion';
import { Calculator, Clock, Building2, Users, ShieldCheck, Sparkles } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

const reasons = [
  {
    icon: Calculator,
    title: 'Faster Solar Estimates',
    description:
      'Turn monthly bills and appliance usage into quick solar sizing, battery, panel, and ROI previews.',
    glow: 'green',
  },
  {
    icon: Clock,
    title: 'Saves Installer Time',
    description:
      'Reduce repeated manual calculations and give customers a clearer starting point during sales conversations.',
    glow: 'cyan',
  },
  {
    icon: Building2,
    title: 'Business-Ready Options',
    description:
      'EcoStep can support subscription access and full white-label versions for solar companies.',
    glow: 'amber',
  },
  {
    icon: Users,
    title: 'Lead Capture Flow',
    description:
      'Collect home quote, subscription, and white-label requests from one professional customer form.',
    glow: 'green',
  },
  {
    icon: ShieldCheck,
    title: 'Professional Demo Structure',
    description:
      'Clear demo limits, preview labels, and estimate notices make the product easier to explain and safer to present.',
    glow: 'cyan',
  },
  {
    icon: Sparkles,
    title: 'Portfolio-Ready SaaS Demo',
    description:
      'Showcase a polished React, Supabase-ready, and business-focused solar SaaS concept.',
    glow: 'amber',
  },
];

export function WhyEcoStep() {
  return (
    <section id="why-ecostep" className="relative bg-dark-900 py-24 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Sparkles className="h-4 w-4 text-eco-green" />
            <span className="text-xs text-gray-400">Why EcoStep</span>
          </div>

          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Built for Faster, Smarter{' '}
            <span className="bg-gradient-to-r from-eco-green to-eco-cyan bg-clip-text text-transparent">
              Solar Decisions
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-400">
            EcoStep helps homeowners, installers, and distributors understand solar
            needs faster while creating a clear path toward subscription and white-label use.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map((reason, index) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <GlassCard
                glow={reason.glow as 'green' | 'cyan' | 'amber'}
                className="h-full p-6 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                  <reason.icon className="h-7 w-7 text-eco-green" />
                </div>

                <h3 className="text-xl font-bold text-white">{reason.title}</h3>

                <p className="mt-3 text-sm leading-relaxed text-gray-400">
                  {reason.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
