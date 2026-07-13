import { GlassCard } from './ui/GlassCard';
import { X } from 'lucide-react';

type TrialRegistrationModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function TrialRegistrationModal({
  isOpen,
  onClose,
}: TrialRegistrationModalProps) {
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
    placeholder="Company Name"
    className="rounded-xl border border-white/10 bg-dark-700 p-4 text-white"
  />

  <input
    type="text"
    placeholder="Full Name"
    className="rounded-xl border border-white/10 bg-dark-700 p-4 text-white"
  />

  <input
    type="email"
    placeholder="Business Email"
    className="rounded-xl border border-white/10 bg-dark-700 p-4 text-white"
  />

  <input
    type="password"
    placeholder="Password"
    className="rounded-xl border border-white/10 bg-dark-700 p-4 text-white"
  />

  <input
    type="text"
    placeholder="Phone Number"
    className="rounded-xl border border-white/10 bg-dark-700 p-4 text-white"
  />

  <input
    type="text"
    placeholder="Country"
    className="rounded-xl border border-white/10 bg-dark-700 p-4 text-white"
  />

</div>

<button
  className="mt-8 w-full rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan py-4 font-semibold text-black"
>
  🚀 Create Free Trial
  
</button>

✔ No credit card required
✔ One trial per company
✔ Automatically expires after 7 days
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
