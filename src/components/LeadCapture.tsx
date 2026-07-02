import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { User, Mail, Phone, MessageSquare, Check, Loader2, X } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';
import { Appliance, CalculationResult, LeadFormData } from '../types';
import { countryCodes } from '../data/appliances';
import { formatCurrency } from '../data/currencies';

type LeadCaptureProps = {
  monthlyBill: number;
  selectedAppliances: Appliance[];
  results: CalculationResult;
  currency: string;
  costPerKw: number;
  batteryCostPerKwh: number;
};

export function LeadCapture({
  monthlyBill,
  selectedAppliances,
  results,
  currency,
  costPerKw,
  batteryCostPerKwh,
}: LeadCaptureProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    fullName: '',
    email: '',
    phone: '',
    countryCode: '+1',
    currency: currency,
    notes: '',
  });
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});
  const estimatedSolarSystemCost = results.systemSizeKW * costPerKw;
  const estimatedBatteryCost = results.batteryCapacityKWh * batteryCostPerKwh;
  const estimatedSystemCost = estimatedSolarSystemCost + estimatedBatteryCost;

  const annualSavings = results.monthlySavings * 12;
  const expectedPaybackYears =
  annualSavings > 0 ? estimatedSystemCost / annualSavings : 0;
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<LeadFormData> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{7,15}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    const payload = {
      full_name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      country_code: formData.countryCode,
      currency: currency,
      monthly_bill: monthlyBill,
      selected_appliances: selectedAppliances,
      estimated_kw: results.systemSizeKW,
      estimated_battery: results.batteryCapacityKWh,
      daily_consumption: results.dailyConsumptionKWh,
      backup_runtime: results.backupRuntimeHours,
      monthly_savings: results.monthlySavings,
      roi_years: expectedPaybackYears,
      grid_independence: results.gridIndependencePercent,
      notes: formData.notes,
      status: 'new',
    };

    console.log('[LeadCapture] Selected currency:', currency);
    console.log('[LeadCapture] Monthly savings displayed (UI):', results.monthlySavings);
    console.log('[LeadCapture] Monthly savings saved to Supabase:', payload.monthly_savings);
    console.log('[LeadCapture] Inserting into table: leads');
    console.log('[LeadCapture] Payload:', payload);
    console.log('[LeadCapture] Solar/Inverter cost:', estimatedSolarSystemCost);
    console.log('[LeadCapture] Battery bank cost:', estimatedBatteryCost);
    console.log('[LeadCapture] Total hybrid system cost:', estimatedSystemCost);
    console.log('[LeadCapture] Hybrid ROI years:', expectedPaybackYears);

    try {
      const { error } = await supabase.from('leads').insert(payload);

      console.log('[LeadCapture] Supabase response error:', error);

      if (!error) {
        setShowModal(true);
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          countryCode: '+1',
          currency: currency,
          notes: '',
        });
      } else {
        console.error('[LeadCapture] Insert failed:', error);
        setErrors({ notes: `DB Error [${error.code ?? 'unknown'}]: ${error.message}` });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Use the same rounded savings value shown in the estimator result cards
const formattedSavings = formatCurrency(results.monthlySavings, currency);

  return (
    <section id="contact" className="py-24 bg-dark-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Get Your Custom{' '}
            <span className="text-eco-amber">System Blueprint</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Receive a detailed ROI report and personalized system recommendation from our energy experts.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <GlassCard glow="amber" className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hybrid estimate summary */}
<div className="mb-8 border-b border-white/10 pb-8">
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
    <div className="rounded-xl bg-white/5 p-4 text-center">
      <div className="text-xl font-bold text-eco-green">
        {results.systemSizeKW} kW
      </div>
      <div className="mt-1 text-xs text-gray-500">
        Solar System
      </div>
    </div>

    <div className="rounded-xl bg-white/5 p-4 text-center">
      <div className="text-xl font-bold text-eco-cyan">
        {results.batteryCapacityKWh} kWh
      </div>
      <div className="mt-1 text-xs text-gray-500">
        Battery Capacity
      </div>
    </div>

    <div className="rounded-xl bg-white/5 p-4 text-center">
      <div className="text-xl font-bold text-eco-amber">
        {expectedPaybackYears.toFixed(1)} yrs
      </div>
      <div className="mt-1 text-xs text-gray-500">
        Hybrid ROI
      </div>
    </div>

    <div className="rounded-xl bg-white/5 p-4 text-center">
      <div className="text-xl font-bold text-eco-cyan">
        {formattedSavings}
      </div>
      <div className="mt-1 text-xs text-gray-500">
        Optimal Savings
      </div>
    </div>

    <div className="col-span-2 rounded-xl bg-white/5 p-4 text-center sm:col-span-1">
      <div className="text-xl font-bold text-eco-green">
        {results.gridIndependencePercent}%
      </div>
      <div className="mt-1 text-xs text-gray-500">
        Grid Independence
      </div>
    </div>
  </div>

  <div className="mt-4 rounded-xl border border-eco-amber/20 bg-eco-amber/10 p-3 text-center">
    <p className="text-xs leading-relaxed text-gray-400">
      Estimate based on optimal peak summer sun, minimal rain, and a properly
      sized hybrid solar system with battery backup.
    </p>
  </div>
</div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  icon={<User className="w-4 h-4" />}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  error={errors.fullName}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  icon={<Mail className="w-4 h-4" />}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                />
              </div>

              <div className="flex gap-4">
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Country Code
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-eco-amber/50"
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code} className="bg-dark-800">
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="555-123-4567"
                    icon={<Phone className="w-4 h-4" />}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    error={errors.phone}
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Notes / Special Requirements
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-eco-amber/50 focus:ring-2 focus:ring-eco-amber/20 transition-all duration-300 min-h-[100px] resize-none"
                  placeholder="Any specific requirements or questions?"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
                <MessageSquare className="absolute right-4 top-10 w-4 h-4 text-gray-500" />
              </div>

              {errors.notes && (
                <p className="text-sm text-red-400">{errors.notes}</p>
              )}

              <div className="pt-4">
                <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Get My Custom Blueprint
                    </>
                  )}
                </Button>
              </div>
            </form>
          </GlassCard>
        </motion.div>

        {/* Success Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <GlassCard glow="green" className="p-8 text-center">
                  <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                    onClick={() => setShowModal(false)}
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-eco-green/20 flex items-center justify-center"
                  >
                    <Check className="w-10 h-10 text-eco-green" />
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-2">
                    Request Submitted!
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Our energy experts will contact you within 24 hours with your personalized solar system blueprint and ROI report.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-white/5 rounded-xl">
                      <div className="text-sm text-gray-500">System Size</div>
                      <div className="text-lg font-bold text-eco-green">
                        {results.systemSizeKW}kW
                      </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl">
                      <div className="text-sm text-gray-500">Est. Savings</div>
                      <div className="text-lg font-bold text-eco-cyan">
                        {formattedSavings}/mo
                      </div>
                    </div>
                  </div>

                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Close
                  </Button>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
