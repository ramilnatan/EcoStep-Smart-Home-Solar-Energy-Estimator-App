import { motion } from 'framer-motion';
import { BarChart3, Crown, Users, Clock, ArrowRight } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

const stats = [
  {
    label: 'New Leads',
    value: '24',
    description: 'Home quote and company inquiries',
    icon: Users,
    glow: 'green',
  },
  {
    label: 'Subscription Requests',
    value: '8',
    description: 'Installers interested in monthly access',
    icon: BarChart3,
    glow: 'cyan',
  },
  {
    label: 'White-Label Requests',
    value: '5',
    description: 'Companies requesting branded setup',
    icon: Crown,
    glow: 'amber',
  },
  {
    label: 'Active Trials',
    value: '3',
    description: 'Future 7-day branded previews',
    icon: Clock,
    glow: 'green',
  },
];

const requests = [
  {
    name: 'ABC Solar Solutions',
    type: 'Full White-Label Version',
    status: 'Priority',
  },
  {
    name: 'GreenRoof Installer',
    type: 'Subscription Version',
    status: 'Follow-up',
  },
  {
    name: 'Homeowner Inquiry',
    type: 'Home Solar Quote',
    status: 'New',
  },
];

export function AdminDashboardPreview() {
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
            <BarChart3 className="h-4 w-4 text-eco-green" />
            <span className="text-xs text-gray-400">Admin Dashboard Preview</span>
          </div>

          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Manage EcoStep{' '}
            <span className="bg-gradient-to-r from-eco-green to-eco-cyan bg-clip-text text-transparent">
              Business Requests
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-400">
            Future admin access will help manage home quote leads, subscription
            inquiries, white-label requests, and trial activations from one place.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
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
                  <item.icon className="h-6 w-6 text-eco-green" />
                </div>

                <div className="text-3xl font-bold text-white">{item.value}</div>
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

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-8"
        >
          <GlassCard glow="cyan" className="p-6">
            <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white">Recent Requests</h3>
                <p className="mt-1 text-sm text-gray-400">
                  Sample admin view for future EcoStep lead management.
                </p>
              </div>

              <div className="inline-flex rounded-full border border-eco-amber/20 bg-eco-amber/10 px-3 py-1 text-xs text-eco-amber">
                Preview UI only
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {requests.map((request) => (
                <div
                  key={`${request.name}-${request.type}`}
                  className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="font-semibold text-white">{request.name}</div>
                    <div className="mt-1 text-sm text-gray-400">{request.type}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-300">
                      {request.status}
                    </span>
                    <ArrowRight className="h-4 w-4 text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Admin dashboard is a visual preview only. Real protected access will be connected later using Supabase Auth.
        </div>
      </div>
    </section>
  );
}
