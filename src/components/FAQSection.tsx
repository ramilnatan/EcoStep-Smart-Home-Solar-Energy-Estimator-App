import { motion } from 'framer-motion';
import { HelpCircle, CheckCircle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

const faqs = [
  {
    question: 'Is the EcoStep public demo free to test?',
    answer:
      'Yes. The public demo lets visitors test the solar estimator with a limited appliance selection so they can preview how EcoStep works.',
  },
  {
    question: 'Why is the public demo limited to 4 appliances?',
    answer:
      'The demo limit keeps the public version useful for testing while keeping unlimited appliance selections for subscription and white-label versions.',
  },
  {
    question: 'What is the Subscription Version?',
    answer:
      'The Subscription Version is intended for solar installers and distributors who want monthly access to EcoStep as a business sales and lead capture tool.',
  },
  {
    question: 'What is the Full White-Label Version?',
    answer:
      'The Full White-Label Version is for solar companies that want EcoStep customized with their own logo, colors, contact details, reports, and customer lead flow.',
  },
  {
    question: 'Are the login and dashboard sections already active?',
    answer:
      'Not yet. The login, admin dashboard, and subscriber dashboard are preview UI sections. Real protected access can be added later using Supabase Auth.',
  },
  {
    question: 'Are EcoStep estimates final engineering designs?',
    answer:
      'No. EcoStep estimates are planning previews only. Final solar design, protection, wiring, roof layout, and equipment compatibility must be verified by a qualified installer or engineer.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="relative bg-dark-900 py-24 scroll-mt-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
            <HelpCircle className="h-4 w-4 text-eco-green" />
            <span className="text-xs text-gray-400">EcoStep FAQ</span>
          </div>

          <h2 className="text-4xl font-bold text-white sm:text-5xl">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-eco-green to-eco-cyan bg-clip-text text-transparent">
              Questions
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-400">
            Clear answers about the public demo, subscription version, white-label
            setup, preview features, and estimate limitations.
          </p>
        </motion.div>

        <div className="mt-12 space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={faq.question}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.06 }}
            >
              <GlassCard
                glow={index % 3 === 0 ? 'green' : index % 3 === 1 ? 'cyan' : 'amber'}
                className="p-5 transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01]"
              >
                <div className="flex gap-4">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5">
                    <CheckCircle className="h-5 w-5 text-eco-green" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {faq.question}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-gray-400">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
