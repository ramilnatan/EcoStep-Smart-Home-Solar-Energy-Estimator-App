import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  ShieldCheck,
  Users,
  ArrowRight,
  Settings,
  Building2,
  X,
  Mail,
  KeyRound,
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { supabase } from '../lib/supabase';

type LoginPortal = 'admin' | 'subscriber' | null;

export function AccessPortalPreview() {
  const [activePortal, setActivePortal] = useState<LoginPortal>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [adminSuccess, setAdminSuccess] = useState('');
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const handleRequestAccess = (requestType: string) => {
    localStorage.setItem('ecostep_request_type', requestType);

    window.dispatchEvent(
      new CustomEvent('ecostep-request-type', {
        detail: requestType,
      })
    );
  };

  const handleAdminLogin = async () => {
    setAdminError('');
    setAdminSuccess('');
  
    if (!adminEmail.trim() || !adminPassword) {
      setAdminError('Please enter your admin email and password.');
      return;
    }
  
    setIsAdminLoading(true);
  
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPassword,
      });
  
      if (error || !data.user) {
        setAdminError(error?.message || 'Unable to sign in.');
        return;
      }
  
      const { data: adminRecord, error: roleError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', data.user.id)
        .eq('role', 'admin')
        .maybeSingle();
  
      if (roleError || !adminRecord) {
        await supabase.auth.signOut();
        setAdminError('This account does not have EcoStep admin access.');
        return;
      }
  
      setAdminSuccess('Admin login successful. Your secure session is active.');
      setAdminPassword('');
    } catch (error) {
      console.error('[Admin Login] Unexpected error:', error);
      setAdminError('Something went wrong while signing in.');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const portalContent = {
    admin: {
      title: 'Admin Login',
      badge: 'Owner Access',
      description:
        'Future protected access for managing EcoStep leads, subscribers, pricing settings, and white-label client versions.',
      button: 'Admin Access Coming Soon',
      glow: 'green',
    },
    subscriber: {
      title: 'Subscriber Login',
      badge: 'Company Access',
      description:
        'Future protected access for solar installers and distributors using EcoStep as their business estimator and lead capture tool.',
      button: 'Subscriber Access Coming Soon',
      glow: 'cyan',
    },
  } as const;

  const selectedPortal = activePortal ? portalContent[activePortal] : null;

  return (
    <section id="access-portal" className="relative bg-dark-900 py-24 scroll-mt-24">
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
                  Secure admin authentication is now connected using Supabase Auth and
                  the EcoStep admin role table.
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
  <button
    type="button"
    onClick={() => setActivePortal('admin')}
    className="rounded-xl border border-eco-green/30 bg-eco-green/10 px-4 py-3 text-sm font-semibold text-eco-green transition-all hover:bg-eco-green hover:text-dark-900"
  >
    Admin Login
  </button>

  <a
    href="#admin-dashboard-preview"
    className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
  >
    Dashboard Preview
    <ArrowRight className="h-4 w-4" />
  </a>
</div>


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

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setActivePortal('subscriber')}
                  className="rounded-xl border border-eco-cyan/30 bg-eco-cyan/10 px-4 py-3 text-sm font-semibold text-eco-cyan transition-all hover:bg-eco-cyan hover:text-dark-900"
                >
                  Subscriber Login Preview
                </button>

                <a
                  href="#subscriber-dashboard-preview"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                  Dashboard Preview
                  <ArrowRight className="h-4 w-4" />
                </a>

                <a
                  href="#lead-form"
                  onClick={() => handleRequestAccess('Subscription Version')}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan px-4 py-3 text-sm font-semibold text-dark-900 transition-transform hover:scale-105"
                >
                  Request Access
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {selectedPortal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-dark-800 p-6 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setActivePortal(null)}
              className="absolute right-4 top-4 rounded-full bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close login preview"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5">
              {activePortal === 'admin' ? (
                <ShieldCheck className="h-7 w-7 text-eco-green" />
              ) : (
                <Building2 className="h-7 w-7 text-eco-cyan" />
              )}
            </div>

            <div className="mb-2 inline-flex rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
              {selectedPortal.badge}
            </div>

            <h3 className="text-2xl font-bold text-white">
              {selectedPortal.title}
            </h3>

            <p className="mt-3 text-sm leading-relaxed text-gray-400">
              {selectedPortal.description}
            </p>

            <div className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-300">
                  Email Address
                </span>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <input
                    type="email"
                    placeholder={
                      activePortal === 'admin'
                        ? 'Enter your admin email'
                        : 'company@example.com'
                    }
                    value={activePortal === 'admin' ? adminEmail : ''}
                      onChange={(e) => {
                          if (activePortal === 'admin') {
                          setAdminEmail(e.target.value);
                          setAdminError('');
                          setAdminSuccess('');
                              }
                           }}
                    disabled={activePortal !== 'admin'}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-300">
                  Password
                </span>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <KeyRound className="h-4 w-4 text-gray-500" />
                  <input
  type="password"
  placeholder="••••••••"
  value={activePortal === 'admin' ? adminPassword : ''}
  onChange={(e) => {
    if (activePortal === 'admin') {
      setAdminPassword(e.target.value);
      setAdminError('');
      setAdminSuccess('');
    }
  }}
  disabled={activePortal !== 'admin'}
  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-gray-600 disabled:cursor-not-allowed"
/>
                </div>
              </label>
            </div>

            {activePortal === 'admin' ? (
              <>
                <div className="mt-4 rounded-2xl border border-eco-green/20 bg-eco-green/10 p-3 text-sm text-gray-300">
                  Secure admin login using Supabase Auth and EcoStep role verification.
                </div>
            
                {adminError && (
                  <div className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    {adminError}
                  </div>
                )}
            
                {adminSuccess && (
                  <div className="mt-3 rounded-xl border border-eco-green/30 bg-eco-green/10 p-3 text-sm text-eco-green">
                    {adminSuccess}
                  </div>
                )}
            
                {!adminSuccess ? (
                  <button
                    type="button"
                    onClick={handleAdminLogin}
                    disabled={isAdminLoading}
                    className="mt-6 w-full rounded-xl bg-eco-green px-4 py-3 text-sm font-semibold text-dark-900 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAdminLoading ? 'Signing In...' : 'Sign In as Admin'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setActivePortal(null);
            
                      setTimeout(() => {
                        document
                          .getElementById('admin-dashboard-preview')
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan px-4 py-3 text-sm font-semibold text-dark-900 transition-all hover:scale-[1.02]"
                  >
                    Continue to Admin Dashboard
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="mt-4 rounded-2xl border border-eco-amber/20 bg-eco-amber/10 p-3 text-sm text-eco-amber">
                  Subscriber login is still preview-only. Real subscriber accounts will be
                  added after the admin system is completed.
                </div>
            
                <button
                  type="button"
                  disabled
                  className="mt-6 w-full cursor-not-allowed rounded-xl bg-white/10 px-4 py-3 text-sm font-semibold text-gray-500"
                >
                  Subscriber Access Coming Soon
                </button>
              </>
            )}

            {activePortal === 'subscriber' && (
              <a
                href="#lead-form"
                onClick={() => {
                  handleRequestAccess('Subscription Version');
                  setActivePortal(null);
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-eco-cyan/30 px-4 py-3 text-sm font-semibold text-eco-cyan transition-colors hover:bg-eco-cyan hover:text-dark-900"
              >
                Request Subscriber Access
                <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </motion.div>
        </div>
      )}
    </section>
  );
}
