import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Battery, BarChart3, FileText, ChevronUp } from 'lucide-react';
import { Hero } from './components/Hero';
import { EnergyEstimator } from './components/EnergyEstimator';
import { DemoAccessBanner } from './components/DemoAccessBanner';
import { SolarGuide } from './components/SolarGuide';
import { LeadCapture } from './components/LeadCapture';
import { CustomerLeadForm } from './components/CustomerLeadForm';
import { Appliance, CalculationResult } from './types';
import { calculateEnergyResults } from './utils/calculations';
import { FullAccessGate } from './components/FullAccessGate';

const navItems = [
  { id: 'hero', label: 'Home', icon: Sun },
  { id: 'estimator', label: 'Estimator', icon: BarChart3 },
  { id: 'resources', label: 'Resources', icon: FileText },
  { id: 'visualization', label: 'Dashboard', icon: Battery },
  { id: 'lead-form', label: 'Quote', icon: FileText },
  { id: 'footer-contact', label: 'Contact', icon: FileText },
];


function App() {
  const estimatorRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [calculationData, setCalculationData] = useState<{
    monthlyBill: number;
    selectedAppliances: Appliance[];
    results: CalculationResult;
    currency: string;
    costPerKw: number;
  }>({
    monthlyBill: 150,
    selectedAppliances: [],
    results: calculateEnergyResults(150, [], 'USD'),
    currency: 'USD',
    costPerKw: 900,
  });

  const scrollToEstimator = useCallback(() => {
    estimatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleCalculate = useCallback(
    (
      monthlyBill: number,
      selectedAppliances: Appliance[],
      results: CalculationResult,
      currency: string,
      costPerKw: number
    ) => {
      setCalculationData({ monthlyBill, selectedAppliances, results, currency, costPerKw });
    },
    []
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Track active section based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'estimator', 'resources', 'visualization', 'lead-form', 'footer-contact'];
      const scrollPosition = window.scrollY + 100;

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-x-hidden">
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-dark-900/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              className="flex items-center gap-2 cursor-pointer"
              onClick={scrollToTop}
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-eco-green to-eco-cyan flex items-center justify-center">
                <Sun className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold">
                <span className="text-white">Eco</span>
                <span className="text-eco-green">Step</span>
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id !== 'hero' ? item.id : ''}`}
                  onClick={() => {
                    if (item.id === 'hero') {
                      scrollToTop();
                    }
                  }}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                    transition-all duration-300
                    ${
                      activeSection === item.id
                        ? 'bg-eco-green/10 text-eco-green'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </a>
              ))}
            </div>

            <motion.button
              onClick={scrollToEstimator}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-eco-green to-eco-cyan rounded-xl text-black font-semibold text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </div>
        </div>
      </nav>

      <main>
        <Hero onScrollToEstimator={scrollToEstimator} />

        <DemoAccessBanner />

        <div ref={estimatorRef}>
          <EnergyEstimator onCalculate={handleCalculate} />
        </div>
  
        <SolarGuide onScrollToEstimator={scrollToEstimator} />

        <FullAccessGate />

        <CustomerLeadForm />

        {calculationData.selectedAppliances.length > 0 && (
          <LeadCapture
          monthlyBill={calculationData.monthlyBill}
          selectedAppliances={calculationData.selectedAppliances}
          results={calculationData.results}
          currency={calculationData.currency}
          costPerKw={calculationData.costPerKw}
        />
        )}


      </main>

      <footer id="footer-contact" className="py-12 bg-dark-900 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-eco-green to-eco-cyan flex items-center justify-center">
                  <Sun className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold">
                  <span className="text-white">Eco</span>
                  <span className="text-eco-green">Step</span>
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Smart home solar solutions for a sustainable future.
              </p>
              <p className="mt-3 text-sm text-gray-500">
                 Powered by <span className="text-eco-green font-semibold">Salve</span>
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#estimator" className="hover:text-eco-green transition-colors">Solar Estimator</a></li>
                <li><a href="#visualization" className="hover:text-eco-green transition-colors">Energy Dashboard</a></li>
                <li><a href="#lead-form" className="hover:text-eco-green transition-colors">Get Quote</a></li>
              </ul>
            </div>
                  
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                 <li><span className="text-gray-500">About Us</span></li>
                 <li><span className="text-gray-500">Careers</span></li>
                 <li><a href="#footer-contact" className="hover:text-eco-green transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                 <li><span className="text-gray-500">Privacy Policy</span></li>
                 <li><span className="text-gray-500">Terms of Service</span></li>
                 <li><span className="text-gray-500">Cookie Policy</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              2026 EcoStep. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
            Built for smarter solar decisions
            </p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {activeSection !== 'hero' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-eco-green/20 border border-eco-green/30 rounded-full flex items-center justify-center text-eco-green hover:bg-eco-green/30 transition-colors z-40"
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
