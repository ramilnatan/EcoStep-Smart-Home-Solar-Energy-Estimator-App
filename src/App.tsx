import { useState, useRef, useCallback, useEffect, useMemo, } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Battery, BarChart3, FileText, ChevronUp, ChevronDown, Menu, X } from 'lucide-react';
import { Hero } from './components/Hero';
import { EnergyEstimator } from './components/EnergyEstimator';
import { EnergyVisualization } from './components/EnergyVisualization';
import { DemoAccessBanner } from './components/DemoAccessBanner';
import { SolarGuide } from './components/SolarGuide';
import { LeadCapture } from './components/LeadCapture';
import { CustomerLeadForm } from './components/CustomerLeadForm';
import { Appliance, CalculationResult } from './types';
import { calculateEnergyResults } from './utils/calculations';
import { FullAccessGate } from './components/FullAccessGate';
import { AccessPortalPreview } from './components/AccessPortalPreview';
import { VersionPlans } from './components/VersionPlans';
import { AdminDashboardPreview } from './components/AdminDashboardPreview';
import { SubscriberDashboardPreview } from './components/SubscriberDashboardPreview';
import { SaaSRoadmap } from './components/SaaSRoadmap';
import { EstimateDisclaimer } from './components/EstimateDisclaimer';
import { WhyEcoStep } from './components/WhyEcoStep';
import { FAQSection } from './components/FAQSection';
import { supabase } from './lib/supabase';
import { ECOSTEP_PLANS } from './config/ecostepPlans';
import { BrandContext } from './context/BrandContext';
import type { OrganizationRecord } from './types';
import { TrialRegistrationModal } from './components/TrialRegistrationModal';
import { LoginModal } from "./components/LoginModal";

const primaryNavItems = [
  { id: 'hero', label: 'Home', icon: Sun },
  { id: 'estimator', label: 'Estimator', icon: BarChart3 },
  { id: 'visualization', label: 'Business Tools', icon: Battery },
  { id: 'versions', label: 'Versions', icon: FileText },
  { id: 'lead-form', label: 'Quote', icon: FileText },
];

const moreNavItems = [
  { id: 'resources', label: 'Resources', icon: FileText },
  { id: 'access-portal', label: 'Access', icon: FileText },
  { id: 'roadmap', label: 'Roadmap', icon: FileText },
  { id: 'why-ecostep', label: 'Why EcoStep', icon: FileText },
  { id: 'faq', label: 'FAQ', icon: FileText },
  { id: 'footer-contact', label: 'Contact', icon: FileText },
];

const moreActiveSectionIds = [
  ...moreNavItems.map((item) => item.id),
  'admin-dashboard-preview',
  'subscriber-dashboard-preview',
];

function App() {
  const estimatorRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAdminChecking, setIsAdminChecking] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);     
  const [organization, setOrganization] =
  useState<OrganizationRecord | null>(null);
    //const [organization, setOrganization] = useState(null);
  //const [subscriber, setSubscriber] = useState(null);
  const currentPlan = useMemo(
    () =>
      isAdminAuthenticated
        ? ECOSTEP_PLANS.admin
        : ECOSTEP_PLANS.demo,
    [isAdminAuthenticated]
  );
  const [calculationData, setCalculationData] = useState<{
    monthlyBill: number;
    selectedAppliances: Appliance[];
    results: CalculationResult;
    currency: string;
    costPerKw: number;
    batteryCostPerKwh: number;
  }>({
    monthlyBill: 150,
    selectedAppliances: [],
    results: calculateEnergyResults(150, [], 'USD'),
    currency: 'USD',
    costPerKw: 900,
    batteryCostPerKwh: 500,
  });

  const refreshAdminState = useCallback(
    async (userId?: string, email?: string | null) => {
      if (!userId) {
        setIsAdminAuthenticated(false);
        setAdminEmail('');
        setIsAdminChecking(false);
        return;
      }
  
      const { data: adminRecord, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
  
      if (error || !adminRecord) {
        setIsAdminAuthenticated(false);
        setAdminEmail('');
        setIsAdminChecking(false);
        return;
      }
  
      setIsAdminAuthenticated(true);
      setAdminEmail(email ?? '');
      setIsAdminChecking(false);
    },
    []
  );

  const scrollToEstimator = useCallback(() => {
    if (!estimatorRef.current) return;
  
    const navOffset = 80;
    const targetPosition =
      estimatorRef.current.getBoundingClientRect().top + window.scrollY - navOffset;
  
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });
  
    setActiveSection('estimator');
  }, []);

  const handleCalculate = useCallback(
    (
      monthlyBill: number,
      selectedAppliances: Appliance[],
      results: CalculationResult,
      currency: string,
      costPerKw: number,
      batteryCostPerKwh: number
    ) => {
      setCalculationData({
        monthlyBill,
        selectedAppliances,
        results,
        currency,
        costPerKw,
        batteryCostPerKwh,
      });
    },
    []
  );

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLoginSuccess = (email: string) => {
    setIsAdminAuthenticated(true);
    setAdminEmail(email);
    setIsAdminChecking(false);
  };
  
  const handleAdminLogout = async () => {
    const { error } = await supabase.auth.signOut();
  
    if (error) {
      console.error('[Admin Logout] Error:', error);
      return;
    }
  
    setIsAdminAuthenticated(false);
    setAdminEmail('');
    setIsAdminChecking(false);
  
    document
      .getElementById('access-portal')
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
  };

  const scrollToSection = useCallback((sectionId: string) => {
    setIsMoreOpen(false);
    setIsMobileMenuOpen(false);
    setActiveSection(sectionId);
  
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
  
    const element = document.getElementById(sectionId);
    if (!element) return;
  
    const navOffset = 80;
    const targetPosition =
      element.getBoundingClientRect().top + window.scrollY - navOffset;
  
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth',
    });
  }, []);

  // Track active section based on scroll position
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target as Node)
      ) {
        setIsMoreOpen(false);
      }
    };
  
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMoreOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  useEffect(() => {
    const checkCurrentSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
  
      await refreshAdminState(
        session?.user.id,
        session?.user.email
      );
    };
  
    void checkCurrentSession();
  
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void refreshAdminState(
        session?.user.id,
        session?.user.email
      );
    });
  
    return () => {
      subscription.unsubscribe();
    };
  }, [refreshAdminState]);

  useEffect(() => {
    const handleScroll = () => {
      const totalScrollable =
  document.documentElement.scrollHeight - window.innerHeight;

const currentProgress =
  totalScrollable > 0 ? (window.scrollY / totalScrollable) * 100 : 0;

setScrollProgress(currentProgress);

const sections = [
  'hero',
  'estimator',
  'resources',
  'visualization',
  'access-portal',
  'admin-dashboard-preview',
  'subscriber-dashboard-preview',
  'roadmap',
  'why-ecostep',
  'versions',
  'faq',
  'lead-form',
  'footer-contact',
];

const detectionPoint = window.scrollY + window.innerHeight * 0.35;

let currentSection = 'hero';

for (const sectionId of sections) {
  const element = document.getElementById(sectionId);

  if (element && detectionPoint >= element.offsetTop) {
    currentSection = sectionId;
  }
}

setActiveSection(currentSection); 
     
    };

    handleScroll();

window.addEventListener('scroll', handleScroll);
return () => window.removeEventListener('scroll', handleScroll);

  }, []);

  return (
    <BrandContext.Provider
      value={{
        organization,
      }}
    >
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
              <span className="text-xl font-bold text-white">
                 {organization?.company_name ?? 'EcoStep'}
              </span>
            </motion.div>

            <div className="hidden md:flex items-center gap-1">
         
            {primaryNavItems.map((item) => {
  const Icon = item.icon;

  return (
    <a
      key={item.id}
      href={item.id === 'hero' ? '#' : `#${item.id}`}
      onClick={(event) => {
        event.preventDefault();
        scrollToSection(item.id);
      }}
      className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
        activeSection === item.id
          ? 'bg-eco-green text-dark-900'
          : 'text-gray-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </a>
  );
})}

<div ref={moreMenuRef} className="relative">
  <button
    type="button"
    onClick={() => setIsMoreOpen((prev) => !prev)}
    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
      moreActiveSectionIds.includes(activeSection)
        ? 'bg-eco-green text-dark-900'
        : 'text-gray-300 hover:bg-white/10 hover:text-white'
    }`}
  >
    More
    <ChevronDown
      className={`h-4 w-4 transition-transform ${
        isMoreOpen ? 'rotate-180' : ''
      }`}
    />
  </button>

  {isMoreOpen && (
    <div className="absolute right-0 top-full z-50 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-dark-800 shadow-2xl">
      {moreNavItems.map((item) => {
        const Icon = item.icon;

        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(event) => {
              event.preventDefault();
              scrollToSection(item.id);
            }}
            className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
              activeSection === item.id
                ? 'bg-eco-green/10 text-eco-green'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </a>
        );
      })}
    </div>
  )}
</div>

            </div>

            <motion.button
              onClick={scrollToEstimator}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-eco-green to-eco-cyan rounded-xl text-black font-semibold text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>

            <button
              onClick={() => setIsLoginOpen(true)}
              className="rounded-xl bg-blue-600 px-6 py-3 text-white"
            >
              Test Login
            </button>              

            <button
              type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white md:hidden"
               aria-label="Toggle mobile menu"
               >
               {isMobileMenuOpen ? (
               <X className="h-5 w-5" />
                ) : (
              <Menu className="h-5 w-5" />
               )}
            </button>

          </div>
        </div>
 
       <div className="h-1 w-full bg-white/5">
       <div
          className="h-full bg-gradient-to-r from-eco-green to-eco-cyan transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

    <AnimatePresence>
  {isMobileMenuOpen && (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="border-t border-white/5 bg-dark-900/95 px-4 py-4 md:hidden"
    >
      <div className="grid gap-2">
        {[...primaryNavItems, ...moreNavItems].map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.id}
              href={item.id === 'hero' ? '#' : `#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                scrollToSection(item.id);
              }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === item.id
                  ? 'bg-eco-green text-dark-900'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </a>
          );
        })}

        <button
          type="button"
          onClick={() => {
            setIsMobileMenuOpen(false);
            scrollToEstimator();
          }}
          className="mt-2 flex items-center justify-center rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan px-4 py-3 text-sm font-semibold text-dark-900"
        >
          Get Started
        </button>
        
      </div>
    </motion.div>
  )}
</AnimatePresence>

      </nav>

      <main>
          <Hero
              onScrollToEstimator={scrollToEstimator}
              onOpenTrialModal={() => setIsTrialModalOpen(true)}
          />

        <DemoAccessBanner />

        <div ref={estimatorRef}>
        <EnergyEstimator
           isAdminAuthenticated={isAdminAuthenticated}
           isAdminChecking={isAdminChecking}
           currentPlan={currentPlan}
           onCalculate={handleCalculate}
        />
        </div>

        <EstimateDisclaimer />
  
        <SolarGuide onScrollToEstimator={scrollToEstimator} />

        {currentPlan.features.hybridPowerFlow ? (
          <EnergyVisualization />
        ) : (
          <FullAccessGate />
        )}

        <AccessPortalPreview
         isAdminAuthenticated={isAdminAuthenticated}
         onAdminLoginSuccess={handleAdminLoginSuccess}
         onOrganizationLoaded={setOrganization}
        />

        <AdminDashboardPreview
         isAdminAuthenticated={isAdminAuthenticated}
         isAdminChecking={isAdminChecking}
         adminEmail={adminEmail}
         onLogout={handleAdminLogout}
         />

        <SubscriberDashboardPreview />

        <SaaSRoadmap />

        <WhyEcoStep />

        <VersionPlans />

        <FAQSection />

        <CustomerLeadForm />

        {calculationData.selectedAppliances.length > 0 && (
          <LeadCapture
          monthlyBill={calculationData.monthlyBill}
          selectedAppliances={calculationData.selectedAppliances}
          results={calculationData.results}
          currency={calculationData.currency}
          costPerKw={calculationData.costPerKw}
          batteryCostPerKwh={calculationData.batteryCostPerKwh}
        />
        )}


      </main>

      <footer id="footer-contact" className="py-12 bg-dark-900 border-t border-white/5 scroll-mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-eco-green to-eco-cyan flex items-center justify-center">
                  <Sun className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold text-white">
                 {organization?.company_name ?? 'EcoStep'}
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
                <li><a href="#visualization" className="hover:text-eco-green transition-colors">Business Tools</a></li>
                <li><a href="#access-portal" className="hover:text-eco-green transition-colors">Access Portal</a></li>
                <li><a href="#versions" className="hover:text-eco-green transition-colors">EcoStep Versions</a></li>
                <li><a href="#roadmap" className="hover:text-eco-green transition-colors">Roadmap</a></li>
                <li><a href="#why-ecostep" className="hover:text-eco-green transition-colors">Why EcoStep</a></li>
                <li><a href="#faq" className="hover:text-eco-green transition-colors">FAQ</a></li> 
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
      <TrialRegistrationModal
       isOpen={isTrialModalOpen}
       onClose={() => setIsTrialModalOpen(false)}
      />
      <LoginModal
       isOpen={isLoginOpen}
       onClose={() => setIsLoginOpen(false)}
      />
    </div>
   </BrandContext.Provider>
  );
}

export default App;
