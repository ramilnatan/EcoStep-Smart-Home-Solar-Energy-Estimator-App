import { motion } from 'framer-motion';
import { Home, Repeat, Crown, ArrowRight, CheckCircle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

const plans = [
  {
    icon: Home,
    title: 'Home Solar Quote',
    requestType: 'Home Solar Quote',
    description:
      'For homeowners who want a quick solar estimate based on their monthly bill and selected appliances.',
    highlights: [
      'Basic solar estimate',
      'Appliance-based sizing',
      'Panel and battery preview',
      'ROI payback estimate',
    ],
    glow: 'green',
    button: 'Request Home Quote',
  },
  {
    icon: Repeat,
    title: 'Subscription Version',
    requestType: 'Subscription Version',
    description:
      'For solar installers and distributors who want monthly access to EcoStep as a business sales tool.',
    highlights: [
      'Monthly business access',
      'Custom cost per kW settings',
      'Lead capture workflow',
      'Subscriber access preview',
    ],
    glow: 'cyan',
    button: 'Request Subscription',
  },
  {
    icon: Crown,
    title: 'Full White-Label Version',
    requestType: 'Full White-Label Version',
    description:
      'For companies that want EcoStep branded with their own logo, colors, contact details, and customer funnel.',
    highlights: [
      'Company logo and colors',
      'Branded estimator experience',
      'Company lead capture',
      'Full white-label setup',
    ],
    glow: 'amber',
    button: 'Request White-Label',
  },
];

export function VersionPlans() {
  const handlePlanRequest = (requestType: string) => {
    localStorage.setItem('ecostep_request_type', requestType);

    window.dispatchEvent(
      new CustomEvent('ecostep-request-type', {
        detail: requestType,
      })
    );
  };

  return (
    <section id="versions" className="relative bg-dark-900 py-24 scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Crown className="h-4 w-4 text-eco-amber" />
            <span className="text-xs text-gray-400">EcoStep Versions</span>
          </div>

          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-eco-green to-eco-cyan bg-clip-text text-transparent">
              EcoStep Version
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-400">
            Start with a home solar quote, request monthly business access, or ask
            for a full white-label version for your solar company.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <GlassCard
                glow={plan.glow as 'green' | 'cyan' | 'amber'}
                className="h-full p-6 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
                  <plan.icon className="h-7 w-7 text-eco-green" />
                </div>

                <h3 className="text-2xl font-bold text-white">{plan.title}</h3>

                <p className="mt-3 min-h-[72px] text-sm leading-relaxed text-gray-400">
                  {plan.description}
                </p>

                <div className="mt-6 space-y-3">
                  {plan.highlights.map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-gray-400">
                      <CheckCircle className="h-4 w-4 text-eco-green" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <a
                  href="#lead-form"
                  onClick={() => handlePlanRequest(plan.requestType)}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan px-4 py-3 text-sm font-semibold text-dark-900 transition-transform hover:scale-105"
                >
                  {plan.button}
                  <ArrowRight className="h-4 w-4" />
                </a>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
