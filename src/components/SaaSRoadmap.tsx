import { motion } from 'framer-motion';
import { CheckCircle, Lock, Rocket, ShieldCheck, Building2 } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

const roadmapItems = [
  {
    phase: 'Live Public Demo',
    status: 'Available Now',
    icon: CheckCircle,
    glow: 'green',
    items: [
      'Solar estimator with demo appliance limit',
      'Editable watts, quantity, and usage hours',
      'Panel recommendation and ROI preview',
      'Quote, subscription, and white-label request form',
    ],
  },
  {
    phase: 'Business Preview',
    status: 'Preview UI',
    icon: Building2,
    glow: 'cyan',
    items: [
      'Admin and subscriber login preview',
      'Admin dashboard preview',
      'Subscriber dashboard preview',
      'Hybrid Power Flow Simulation preview',
    ],
  },
  {
    phase: 'Production SaaS',
    status: 'Future Phase',
    icon: ShieldCheck,
    glow: 'amber',
    items: [
      'Real Supabase Auth with protected roles',
      'Subscriber accounts and trial expiry',
      'Lead management and reporting tools',
      'White-label company setup and branding',
    ],
  },
];

export function SaaSRoadmap() {
  return (
    <section id="roadmap" className="relative bg-dark-900 py-24 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Rocket className="h-4 w-4 text-eco-green" />
            <span className="text-xs text-gray-400">EcoStep SaaS Roadmap</span>
          </div>

          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            From Demo to{' '}
            <span className="bg-gradient-to-r from-eco-green to-eco-cyan bg-clip-text text-transparent">
              Solar SaaS Platform
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-400">
            EcoStep is currently a polished public demo with business-ready preview
            sections. Future phases can add real protected accounts, subscriptions,
            lead management, and white-label company versions.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {roadmapItems.map((item, index) => (
            <motion.div
              key={item.phase}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard
                glow={item.glow as 'green' | 'cyan' | 'amber'}
                className="h-full p-6 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
              >
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                    <item.icon className="h-7 w-7 text-eco-green" />
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
                    {item.status}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white">{item.phase}</h3>

                <div className="mt-6 space-y-3">
                  {item.items.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 text-sm text-gray-400">
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-eco-green" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-eco-amber/10">
            <Lock className="h-6 w-6 text-eco-amber" />
          </div>

          <h3 className="text-2xl font-bold text-white">
            Roadmap note
          </h3>

          <p className="mx-auto mt-3 max-w-3xl text-sm leading-relaxed text-gray-400">
            Login screens and dashboards are preview UI only in the current demo.
            Real authentication, protected routes, subscriber billing, and admin
            permissions should be added later as a separate production phase.
          </p>
        </div>
      </div>
    </section>
  );
}
