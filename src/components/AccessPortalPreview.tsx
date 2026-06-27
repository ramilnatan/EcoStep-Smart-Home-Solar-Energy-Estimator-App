import { motion } from 'framer-motion';
import { Lock, ShieldCheck, Users, ArrowRight, Settings, Building2 } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export function AccessPortalPreview() {
  const handleRequestAccess = (requestType: string) => {
    localStorage.setItem('ecostep_request_type', requestType);

    window.dispatchEvent(
      new CustomEvent('ecostep-request-type', {
        detail: requestType,
      })
    );
  };

  return (
    <section className="relative bg-dark-900 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <Lock className="h-4 w-4 text-eco-green" />
            <span className="text-xs text-gray-400">Access Portal Preview</span>
          </div>

          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Admin & Subscriber{' '}
            <span className="bg-gradient-to-r from-eco-green to-eco-cyan bg-clip-text text-transparent">
              Login Preview
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-400">
            EcoStep is prepared for future protected access, including admin tools
            for the owner and subscriber access for solar companies.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard
              glow="green"
              className="h-full p-6 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-eco-green/10">
                <ShieldCheck className="h-7 w-7 text-eco-green" />
              </div>

              <h3 className="text-2xl font-bold text-white">Admin Login</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                For the EcoStep owner to manage leads, subscribers, trial access,
                pricing settings, and white-label client versions.
              </p>

              <div className="mt-6 space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-eco-green" />
                  <span>View customer and company inquiries</span>
                </div>
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-eco-green" />
                  <span>Manage subscription and white-label requests</span>
                </div>
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-eco-green" />
                  <span>Prepare client-branded EcoStep versions</span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
                Real admin authentication will be added in a future phase using
                Supabase Auth and protected roles.
              </div>

              <button
                type="button"
                disabled
                className="mt-6 w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-gray-500"
              >
                Admin Login Coming Soon
              </button>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard
              glow="cyan"
              className="h-full p-6 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-eco-cyan/10">
                <Building2 className="h-7 w-7 text-eco-cyan" />
              </div>

              <h3 className="text-2xl font-bold text-white">Subscriber Login</h3>
              <p className="mt-3 text-sm leading-relaxed text-gray-400">
                For solar installers and distributors who subscribe to EcoStep as
                their business estimator and lead capture tool.
              </p>

              <div className="mt-6 space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-eco-cyan" />
                  <span>Use company-specific pricing settings</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-eco-cyan" />
                  <span>Receive customer inquiries from their own estimator</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-eco-cyan" />
                  <span>Access subscription or white-label business tools</span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
                Subscriber login will be activated after the public demo and
                business offer are finalized.
              </div>

              <a
                href="#lead-form"
                onClick={() => handleRequestAccess('Subscription Version')}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan px-4 py-3 text-sm font-semibold text-dark-900 transition-transform hover:scale-105"
              >
                Request Subscriber Access
                <ArrowRight className="h-4 w-4" />
              </a>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
