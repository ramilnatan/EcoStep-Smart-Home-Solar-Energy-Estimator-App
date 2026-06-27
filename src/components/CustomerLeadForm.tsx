import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Check, Loader2, X } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { supabase } from '../lib/supabase';

type ToastType = 'success' | 'error';

interface ToastState {
  show: boolean;
  type: ToastType;
  message: string;
}

export function CustomerLeadForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    location: '',
    requestType: 'Home Solar Quote',
  });
  useEffect(() => {
    const applyStoredRequestType = () => {
      const storedRequestType = localStorage.getItem('ecostep_request_type');
  
      if (storedRequestType) {
        setFormData((prev) => ({
          ...prev,
          requestType: storedRequestType,
        }));
  
        localStorage.removeItem('ecostep_request_type');
      }
    };

    
    const handleRequestTypeEvent = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
  
      setFormData((prev) => ({
        ...prev,
        requestType: customEvent.detail,
      }));
    };
  
    applyStoredRequestType();
  
    window.addEventListener('ecostep-request-type', handleRequestTypeEvent);
  
    return () => {
      window.removeEventListener('ecostep-request-type', handleRequestTypeEvent);
    };
  }, []);

  const requestTypeDetails = {
    'Home Solar Quote': {
      title: 'For homeowners',
      description:
        'Request a solar estimate based on your monthly bill, selected appliances, panel setup, battery backup, and expected ROI.',
    },
    'Subscription Version': {
      title: 'For solar installers and distributors',
      description:
        'Request monthly access to EcoStep as a business sales tool with subscriber access, custom pricing, lead workflow, and Hybrid Power Flow Simulation.',
    },
    'Full White-Label Version': {
      title: 'For solar companies',
      description:
        'Request a fully branded EcoStep version with your company logo, colors, contact details, lead capture, custom reports, and Hybrid Power Flow Simulation.',
    },
  } as const;
  
  const selectedRequestTypeDetail =
    requestTypeDetails[formData.requestType as keyof typeof requestTypeDetails];

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    type: 'success',
    message: '',
  });

  const showToast = (type: ToastType, message: string) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{7,15}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number (7-15 digits)';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
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
      phone_number: formData.phoneNumber,
      location: formData.location,
      request_type: formData.requestType,
    };

    console.log('[CustomerLeadForm] Inserting into table: customers');
    console.log('[CustomerLeadForm] Payload:', payload);

    try {
      const { error } = await supabase.from('customers').insert(payload);

      console.log('[CustomerLeadForm] Supabase response error:', error);

      if (!error) {
        showToast('success', 'Your request has been submitted successfully. We will contact you soon!');
        setFormData({
          fullName: '',
          email: '',
          phoneNumber: '',
          location: '',
          requestType: 'Home Solar Quote',
        });
        setErrors({});
      } else {
        console.error('[CustomerLeadForm] Insert failed:', error);
        showToast('error', `DB Error [${error.code ?? 'unknown'}]: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <>
      <section id="lead-form" className="py-24 bg-dark-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              Request Your{' '}
              <span className="text-eco-green">Solar Quote</span>
            </h2>
             <p className="text-lg text-gray-400">
                Fill out the form below to request a home solar estimate, subscription version, or full white-label EcoStep version for your company.
             </p>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard glow="green" className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">

              <div>
  <label className="block text-sm font-medium text-gray-300 mb-2">
    What do you need?
  </label>

  <select
    value={formData.requestType}
    onChange={(e) => handleInputChange('requestType', e.target.value)}
    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-gray-200 outline-none focus:border-eco-green focus:ring-1 focus:ring-eco-green"
  >
    <option value="Home Solar Quote">Home Solar Quote</option>
    <option value="Subscription Version">Subscription Version</option>
    <option value="Full White-Label Version">Full White-Label Version</option>
  </select>

  <p className="mt-2 text-xs text-gray-500">
  Choose whether you need a home solar estimate, monthly subscription version, or full white-label EcoStep version.
  </p>

  {selectedRequestTypeDetail && (
  <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-4">
    <div className="text-sm font-semibold text-white">
      {selectedRequestTypeDetail.title}
    </div>
    <p className="mt-1 text-xs leading-relaxed text-gray-400">
      {selectedRequestTypeDetail.description}
    </p>
  </div>
)}

</div>

                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  icon={<User className="w-4 h-4" />}
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  error={errors.fullName}
                />

                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  icon={<Mail className="w-4 h-4" />}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                />

                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="555-123-4567"
                  icon={<Phone className="w-4 h-4" />}
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  error={errors.phoneNumber}
                />

                <Input
                  label="Location"
                  type="text"
                  placeholder="City, State"
                  icon={<MapPin className="w-4 h-4" />}
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  error={errors.location}
                />

                <div className="pt-4">
                  <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        Request Quote / Full Access
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-eco-green text-black'
                : 'bg-red-500 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <Check className="w-5 h-5" />
            ) : (
              <X className="w-5 h-5" />
            )}
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
