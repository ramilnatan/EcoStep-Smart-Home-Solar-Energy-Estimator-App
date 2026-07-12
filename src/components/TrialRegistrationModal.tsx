import { GlassCard } from './ui/GlassCard';

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
      <GlassCard className="w-full max-w-3xl p-8">
        <h2 className="text-3xl font-bold text-white text-center">
          🚀 Start Your Free Trial
        </h2>

        <p className="mt-3 text-center text-gray-400">
          Experience the complete EcoStep platform free for 7 days.
        </p>
        <button
         onClick={onClose}
          className="mt-6 w-full rounded-xl bg-gray-700 py-3 text-white hover:bg-gray-600"
        >
          Close
         </button>

        {/* Trial Registration Form will go here */}

      </GlassCard>
    </div>
  );
}
