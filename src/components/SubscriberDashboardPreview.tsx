import { motion } from 'framer-motion';
import { Building2, Calculator, Users, Settings, Activity, ArrowRight } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

const subscriberStats = [
  {
    label: 'Monthly Estimates',
    value: '128',
    description: 'Customer solar estimates generated',
    icon: Calculator,
    glow: 'green',
  },
  {
    label: 'Captured Leads',
    value: '42',
    description: 'Customer inquiries from estimator',
    icon: Users,
    glow: 'cyan',
  },
  {
    label: 'Custom Pricing',
    value: 'Active',
    description: 'Company cost per kW settings',
    icon: Settings,
    glow: 'amber',
  },
  {
    label: 'Power Flow Tool',
    value: 'Ready',
    description: 'Hybrid Power Flow Simulation preview',
    icon: Activity,
    glow: 'green',
  },
];

const companySettings = [
  'Company logo and brand colors',
  'Custom cost per kW assumptions',
  'Lead capture contact destination',
  'Subscription or white-label access',
];

export function SubscriberDashboardPreview() {
  return (
    <section className="relative bg-dark-900 py-24 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Building2 className="h-4 w-4 text-eco-cyan" />
            <span className="text-xs text-gray-400">Subscriber Dashboard Preview</span>
          </div>

          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Subscriber{' '}
            <span className="bg-gradient-to-r from-eco-green to-eco-cyan bg-clip-text text-transparent">
              Business Workspace
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-400">
            Future subscriber access will let solar installers and distributors use
            EcoStep as their company estimator, lead capture tool, and sales support system.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {subscriberStats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard
                glow={item.glow as 'green' | 'cyan' | 'amber'}
                className="h-full p-5 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                  <item.icon className="h-6 w-6 text-eco-cyan" />
                </div>

                <div className="text-2xl font-bold text-white">{item.value}</div>
                <div className="mt-1 text-sm font-semibold text-gray-300">
                  {item.label}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-gray-500">
                  {item.description}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <GlassCard glow="green" className="p-6">
            <h3 className="text-2xl font-bold text-white">Company Settings Preview</h3>
            <p className="mt-2 text-sm text-gray-400">
              Subscriber accounts can later include company-specific configuration for
              pricing, branding, and customer inquiries.
            </p>

            <div className="mt-6 space-y-3">
              {companySettings.map((setting) => (
                <div
                  key={setting}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-gray-400"
                >
                  <Settings className="h-4 w-4 text-eco-green" />
                  <span>{setting}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard glow="cyan" className="p-6">
            <h3 className="text-2xl font-bold text-white">Subscriber Tools</h3>
            <p className="mt-2 text-sm text-gray-400">
              EcoStep can become a practical daily sales tool for installers who need
              faster estimates and cleaner customer follow-up.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white">
                Included in future subscriber access:
              </div>

              <div className="mt-4 space-y-3 text-sm text-gray-400">
                <div>• Appliance-based solar estimate workflow</div>
                <div>• Hybrid Power Flow Simulation</div>
                <div>• Customer lead capture and follow-up</div>
                <div>• Custom report and quote-ready summaries</div>
              </div>
            </div>

            <a
              href="#lead-form"
              onClick={() => {
                localStorage.setItem('ecostep_request_type', 'Subscription Version');

                window.dispatchEvent(
                  new CustomEvent('ecostep-request-type', {
                    detail: 'Subscription Version',
                  })
                );
              }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan px-4 py-3 text-sm font-semibold text-dark-900 transition-transform hover:scale-105"
            >
              Request Subscription Version
              <ArrowRight className="h-4 w-4" />
            </a>
          </GlassCard>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Subscriber dashboard is a visual preview only. Real protected access will be connected later using Supabase Auth.
        </div>
      </div>
    </section>
  );
}
