import { useState } from 'react';
import { GlassCard } from './ui/GlassCard';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

type TrialRegistrationModalProps = {
  isOpen: boolean; 
  onClose: () => void;
};

export function TrialRegistrationModal({
  isOpen,
  onClose,
}: TrialRegistrationModalProps) {

  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const handleCreateTrial = async () => {
  try {
    setLoading(true);

    // 1. Create the authentication account
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    // 2. Save trial information
    const { error: insertError } = await supabase
      .from('trial_registrations')
      .insert({
        company_name: companyName,
        full_name: fullName,
        email,
        password,
        phone,
        country,
      });

    if (insertError) throw insertError;

    alert(
      '🎉 Account created successfully!\n\nPlease check your email to verify your account.'
    );

    onClose();

  } catch (err: any) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
};
       
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <GlassCard className="relative w-full max-w-3xl p-8">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
      >
          <X className="w-5 h-5" />
      </button>
        <h2 className="text-3xl font-bold text-white text-center">
          🚀 Start Your 7-Day Free Trial
        </h2>

        <p className="mt-3 text-center text-gray-400">
          Experience the complete EcoStep platform free for 7 days.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">

  <input
    type="text"
    value={companyName}
    onChange={(e) => setCompanyName(e.target.value)}
    placeholder="Company Name"
    className="rounded-xl border border-white/10 bg-dark-700 p-4 text-white"
  />

  <input
    type="text"
    value={fullName}
    onChange={(e) => setFullName(e.target.value)}
    placeholder="Full Name"
    className="rounded-xl border border-white/10 bg-dark-700 p-4 text-white"
  />

  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="Business Email"
    className="rounded-xl border border-white/10 bg-dark-700 p-4 text-white"
  />

  <input
    type="password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Password"
    className="rounded-xl border border-white/10 bg-dark-700 p-4 text-white"
  />

  <input
    type="text"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    placeholder="Phone Number"
    className="rounded-xl border border-white/10 bg-dark-700 p-4 text-white"
  />

  <input
    type="text"
    value={country}
    onChange={(e) => setCountry(e.target.value)}
    placeholder="Country"
    className="rounded-xl border border-white/10 bg-dark-700 p-4 text-white"
  />

</div>

<button
  onClick={handleCreateTrial}
  disabled={loading}
  className="mt-8 w-full rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan py-4 font-semibold text-black disabled:opacity-50"
>
  {loading ? 'Creating Trial...' : '🚀 Create Free Trial'}
</button>

<div className="mt-4 text-center text-xs text-gray-500">
  <p>✔ No credit card required</p>
  <p>✔ One trial per company</p>
  <p>✔ Automatically expires after 7 days</p>
</div>
<button
  onClick={onClose}
  className="mt-3 w-full rounded-xl border border-white/10 py-3 text-gray-300 hover:bg-white/5"
>
  Cancel
</button>

        {/* Trial Registration Form will go here */}

      </GlassCard>
    </div>
  );
}
