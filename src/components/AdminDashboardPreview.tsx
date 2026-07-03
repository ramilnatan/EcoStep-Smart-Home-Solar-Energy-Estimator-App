import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Clock,
  ArrowRight,
  Lock,
  LogOut,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Zap,
} from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { supabase } from '../lib/supabase';

type AdminDashboardPreviewProps = {
  isAdminAuthenticated: boolean;
  isAdminChecking: boolean;
  adminEmail: string;
  onLogout: () => void;
};

type NumericValue = number | string | null;

type LeadRecord = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  country_code: string | null;
  monthly_bill: NumericValue;
  selected_appliances: unknown;
  estimated_kw: NumericValue;
  estimated_battery: NumericValue;
  daily_consumption: NumericValue;
  backup_runtime: NumericValue;
  monthly_savings: NumericValue;
  roi_years: NumericValue;
  grid_independence: NumericValue;
  notes: string | null;
  status: string | null;
  created_at: string | null;
  currency: string | null;
};

const toNumber = (value: NumericValue) => {
  const parsedValue =
    typeof value === 'number'
      ? value
      : Number(value ?? 0);

  return Number.isFinite(parsedValue) ? parsedValue : 0;
};

const formatLeadDate = (createdAt: string | null) => {
  if (!createdAt) {
    return 'Unknown date';
  }

  const parsedDate = new Date(createdAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(parsedDate);
};

const formatMoney = (
  value: NumericValue,
  currency: string | null
) => {
  const currencyCode = currency || 'USD';

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(toNumber(value));
  } catch {
    return `${currencyCode} ${toNumber(value).toLocaleString()}`;
  }
};

const formatStatus = (status: string | null) => {
  const normalizedStatus = (status || 'new')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ');

  return normalizedStatus
    .split(' ')
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ');
};

const getStatusClasses = (status: string | null) => {
  switch ((status || 'new').toLowerCase()) {
    case 'contacted':
      return 'border-eco-cyan/30 bg-eco-cyan/10 text-eco-cyan';

    case 'qualified':
      return 'border-eco-amber/30 bg-eco-amber/10 text-eco-amber';

    case 'closed':
      return 'border-white/10 bg-white/5 text-gray-400';

    case 'archived':
      return 'border-white/10 bg-white/5 text-gray-500';

    case 'new':
    default:
      return 'border-eco-green/30 bg-eco-green/10 text-eco-green';
  }
};

export function AdminDashboardPreview({
  isAdminAuthenticated,
  isAdminChecking,
  adminEmail,
  onLogout,
}: AdminDashboardPreviewProps) {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [isLeadsLoading, setIsLeadsLoading] =
    useState(false);
  const [leadsError, setLeadsError] = useState('');

  const loadLeads = useCallback(async () => {
    if (!isAdminAuthenticated) {
      setLeads([]);
      setLeadsError('');
      return;
    }

    setIsLeadsLoading(true);
    setLeadsError('');

    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id,
          full_name,
          email,
          phone,
          country_code,
          monthly_bill,
          selected_appliances,
          estimated_kw,
          estimated_battery,
          daily_consumption,
          backup_runtime,
          monthly_savings,
          roi_years,
          grid_independence,
          notes,
          status,
          created_at,
          currency
        `)
        .order('created_at', {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setLeads((data ?? []) as LeadRecord[]);
    } catch (error) {
      console.error(
        '[Admin Dashboard] Unable to load leads:',
        error
      );

      setLeadsError(
        'EcoStep could not load the protected lead records. Please try again.'
      );
    } finally {
      setIsLeadsLoading(false);
    }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    if (isAdminChecking) {
      return;
    }

    if (!isAdminAuthenticated) {
      setLeads([]);
      setLeadsError('');
      return;
    }

    void loadLeads();
  }, [
    isAdminAuthenticated,
    isAdminChecking,
    loadLeads,
  ]);

  const stats = useMemo(() => {
    const newLeadCount = leads.filter(
      (lead) =>
        (lead.status || 'new').toLowerCase() === 'new'
    ).length;

    const systemSizes = leads
      .map((lead) => toNumber(lead.estimated_kw))
      .filter((value) => value > 0);

    const roiValues = leads
      .map((lead) => toNumber(lead.roi_years))
      .filter((value) => value > 0);

    const averageSystemSize =
      systemSizes.length > 0
        ? systemSizes.reduce(
            (total, value) => total + value,
            0
          ) / systemSizes.length
        : 0;

    const averageRoi =
      roiValues.length > 0
        ? roiValues.reduce(
            (total, value) => total + value,
            0
          ) / roiValues.length
        : 0;

    return [
      {
        label: 'Total Leads',
        value: leads.length.toString(),
        description:
          'Protected blueprint submissions stored in Supabase',
        icon: Users,
        glow: 'green',
      },
      {
        label: 'New Leads',
        value: newLeadCount.toString(),
        description:
          'New submissions awaiting first follow-up',
        icon: BarChart3,
        glow: 'cyan',
      },
      {
        label: 'Average System Size',
        value: `${averageSystemSize.toFixed(1)} kW`,
        description:
          'Average recommended solar system size',
        icon: Zap,
        glow: 'amber',
      },
      {
        label: 'Average ROI',
        value: `${averageRoi.toFixed(1)} yrs`,
        description:
          'Average estimated customer payback period',
        icon: Clock,
        glow: 'green',
      },
    ];
  }, [leads]);

  if (isAdminChecking) {
    return (
      <section
        id="admin-dashboard-preview"
        className="relative scroll-mt-24 bg-dark-900 py-24"
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <GlassCard glow="green" className="p-8">
            <ShieldCheck className="mx-auto h-12 w-12 text-eco-green" />

            <h2 className="mt-5 text-3xl font-bold text-white">
              Checking Admin Session
            </h2>

            <p className="mt-3 text-gray-400">
              EcoStep is verifying your secure Supabase
              session and admin role.
            </p>
          </GlassCard>
        </div>
      </section>
    );
  }

  if (!isAdminAuthenticated) {
    return (
      <section
        id="admin-dashboard-preview"
        className="relative scroll-mt-24 bg-dark-900 py-24"
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <GlassCard glow="amber" className="p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-eco-amber/10">
              <Lock className="h-8 w-8 text-eco-amber" />
            </div>

            <h2 className="mt-6 text-3xl font-bold text-white">
              Admin Access Required
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-gray-400">
              Sign in with a verified EcoStep administrator
              account to access business requests and admin
              tools.
            </p>

            <a
              href="#access-portal"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan px-5 py-3 text-sm font-semibold text-dark-900 transition-transform hover:scale-105"
            >
              Open Admin Login
              <ArrowRight className="h-4 w-4" />
            </a>
          </GlassCard>
        </div>
      </section>
    );
  }

  return (
    <section
      id="admin-dashboard-preview"
      className="relative scroll-mt-24 bg-dark-900 py-24"
    >
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

            <span className="text-xs text-gray-400">
              Protected Admin Dashboard
            </span>
          </div>

          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Manage EcoStep{' '}
            <span className="bg-gradient-to-r from-eco-green to-eco-cyan bg-clip-text text-transparent">
              Business Requests
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-400">
            Secure EcoStep owner access for managing
            protected solar leads and customer activity.
          </p>
        </motion.div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-eco-green/20 bg-eco-green/10 p-4 sm:flex-row">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-eco-green" />

            <div>
              <div className="text-sm font-semibold text-white">
                Secure Admin Session Active
              </div>

              <div className="text-xs text-gray-400">
                Signed in as{' '}
                {adminEmail || 'EcoStep Administrator'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadLeads()}
              disabled={isLeadsLoading}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isLeadsLoading ? 'animate-spin' : ''
                }`}
              />
              Refresh
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
              }}
            >
              <GlassCard
                glow={
                  item.glow as
                    | 'green'
                    | 'cyan'
                    | 'amber'
                }
                className="h-full p-5 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02]"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5">
                  <item.icon className="h-6 w-6 text-eco-green" />
                </div>

                <div className="text-3xl font-bold text-white">
                  {isLeadsLoading ? '—' : item.value}
                </div>

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
                <h3 className="text-2xl font-bold text-white">
                  Recent Lead Submissions
                </h3>

                <p className="mt-1 text-sm text-gray-400">
                  Live protected Supabase leads, newest
                  submissions first.
                </p>
              </div>

              <div className="inline-flex rounded-full border border-eco-green/20 bg-eco-green/10 px-3 py-1 text-xs text-eco-green">
                Live Supabase Data
              </div>
            </div>

            {isLeadsLoading && (
              <div className="mt-5 flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-sm text-gray-400">
                <RefreshCw className="h-5 w-5 animate-spin text-eco-green" />
                Loading protected EcoStep leads...
              </div>
            )}

            {!isLeadsLoading && leadsError && (
              <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-red-400" />

                  <div>
                    <div className="font-semibold text-red-400">
                      Unable to Load Leads
                    </div>

                    <p className="mt-1 text-sm text-gray-400">
                      {leadsError}
                    </p>

                    <button
                      type="button"
                      onClick={() => void loadLeads()}
                      className="mt-4 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isLeadsLoading &&
              !leadsError &&
              leads.length === 0 && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
                  <Users className="mx-auto h-10 w-10 text-gray-500" />

                  <div className="mt-4 font-semibold text-white">
                    No Lead Submissions Yet
                  </div>

                  <p className="mt-2 text-sm text-gray-400">
                    New Custom System Blueprint requests
                    will appear here automatically.
                  </p>
                </div>
              )}

            {!isLeadsLoading &&
              !leadsError &&
              leads.length > 0 && (
                <div className="mt-5 space-y-3">
                  {leads.slice(0, 5).map((lead) => {
                    const phoneNumber = [
                      lead.country_code,
                      lead.phone,
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <div
                        key={lead.id}
                        className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 lg:flex-row lg:items-center lg:justify-between"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-white">
                            {lead.full_name}
                          </div>

                          <div className="mt-1 text-sm text-gray-400">
                            {lead.email}
                          </div>

                          <div className="mt-1 text-xs text-gray-500">
                            {phoneNumber ||
                              'No phone number'}{' '}
                            •{' '}
                            {formatLeadDate(
                              lead.created_at
                            )}
                          </div>
                        </div>

                        <div className="grid gap-1 text-xs text-gray-400 sm:grid-cols-2 lg:text-right">
                          <div>
                            {toNumber(
                              lead.estimated_kw
                            ).toFixed(1)}{' '}
                            kW solar
                          </div>

                          <div>
                            {toNumber(
                              lead.estimated_battery
                            ).toFixed(1)}{' '}
                            kWh battery
                          </div>

                          <div>
                            {formatMoney(
                              lead.monthly_bill,
                              lead.currency
                            )}{' '}
                            monthly bill
                          </div>

                          <div>
                            {toNumber(
                              lead.roi_years
                            ).toFixed(1)}{' '}
                            yrs ROI
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                              lead.status
                            )}`}
                          >
                            {formatStatus(lead.status)}
                          </span>

                          <ArrowRight className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </GlassCard>
        </motion.div>

        <div className="mt-6 text-center text-xs text-gray-500">
          Showing the five newest of {leads.length}{' '}
          protected lead submissions from Supabase.
        </div>
      </div>
    </section>
  );
}
