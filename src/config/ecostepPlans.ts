export type EcoStepPlanId =
  | 'demo'
  | 'pro'
  | 'white_label'
  | 'admin';

export type EcoStepPlanFeatures = {
  fullApplianceLibrary: boolean;
  unlimitedApplianceSelection: boolean;
  editApplianceValues: boolean;
  customApplianceEntries: boolean;
  editablePricing: boolean;
  fullEstimateResults: boolean;
  hybridPowerFlow: boolean;
  saveEstimates: boolean;
  crmDashboard: boolean;
  csvExport: boolean;
  quickContactTools: boolean;
  subscriberWorkspace: boolean;
  customBranding: boolean;
  customDomain: boolean;
  removeEcoStepBranding: boolean;
};

export type EcoStepPlanConfig = {
  id: EcoStepPlanId;
  name: string;
  shortName: string;
  description: string;
  applianceLimit: number | null;
  visibleApplianceIds: string[] | null;
  features: EcoStepPlanFeatures;
};

const DEMO_APPLIANCE_IDS = [
  'refrigerator',
  'lights',
  'fan',
  'ac',
  'pump',
  'tv',
];

export const ECOSTEP_PLANS: Record<
  EcoStepPlanId,
  EcoStepPlanConfig
> = {
  demo: {
    id: 'demo',
    name: 'EcoStep Public Demo',
    shortName: 'Demo',
    description:
      'Public marketing version with limited appliances and locked premium business tools.',
    applianceLimit: 4,
    visibleApplianceIds: DEMO_APPLIANCE_IDS,
    features: {
      fullApplianceLibrary: false,
      unlimitedApplianceSelection: false,
      editApplianceValues: true,
      customApplianceEntries: false,
      editablePricing: false,
      fullEstimateResults: false,
      hybridPowerFlow: false,
      saveEstimates: false,
      crmDashboard: false,
      csvExport: false,
      quickContactTools: false,
      subscriberWorkspace: false,
      customBranding: false,
      customDomain: false,
      removeEcoStepBranding: false,
    },
  },

  pro: {
    id: 'pro',
    name: 'EcoStep Pro Subscription',
    shortName: 'Pro',
    description:
      'Full EcoStep business tools for solar installers, consultants, and distributors.',
    applianceLimit: null,
    visibleApplianceIds: null,
    features: {
      fullApplianceLibrary: true,
      unlimitedApplianceSelection: true,
      editApplianceValues: true,
      customApplianceEntries: true,
      editablePricing: true,
      fullEstimateResults: true,
      hybridPowerFlow: true,
      saveEstimates: true,
      crmDashboard: true,
      csvExport: true,
      quickContactTools: true,
      subscriberWorkspace: true,
      customBranding: false,
      customDomain: false,
      removeEcoStepBranding: false,
    },
  },

  white_label: {
    id: 'white_label',
    name: 'EcoStep Full White Label',
    shortName: 'White Label',
    description:
      'Fully branded EcoStep platform configured for a specific solar company.',
    applianceLimit: null,
    visibleApplianceIds: null,
    features: {
      fullApplianceLibrary: true,
      unlimitedApplianceSelection: true,
      editApplianceValues: true,
      customApplianceEntries: true,
      editablePricing: true,
      fullEstimateResults: true,
      hybridPowerFlow: true,
      saveEstimates: true,
      crmDashboard: true,
      csvExport: true,
      quickContactTools: true,
      subscriberWorkspace: true,
      customBranding: true,
      customDomain: true,
      removeEcoStepBranding: true,
    },
  },

  admin: {
    id: 'admin',
    name: 'EcoStep Administrator',
    shortName: 'Admin',
    description:
      'EcoStep owner access with all platform features and management tools.',
    applianceLimit: null,
    visibleApplianceIds: null,
    features: {
      fullApplianceLibrary: true,
      unlimitedApplianceSelection: true,
      editApplianceValues: true,
      customApplianceEntries: true,
      editablePricing: true,
      fullEstimateResults: true,
      hybridPowerFlow: true,
      saveEstimates: true,
      crmDashboard: true,
      csvExport: true,
      quickContactTools: true,
      subscriberWorkspace: true,
      customBranding: true,
      customDomain: true,
      removeEcoStepBranding: true,
    },
  },
};

export const getEcoStepPlan = (
  planId: string | null | undefined
): EcoStepPlanConfig => {
  if (
    planId &&
    Object.prototype.hasOwnProperty.call(
      ECOSTEP_PLANS,
      planId
    )
  ) {
    return ECOSTEP_PLANS[
      planId as EcoStepPlanId
    ];
  }

  return ECOSTEP_PLANS.demo;
};

export const hasEcoStepFeature = (
  plan: EcoStepPlanConfig,
  feature: keyof EcoStepPlanFeatures
) => {
  return plan.features[feature];
};
