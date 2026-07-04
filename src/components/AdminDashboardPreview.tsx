import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AnimatePresence,
  motion,
} from 'framer-motion';
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
  PencilLine,
  Save,
  X,
  Eye,
  Mail,
  Phone,
  CalendarDays,
  BatteryCharging,
  Gauge,
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Copy,
  CheckCircle2,
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

type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'closed'
  | 'archived';

const LEAD_STATUSES: LeadStatus[] = [
  'new',
  'contacted',
  'qualified',
  'closed',
  'archived',
];

type LeadStatusFilter = 'all' | LeadStatus;

type LeadSortOrder = 'newest' | 'oldest';

type AdminDashboardView = 'leads' | 'customers';

const LEADS_PER_PAGE = 5;

type CustomerSortOrder = 'newest' | 'oldest';

const CUSTOMERS_PER_PAGE = 5;

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
  admin_notes: string | null;
  status: string | null;
  created_at: string | null;
  currency: string | null;
};

type CustomerRecord = {
  id: string;
  full_name: string;
  email: string | null;
  phone_number: string | null;
  location: string | null;
  created_at: string;
  request_type: string | null;
  status: string | null;
  admin_notes: string | null;
};

type LeadAppliance = {
  id?: string;
  name?: string;
  watts?: number;
  quantity?: number;
  hoursPerDay?: number;
};

const parseSelectedAppliances = (
  value: unknown
): LeadAppliance[] => {
  if (Array.isArray(value)) {
    return value as LeadAppliance[];
  }

  if (typeof value === 'string') {
    try {
      const parsedValue = JSON.parse(value);

      return Array.isArray(parsedValue)
        ? (parsedValue as LeadAppliance[])
        : [];
    } catch {
      return [];
    }
  }

  return [];
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

const formatCustomerRequestType = (
  requestType: string | null
) => {
  return requestType?.trim() || 'General Inquiry';
};

const combinePhoneNumber = (
  ...parts: Array<string | null | undefined>
) => {
  return parts
    .filter(
      (part): part is string =>
        Boolean(part?.trim())
    )
    .join(' ');
};

const createPhoneLink = (phoneNumber: string) => {
  return `tel:${phoneNumber.replace(
    /[^\d+]/g,
    ''
  )}`;
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

type CsvValue =
  | string
  | number
  | boolean
  | null
  | undefined;

const escapeCsvValue = (value: CsvValue) => {
  if (value === null || value === undefined) {
    return '""';
  }

  const stringValue = String(value);

  const protectedValue =
    typeof value === 'string' &&
    /^[=+\-@\t\r]/.test(stringValue)
      ? `'${stringValue}`
      : stringValue;

  return `"${protectedValue.replace(/"/g, '""')}"`;
};

const formatCsvDate = (
  value: string | null
) => {
  if (!value) {
    return '';
  }

  const parsedDate = new Date(value);

  return Number.isNaN(parsedDate.getTime())
    ? value
    : parsedDate.toISOString();
};

const downloadCsvFile = (
  filename: string,
  headers: string[],
  rows: CsvValue[][]
) => {
  const csvContent = [
    headers,
    ...rows,
  ]
    .map((row) =>
      row.map(escapeCsvValue).join(',')
    )
    .join('\r\n');

  const csvBlob = new Blob(
    [`\uFEFF${csvContent}`],
    {
      type: 'text/csv;charset=utf-8;',
    }
  );

  const downloadUrl =
    URL.createObjectURL(csvBlob);

  const downloadLink =
    document.createElement('a');

  downloadLink.href = downloadUrl;
  downloadLink.download = filename;
  downloadLink.style.display = 'none';

  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(downloadUrl);
  }, 0);
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

  const [editingLeadId, setEditingLeadId] =
  useState<string | null>(null);

  const [draftStatus, setDraftStatus] =
  useState<LeadStatus>('new');

  const [draftAdminNotes, setDraftAdminNotes] =
  useState('');

  const [isLeadSaving, setIsLeadSaving] =
  useState(false);

  const [leadUpdateError, setLeadUpdateError] =
  useState('');

  const [leadUpdateSuccess, setLeadUpdateSuccess] =
  useState('');

  const [selectedLead, setSelectedLead] =
  useState<LeadRecord | null>(null);

  const [leadSearch, setLeadSearch] = useState('');

  const [leadStatusFilter, setLeadStatusFilter] =
  useState<LeadStatusFilter>('all');

  const [leadSortOrder, setLeadSortOrder] =
  useState<LeadSortOrder>('newest');

  const [currentPage, setCurrentPage] = useState(1);

  const [activeAdminView, setActiveAdminView] =
  useState<AdminDashboardView>('leads');

const [customers, setCustomers] =
  useState<CustomerRecord[]>([]);

const [isCustomersLoading, setIsCustomersLoading] =
  useState(false);

const [customersError, setCustomersError] =
  useState('');

  const [customerSearch, setCustomerSearch] =
  useState('');

const [
  customerRequestFilter,
  setCustomerRequestFilter,
] = useState('all');

const [customerSortOrder, setCustomerSortOrder] =
  useState<CustomerSortOrder>('newest');

const [
  customerCurrentPage,
  setCustomerCurrentPage,
] = useState(1);

const [selectedCustomer, setSelectedCustomer] =
  useState<CustomerRecord | null>(null);

const [
  editingCustomerId,
  setEditingCustomerId,
] = useState<string | null>(null);

const [
  draftCustomerStatus,
  setDraftCustomerStatus,
] = useState<LeadStatus>('new');

const [
  draftCustomerAdminNotes,
  setDraftCustomerAdminNotes,
] = useState('');

const [
  isCustomerSaving,
  setIsCustomerSaving,
] = useState(false);

const [
  customerUpdateError,
  setCustomerUpdateError,
] = useState('');

const [
  customerUpdateSuccess,
  setCustomerUpdateSuccess,
] = useState('');

const [
  contactActionMessage,
  setContactActionMessage,
] = useState('');

const [
  contactActionError,
  setContactActionError,
] = useState(false);

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
          admin_notes,
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

  const loadCustomers = useCallback(async () => {
  if (!isAdminAuthenticated) {
    setCustomers([]);
    setCustomersError('');
    return;
  }

  setIsCustomersLoading(true);
  setCustomersError('');

  try {
    const { data, error } = await supabase
      .from('customers')
      .select(`
        id,
        full_name,
        email,
        phone_number,
        location,
        created_at,
        request_type,
        status,
        admin_notes
      `)
      .order('created_at', {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    setCustomers((data ?? []) as CustomerRecord[]);
  } catch (error) {
    console.error(
      '[Admin Dashboard] Unable to load customers:',
      error
    );

    setCustomersError(
      'EcoStep could not load the protected customer inquiries. Please try again.'
    );
  } finally {
    setIsCustomersLoading(false);
  }
}, [isAdminAuthenticated]);

const openCustomerDetails = (
  customer: CustomerRecord
) => {
  const normalizedStatus =
    (customer.status || 'new').toLowerCase() as LeadStatus;

  setSelectedCustomer(customer);
  setEditingCustomerId(customer.id);

  setDraftCustomerStatus(
    LEAD_STATUSES.includes(normalizedStatus)
      ? normalizedStatus
      : 'new'
  );

  setDraftCustomerAdminNotes(
    customer.admin_notes ?? ''
  );

  setCustomerUpdateError('');
  setCustomerUpdateSuccess('');
};

const closeCustomerDetails = () => {
  setSelectedCustomer(null);
  setEditingCustomerId(null);
  setDraftCustomerStatus('new');
  setDraftCustomerAdminNotes('');
  setCustomerUpdateError('');
  setCustomerUpdateSuccess('');
};

const saveCustomerChanges = async () => {
  if (
    !editingCustomerId ||
    !isAdminAuthenticated
  ) {
    return;
  }

  setIsCustomerSaving(true);
  setCustomerUpdateError('');
  setCustomerUpdateSuccess('');

  try {
    const { data, error } = await supabase
      .from('customers')
      .update({
        status: draftCustomerStatus,
        admin_notes:
          draftCustomerAdminNotes.trim() || null,
      })
      .eq('id', editingCustomerId)
      .select(`
        id,
        status,
        admin_notes
      `)
      .single();

    if (error) {
      throw error;
    }

    setCustomers((currentCustomers) =>
      currentCustomers.map((customer) =>
        customer.id === data.id
          ? {
              ...customer,
              status: data.status,
              admin_notes: data.admin_notes,
            }
          : customer
      )
    );

    setSelectedCustomer((currentCustomer) => {
      if (
        !currentCustomer ||
        currentCustomer.id !== data.id
      ) {
        return currentCustomer;
      }

      return {
        ...currentCustomer,
        status: data.status,
        admin_notes: data.admin_notes,
      };
    });

    setCustomerUpdateSuccess(
      'Customer status and admin notes saved successfully.'
    );
  } catch (error) {
    console.error(
      '[Admin Dashboard] Unable to update customer:',
      error
    );

    setCustomerUpdateError(
      'EcoStep could not save the customer changes. Please try again.'
    );
  } finally {
    setIsCustomerSaving(false);
  }
};

  const openLeadEditor = (lead: LeadRecord) => {
    const normalizedStatus =
      (lead.status || 'new').toLowerCase() as LeadStatus;
  
    setEditingLeadId(lead.id);
  
    setDraftStatus(
      LEAD_STATUSES.includes(normalizedStatus)
        ? normalizedStatus
        : 'new'
    );
  
    setDraftAdminNotes(lead.admin_notes ?? '');
    setLeadUpdateError('');
    setLeadUpdateSuccess('');
  };
  
  const closeLeadEditor = () => {
    setEditingLeadId(null);
    setDraftStatus('new');
    setDraftAdminNotes('');
    setLeadUpdateError('');
    setLeadUpdateSuccess('');
  };

  const openLeadDetails = (lead: LeadRecord) => {
    setSelectedLead(lead);
    openLeadEditor(lead);
  };
  
  const closeLeadDetails = () => {
    setSelectedLead(null);
    closeLeadEditor();
  };
  
  const saveLeadChanges = async () => {
    if (!editingLeadId || !isAdminAuthenticated) {
      return;
    }
  
    setIsLeadSaving(true);
    setLeadUpdateError('');
    setLeadUpdateSuccess('');
  
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({
          status: draftStatus,
          admin_notes:
            draftAdminNotes.trim() || null,
        })
        .eq('id', editingLeadId)
        .select(`
          id,
          status,
          admin_notes
        `)
        .single();
  
      if (error) {
        throw error;
      }
  
      setLeads((currentLeads) =>
        currentLeads.map((lead) =>
          lead.id === data.id
            ? {
                ...lead,
                status: data.status,
                admin_notes: data.admin_notes,
              }
            : lead
        )
      );

      setSelectedLead((currentLead) => {
        if (!currentLead || currentLead.id !== data.id) {
          return currentLead;
        }
      
        return {
          ...currentLead,
          status: data.status,
          admin_notes: data.admin_notes,
        };
      });
  
      setLeadUpdateSuccess(
        'Lead status and admin notes saved successfully.'
      );
    } catch (error) {
      console.error(
        '[Admin Dashboard] Unable to update lead:',
        error
      );
  
      setLeadUpdateError(
        'EcoStep could not save the lead changes. Please try again.'
      );
    } finally {
      setIsLeadSaving(false);
    }
  };

useEffect(() => {
  if (isAdminChecking) {
    return;
  }

  if (!isAdminAuthenticated) {
    setLeads([]);
    setLeadsError('');
    setCustomers([]);
    setCustomersError('');
    return;
  }

  void loadLeads();
  void loadCustomers();
}, [
  isAdminAuthenticated,
  isAdminChecking,
  loadLeads,
  loadCustomers,
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

  const selectedLeadAppliances = useMemo(
  () =>
    selectedLead
      ? parseSelectedAppliances(
          selectedLead.selected_appliances
        )
      : [],
  [selectedLead]
);

const searchedLeads = useMemo(() => {
  const normalizedSearch = leadSearch
    .trim()
    .toLowerCase();

  if (!normalizedSearch) {
    return leads;
  }

  return leads.filter((lead) => {
    const searchablePhone = [
      lead.country_code,
      lead.phone,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return (
      lead.full_name
        .toLowerCase()
        .includes(normalizedSearch) ||
      lead.email
        .toLowerCase()
        .includes(normalizedSearch) ||
      searchablePhone.includes(normalizedSearch)
    );
  });
}, [leads, leadSearch]);

const filteredSortedLeads = useMemo(() => {
  const filteredLeads = searchedLeads.filter(
    (lead) =>
      leadStatusFilter === 'all' ||
      (lead.status || 'new').toLowerCase() ===
        leadStatusFilter
  );

  return [...filteredLeads].sort((firstLead, secondLead) => {
    const firstDate = firstLead.created_at
      ? new Date(firstLead.created_at).getTime()
      : 0;

    const secondDate = secondLead.created_at
      ? new Date(secondLead.created_at).getTime()
      : 0;

    return leadSortOrder === 'newest'
      ? secondDate - firstDate
      : firstDate - secondDate;
  });
}, [
  searchedLeads,
  leadStatusFilter,
  leadSortOrder,
]);

const totalPages = Math.max(
  1,
  Math.ceil(
    filteredSortedLeads.length / LEADS_PER_PAGE
  )
);

const pageStart =
  (currentPage - 1) * LEADS_PER_PAGE;

const paginatedLeads = filteredSortedLeads.slice(
  pageStart,
  pageStart + LEADS_PER_PAGE
);

useEffect(() => {
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }
}, [currentPage, totalPages]);

const customerRequestTypes = useMemo(() => {
  return Array.from(
    new Set(
      customers.map((customer) =>
        formatCustomerRequestType(
          customer.request_type
        )
      )
    )
  ).sort((firstType, secondType) =>
    firstType.localeCompare(secondType)
  );
}, [customers]);

const filteredSortedCustomers = useMemo(() => {
  const normalizedSearch = customerSearch
    .trim()
    .toLowerCase();

  const filteredCustomers = customers.filter(
    (customer) => {
      const searchableValues = [
        customer.full_name,
        customer.email ?? '',
        customer.phone_number ?? '',
        customer.location ?? '',
        formatCustomerRequestType(
          customer.request_type
        ),
      ];

      const matchesSearch =
        !normalizedSearch ||
        searchableValues.some((value) =>
          value
            .toLowerCase()
            .includes(normalizedSearch)
        );

      const matchesRequestType =
        customerRequestFilter === 'all' ||
        formatCustomerRequestType(
          customer.request_type
        ) === customerRequestFilter;

      return matchesSearch && matchesRequestType;
    }
  );

  return [...filteredCustomers].sort(
    (firstCustomer, secondCustomer) => {
      const firstDate = new Date(
        firstCustomer.created_at
      ).getTime();

      const secondDate = new Date(
        secondCustomer.created_at
      ).getTime();

      return customerSortOrder === 'newest'
        ? secondDate - firstDate
        : firstDate - secondDate;
    }
  );
}, [
  customers,
  customerSearch,
  customerRequestFilter,
  customerSortOrder,
]);

const customerTotalPages = Math.max(
  1,
  Math.ceil(
    filteredSortedCustomers.length /
      CUSTOMERS_PER_PAGE
  )
);

const customerPageStart =
  (customerCurrentPage - 1) *
  CUSTOMERS_PER_PAGE;

const paginatedCustomers =
  filteredSortedCustomers.slice(
    customerPageStart,
    customerPageStart + CUSTOMERS_PER_PAGE
  );

useEffect(() => {
  if (customerCurrentPage > customerTotalPages) {
    setCustomerCurrentPage(customerTotalPages);
  }
}, [
  customerCurrentPage,
  customerTotalPages,
]);

const exportFilteredLeads = () => {
  if (filteredSortedLeads.length === 0) {
    return;
  }

  const exportRows = filteredSortedLeads.map(
    (lead) => {
      const phoneNumber = [
        lead.country_code,
        lead.phone,
      ]
        .filter(Boolean)
        .join(' ');

      const applianceSummary =
        parseSelectedAppliances(
          lead.selected_appliances
        )
          .map((appliance) =>
            [
              appliance.name ||
                'Custom Appliance',
              `${Number(
                appliance.watts ?? 0
              )} W`,
              `Qty ${Number(
                appliance.quantity ?? 1
              )}`,
              `${Number(
                appliance.hoursPerDay ?? 0
              )} hrs/day`,
            ].join(' | ')
          )
          .join('; ');

      return [
        formatStatus(lead.status),
        lead.full_name,
        lead.email,
        phoneNumber,
        formatCsvDate(lead.created_at),
        lead.currency || '',
        toNumber(lead.monthly_bill),
        toNumber(lead.estimated_kw),
        toNumber(lead.estimated_battery),
        toNumber(lead.daily_consumption),
        toNumber(lead.backup_runtime),
        toNumber(lead.monthly_savings),
        toNumber(lead.roi_years),
        toNumber(lead.grid_independence),
        applianceSummary,
        lead.notes || '',
        lead.admin_notes || '',
      ];
    }
  );

  downloadCsvFile(
    `ecostep-leads-${
      new Date().toISOString().slice(0, 10)
    }.csv`,
    [
      'Status',
      'Full Name',
      'Email',
      'Phone',
      'Submitted At',
      'Currency',
      'Monthly Bill',
      'Solar System kW',
      'Battery Capacity kWh',
      'Daily Consumption kWh',
      'Backup Runtime Hours',
      'Monthly Savings',
      'ROI Years',
      'Grid Independence Percent',
      'Selected Appliances',
      'Customer Notes',
      'Private Admin Notes',
    ],
    exportRows
  );
};

const exportFilteredCustomers = () => {
  if (
    filteredSortedCustomers.length === 0
  ) {
    return;
  }

  const exportRows =
    filteredSortedCustomers.map(
      (customer) => [
        formatStatus(customer.status),
        customer.full_name,
        customer.email || '',
        customer.phone_number || '',
        customer.location || '',
        formatCustomerRequestType(
          customer.request_type
        ),
        formatCsvDate(
          customer.created_at
        ),
        customer.admin_notes || '',
      ]
    );

  downloadCsvFile(
    `ecostep-customers-${
      new Date().toISOString().slice(0, 10)
    }.csv`,
    [
      'Status',
      'Full Name',
      'Email',
      'Phone',
      'Location',
      'Request Type',
      'Submitted At',
      'Private Admin Notes',
    ],
    exportRows
  );
};

const copyContactValue = async (
  value: string,
  label: string
) => {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return;
  }

  try {
    if (
      navigator.clipboard &&
      window.isSecureContext
    ) {
      await navigator.clipboard.writeText(
        trimmedValue
      );
    } else {
      const temporaryTextArea =
        document.createElement('textarea');

      temporaryTextArea.value = trimmedValue;
      temporaryTextArea.setAttribute(
        'readonly',
        ''
      );

      temporaryTextArea.style.position =
        'fixed';
      temporaryTextArea.style.opacity = '0';

      document.body.appendChild(
        temporaryTextArea
      );

      temporaryTextArea.select();

      const copySucceeded =
        document.execCommand('copy');

      temporaryTextArea.remove();

      if (!copySucceeded) {
        throw new Error(
          'Clipboard copy was unsuccessful.'
        );
      }
    }

    setContactActionError(false);
    setContactActionMessage(
      `${label} copied to clipboard.`
    );
  } catch (error) {
    console.error(
      '[Admin Dashboard] Unable to copy contact value:',
      error
    );

    setContactActionError(true);
    setContactActionMessage(
      `Unable to copy ${label.toLowerCase()}.`
    );
  }

  window.setTimeout(() => {
    setContactActionMessage('');
    setContactActionError(false);
  }, 2500);
};

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
              onClick={() => {
                 void loadLeads();
                 void loadCustomers();
                 }}
              disabled={isLeadsLoading || isCustomersLoading}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isLeadsLoading || isCustomersLoading
                  ? 'animate-spin'
                 : ''
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
           
              <div className="mt-8 flex justify-center">
  <div className="inline-flex rounded-2xl border border-white/10 bg-white/5 p-1">
    <button
      type="button"
      onClick={() => {
        setActiveAdminView('leads');
        closeLeadDetails();
        closeCustomerDetails();
      }}
      className={`rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
        activeAdminView === 'leads'
          ? 'bg-gradient-to-r from-eco-green to-eco-cyan text-dark-900'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      Solar Leads ({leads.length})
    </button>

    <button
      type="button"
      onClick={() => {
        setActiveAdminView('customers');
        closeLeadDetails();
        closeCustomerDetails();
      }}
      className={`rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${
        activeAdminView === 'customers'
          ? 'bg-gradient-to-r from-eco-green to-eco-cyan text-dark-900'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      Customer Inquiries ({customers.length})
    </button>
  </div>
</div>

{activeAdminView === 'leads' && (
  <>
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

              <div className="flex flex-wrap items-center gap-2">
  <button
    type="button"
    onClick={exportFilteredLeads}
    disabled={
      filteredSortedLeads.length === 0
    }
    className="flex items-center gap-2 rounded-xl border border-eco-cyan/20 bg-eco-cyan/10 px-4 py-2 text-xs font-semibold text-eco-cyan transition-colors hover:bg-eco-cyan hover:text-dark-900 disabled:cursor-not-allowed disabled:opacity-40"
  >
    <Download className="h-4 w-4" />
    Export CSV
  </button>

  <div className="inline-flex rounded-full border border-eco-green/20 bg-eco-green/10 px-3 py-1 text-xs text-eco-green">
    Live Supabase Data
  </div>
</div>
            </div>

<div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
  <label className="relative block">
    <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />

    <input
      type="search"
      value={leadSearch}
      onChange={(event) => {
        setLeadSearch(event.target.value);
        setCurrentPage(1);
        closeLeadEditor();
      }}
      placeholder="Search by customer name, email, or phone..."
      className="w-full rounded-xl border border-white/10 bg-dark-800 py-3 pl-12 pr-12 text-sm text-white outline-none placeholder:text-gray-600 focus:border-eco-cyan"
    />

    {leadSearch && (
      <button
        type="button"
        onClick={() => {
          setLeadSearch('');
          setCurrentPage(1);
          closeLeadEditor();
        }}
        aria-label="Clear lead search"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </label>

  <select
    value={leadStatusFilter}
    onChange={(event) => {
      setLeadStatusFilter(
        event.target.value as LeadStatusFilter
      );
      setCurrentPage(1);
      closeLeadEditor();
    }}
    className="rounded-xl border border-white/10 bg-dark-800 px-4 py-3 text-sm text-white outline-none focus:border-eco-green"
  >
    <option value="all">All Statuses</option>

    {LEAD_STATUSES.map((status) => (
      <option key={status} value={status}>
        {formatStatus(status)}
      </option>
    ))}
  </select>

  <select
    value={leadSortOrder}
    onChange={(event) => {
      setLeadSortOrder(
        event.target.value as LeadSortOrder
      );
      setCurrentPage(1);
      closeLeadEditor();
    }}
    className="rounded-xl border border-white/10 bg-dark-800 px-4 py-3 text-sm text-white outline-none focus:border-eco-cyan"
  >
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
  </select>
</div>

<div className="mt-2 text-xs text-gray-500">
  Showing {filteredSortedLeads.length} matching lead
  {filteredSortedLeads.length === 1 ? '' : 's'} from{' '}
  {leads.length} total protected leads.
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
  leads.length > 0 &&
  filteredSortedLeads.length === 0 && (
    <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
      <Search className="mx-auto h-10 w-10 text-gray-500" />

      <div className="mt-4 font-semibold text-white">
        No Matching Leads
      </div>

      <p className="mt-2 text-sm text-gray-400">
        Try another customer name, email address, or
        phone number.
      </p>

      <button
        type="button"
        onClick={() => {
        setLeadSearch('');
        setLeadStatusFilter('all');
        setLeadSortOrder('newest');
        setCurrentPage(1);
        closeLeadEditor();
        }}
         className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
      >
        Clear Search and Filters
      </button>
    </div>
  )}

            {!isLeadsLoading &&
              !leadsError &&
              paginatedLeads.length > 0 && (
                <div className="mt-5 space-y-3">
                  {paginatedLeads.map((lead) => {
                    const phoneNumber = [
                      lead.country_code,
                      lead.phone,
                    ]
                      .filter(Boolean)
                      .join(' ');

                      return (
                        <div
                          key={lead.id}
                          className="rounded-2xl border border-white/10 bg-white/5 p-4"
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <div className="font-semibold text-white">
                                {lead.full_name}
                              </div>
                      
                              <div className="mt-1 text-sm text-gray-400">
                                {lead.email}
                              </div>
                      
                              <div className="mt-1 text-xs text-gray-500">
                                {phoneNumber || 'No phone number'} •{' '}
                                {formatLeadDate(lead.created_at)}
                              </div>
                            </div>
                      
                            <div className="grid gap-1 text-xs text-gray-400 sm:grid-cols-2 lg:text-right">
                              <div>
                                {toNumber(lead.estimated_kw).toFixed(1)}{' '}
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
                                {toNumber(lead.roi_years).toFixed(1)}{' '}
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

                              <button
                                type="button"
                                onClick={() => openLeadDetails(lead)}
                                className="flex items-center gap-2 rounded-xl border border-eco-cyan/20 bg-eco-cyan/10 px-3 py-2 text-xs font-semibold text-eco-cyan transition-colors hover:bg-eco-cyan hover:text-dark-900"
                               >
                               <Eye className="h-4 w-4" />
                                View Details
                              </button>
                      
                              <button
                                type="button"
                                onClick={() => {
                                  if (editingLeadId === lead.id) {
                                    closeLeadEditor();
                                  } else {
                                    openLeadEditor(lead);
                                  }
                                }}
                                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                              >
                                {editingLeadId === lead.id ? (
                                  <X className="h-4 w-4" />
                                ) : (
                                  <PencilLine className="h-4 w-4" />
                                )}
                      
                                {editingLeadId === lead.id
                                  ? 'Close'
                                  : 'Manage'}
                              </button>
                            </div>
                          </div>
                      
                          {editingLeadId === lead.id && (
                            <div className="mt-4 border-t border-white/10 pt-4">
                              {lead.notes && (
                                <div className="mb-4 rounded-xl border border-white/10 bg-dark-800/60 p-4">
                                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Customer Notes
                                  </div>
                      
                                  <p className="mt-2 text-sm leading-relaxed text-gray-300">
                                    {lead.notes}
                                  </p>
                                </div>
                              )}
                      
                              <div className="grid gap-4 lg:grid-cols-2">
                                <label className="block">
                                  <span className="mb-2 block text-sm font-medium text-gray-300">
                                    Lead Status
                                  </span>
                      
                                  <select
                                    value={draftStatus}
                                    onChange={(event) => {
                                      setDraftStatus(
                                        event.target.value as LeadStatus
                                      );
                      
                                      setLeadUpdateError('');
                                      setLeadUpdateSuccess('');
                                    }}
                                    disabled={isLeadSaving}
                                    className="w-full rounded-xl border border-white/10 bg-dark-800 px-4 py-3 text-sm text-white outline-none focus:border-eco-green disabled:cursor-not-allowed disabled:opacity-60"
                                  >
                                    {LEAD_STATUSES.map((status) => (
                                      <option key={status} value={status}>
                                        {formatStatus(status)}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                      
                                <label className="block">
                                  <span className="mb-2 block text-sm font-medium text-gray-300">
                                    Private Admin Notes
                                  </span>
                      
                                  <textarea
                                    value={draftAdminNotes}
                                    onChange={(event) => {
                                      setDraftAdminNotes(
                                        event.target.value
                                      );
                      
                                      setLeadUpdateError('');
                                      setLeadUpdateSuccess('');
                                    }}
                                    disabled={isLeadSaving}
                                    rows={4}
                                    placeholder="Add follow-up details, customer requirements, or next actions..."
                                    className="w-full resize-none rounded-xl border border-white/10 bg-dark-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-eco-green disabled:cursor-not-allowed disabled:opacity-60"
                                  />
                                </label>
                              </div>
                      
                              {leadUpdateError && (
                                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                                  {leadUpdateError}
                                </div>
                              )}
                      
                              {leadUpdateSuccess && (
                                <div className="mt-4 rounded-xl border border-eco-green/30 bg-eco-green/10 p-3 text-sm text-eco-green">
                                  {leadUpdateSuccess}
                                </div>
                              )}
                      
                              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                                <button
                                  type="button"
                                  onClick={closeLeadEditor}
                                  disabled={isLeadSaving}
                                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <X className="h-4 w-4" />
                                  Cancel
                                </button>
                      
                                <button
                                  type="button"
                                  onClick={() =>
                                    void saveLeadChanges()
                                  }
                                  disabled={isLeadSaving}
                                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan px-5 py-3 text-sm font-semibold text-dark-900 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isLeadSaving ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Save className="h-4 w-4" />
                                  )}
                      
                                  {isLeadSaving
                                    ? 'Saving Changes...'
                                    : 'Save Lead Changes'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                  })}
                </div>
              )}
          </GlassCard>
        </motion.div>

        {filteredSortedLeads.length > 0 && (
  <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
    <div className="text-xs text-gray-500">
      Showing {pageStart + 1}–
      {Math.min(
        pageStart + LEADS_PER_PAGE,
        filteredSortedLeads.length
      )}{' '}
      of {filteredSortedLeads.length} matching leads
    </div>

    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          setCurrentPage((page) =>
            Math.max(1, page - 1)
          );
          closeLeadEditor();
        }}
        disabled={currentPage === 1}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <div className="rounded-xl border border-eco-cyan/20 bg-eco-cyan/10 px-4 py-2 text-sm font-semibold text-eco-cyan">
        Page {currentPage} of {totalPages}
      </div>

      <button
        type="button"
        onClick={() => {
          setCurrentPage((page) =>
            Math.min(totalPages, page + 1)
          );
          closeLeadEditor();
        }}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  </div>
)}
  </>
)}

{activeAdminView === 'customers' && (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="mt-12"
  >
    <GlassCard glow="green" className="p-6">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white">
            Customer Inquiries
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            Live protected quote and customer
            requests from the EcoStep customers
            table.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
  <button
    type="button"
    onClick={exportFilteredCustomers}
    disabled={
      filteredSortedCustomers.length === 0
    }
    className="flex items-center gap-2 rounded-xl border border-eco-green/20 bg-eco-green/10 px-4 py-2 text-xs font-semibold text-eco-green transition-colors hover:bg-eco-green hover:text-dark-900 disabled:cursor-not-allowed disabled:opacity-40"
  >
    <Download className="h-4 w-4" />
    Export CSV
  </button>

  <div className="inline-flex rounded-full border border-eco-green/20 bg-eco-green/10 px-3 py-1 text-xs text-eco-green">
    {customers.length} Protected Records
  </div>
</div>

      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />

          <input
            type="search"
            value={customerSearch}
            onChange={(event) => {
              setCustomerSearch(event.target.value);
              setCustomerCurrentPage(1);
            }}
            placeholder="Search name, email, phone, or location..."
            className="w-full rounded-xl border border-white/10 bg-dark-800 py-3 pl-12 pr-12 text-sm text-white outline-none placeholder:text-gray-600 focus:border-eco-green"
          />

          {customerSearch && (
            <button
              type="button"
              onClick={() => {
                setCustomerSearch('');
                setCustomerCurrentPage(1);
              }}
              aria-label="Clear customer search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-gray-500 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        <select
          value={customerRequestFilter}
          onChange={(event) => {
            setCustomerRequestFilter(
              event.target.value
            );
            setCustomerCurrentPage(1);
          }}
          className="rounded-xl border border-white/10 bg-dark-800 px-4 py-3 text-sm text-white outline-none focus:border-eco-green"
        >
          <option value="all">
            All Request Types
          </option>

          {customerRequestTypes.map(
            (requestType) => (
              <option
                key={requestType}
                value={requestType}
              >
                {requestType}
              </option>
            )
          )}
        </select>

        <select
          value={customerSortOrder}
          onChange={(event) => {
            setCustomerSortOrder(
              event.target
                .value as CustomerSortOrder
            );
            setCustomerCurrentPage(1);
          }}
          className="rounded-xl border border-white/10 bg-dark-800 px-4 py-3 text-sm text-white outline-none focus:border-eco-cyan"
        >
          <option value="newest">
            Newest First
          </option>

          <option value="oldest">
            Oldest First
          </option>
        </select>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        Showing {filteredSortedCustomers.length}{' '}
        matching customer
        {filteredSortedCustomers.length === 1
          ? ''
          : 's'}{' '}
        from {customers.length} protected records.
      </div>

      {isCustomersLoading && (
        <div className="mt-5 flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-8 text-sm text-gray-400">
          <RefreshCw className="h-5 w-5 animate-spin text-eco-green" />
          Loading protected customer inquiries...
        </div>
      )}

      {!isCustomersLoading &&
        customersError && (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-red-400" />

              <div>
                <div className="font-semibold text-red-400">
                  Unable to Load Customers
                </div>

                <p className="mt-1 text-sm text-gray-400">
                  {customersError}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    void loadCustomers()
                  }
                  className="mt-4 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/10"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

      {!isCustomersLoading &&
        !customersError &&
        customers.length === 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-500" />

            <div className="mt-4 font-semibold text-white">
              No Customer Inquiries Yet
            </div>

            <p className="mt-2 text-sm text-gray-400">
              New customer quote requests will
              appear here automatically.
            </p>
          </div>
        )}

      {!isCustomersLoading &&
        !customersError &&
        customers.length > 0 &&
        filteredSortedCustomers.length === 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <Search className="mx-auto h-10 w-10 text-gray-500" />

            <div className="mt-4 font-semibold text-white">
              No Matching Customers
            </div>

            <p className="mt-2 text-sm text-gray-400">
              Try another search or request-type
              filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setCustomerSearch('');
                setCustomerRequestFilter('all');
                setCustomerSortOrder('newest');
                setCustomerCurrentPage(1);
              }}
              className="mt-4 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              Clear Search and Filters
            </button>
          </div>
        )}

      {!isCustomersLoading &&
        !customersError &&
        paginatedCustomers.length > 0 && (
          <div className="mt-5 space-y-3">
            {paginatedCustomers.map(
              (customer) => (
                
                <div
                key={customer.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
                 >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold text-white">
                      {customer.full_name}
                    </div>
              
                    <div className="mt-1 text-sm text-gray-400">
                      {customer.email || 'No email address'}
                    </div>
              
                    <div className="mt-1 text-xs text-gray-500">
                      {customer.phone_number || 'No phone number'} •{' '}
                      {formatLeadDate(customer.created_at)}
                    </div>
                  </div>
              
                  <div className="text-sm text-gray-400 lg:text-right">
                    <div className="font-medium text-white">
                      {formatCustomerRequestType(
                        customer.request_type
                      )}
                    </div>
              
                    <div className="mt-1 text-xs text-gray-500">
                      {customer.location ||
                        'Location not provided'}
                    </div>
                  </div>
              
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                        customer.status
                      )}`}
                    >
                      {formatStatus(customer.status)}
                    </span>
              
                    <button
                      type="button"
                      onClick={() =>
                        openCustomerDetails(customer)
                      }
                      className="flex items-center gap-2 rounded-xl border border-eco-green/20 bg-eco-green/10 px-3 py-2 text-xs font-semibold text-eco-green transition-colors hover:bg-eco-green hover:text-dark-900"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>

              )
            )}
          </div>
        )}

      {filteredSortedCustomers.length > 0 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-xs text-gray-500">
            Showing {customerPageStart + 1}–
            {Math.min(
              customerPageStart +
                CUSTOMERS_PER_PAGE,
              filteredSortedCustomers.length
            )}{' '}
            of {filteredSortedCustomers.length}{' '}
            matching customers
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setCustomerCurrentPage((page) =>
                  Math.max(1, page - 1)
                )
              }
              disabled={
                customerCurrentPage === 1
              }
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="rounded-xl border border-eco-green/20 bg-eco-green/10 px-4 py-2 text-sm font-semibold text-eco-green">
              Page {customerCurrentPage} of{' '}
              {customerTotalPages}
            </div>

            <button
              type="button"
              onClick={() =>
                setCustomerCurrentPage((page) =>
                  Math.min(
                    customerTotalPages,
                    page + 1
                  )
                )
              }
              disabled={
                customerCurrentPage ===
                customerTotalPages
              }
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </GlassCard>
  </motion.div>
)}

     </div>

<AnimatePresence>
  {selectedLead && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        if (!isLeadSaving) {
          closeLeadDetails();
          }
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(event) => event.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl border border-white/10 bg-dark-800 p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={closeLeadDetails}
          disabled={isLeadSaving}
          aria-label="Close lead details"
          className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pr-12">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                selectedLead.status
              )}`}
            >
              {formatStatus(selectedLead.status)}
            </span>

            <span className="inline-flex items-center gap-2 text-xs text-gray-500">
              <CalendarDays className="h-4 w-4" />
              Submitted{' '}
              {formatLeadDate(selectedLead.created_at)}
            </span>
          </div>

          <h3 className="mt-4 text-3xl font-bold text-white">
            {selectedLead.full_name}
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            Complete protected EcoStep lead record,
            system recommendation, and follow-up management.
          </p>
        </div>

        {/* Customer Contact Information */}
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Mail className="mt-0.5 h-5 w-5 text-eco-green" />

            <div className="min-w-0">
              <div className="text-xs text-gray-500">
                Email Address
              </div>

              <div className="mt-1 break-all text-sm font-medium text-white">
                {selectedLead.email}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={`mailto:${
                  selectedLead.email
                }?subject=${encodeURIComponent(
                  'EcoStep Solar Inquiry Follow-Up'
                )}`}
                className="inline-flex items-center gap-2 rounded-lg border border-eco-green/20 bg-eco-green/10 px-3 py-2 text-xs font-semibold text-eco-green transition-colors hover:bg-eco-green hover:text-dark-900"
              >
                <Mail className="h-3.5 w-3.5" />
                Email
              </a>
            
              <button
                type="button"
                onClick={() =>
                  void copyContactValue(
                    selectedLead.email,
                    'Email address'
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>

            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Phone className="mt-0.5 h-5 w-5 text-eco-cyan" />

            <div>
              <div className="text-xs text-gray-500">
                Phone Number
              </div>

              <div className="mt-1 text-sm font-medium text-white">
                {[
                  selectedLead.country_code,
                  selectedLead.phone,
                ]
                  .filter(Boolean)
                  .join(' ') || 'No phone number'}
              </div>
 
              {combinePhoneNumber(
                selectedLead.country_code,
                selectedLead.phone
              ) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={createPhoneLink(
                      combinePhoneNumber(
                        selectedLead.country_code,
                        selectedLead.phone
                      )
                    )}
                    className="inline-flex items-center gap-2 rounded-lg border border-eco-cyan/20 bg-eco-cyan/10 px-3 py-2 text-xs font-semibold text-eco-cyan transition-colors hover:bg-eco-cyan hover:text-dark-900"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </a>
              
                  <button
                    type="button"
                    onClick={() =>
                      void copyContactValue(
                        combinePhoneNumber(
                          selectedLead.country_code,
                          selectedLead.phone
                        ),
                        'Phone number'
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>
              )}

            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <CalendarDays className="mt-0.5 h-5 w-5 text-eco-amber" />

            <div>
              <div className="text-xs text-gray-500">
                Submission Date
              </div>

              <div className="mt-1 text-sm font-medium text-white">
                {formatLeadDate(selectedLead.created_at)}
              </div>
            </div>
          </div>
        </div>

        {contactActionMessage && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-xl border p-3 text-sm ${
              contactActionError
                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                : 'border-eco-green/30 bg-eco-green/10 text-eco-green'
            }`}
          >
            {contactActionError ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
        
            {contactActionMessage}
          </div>
        )}

        {/* Full System Calculations */}
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5 text-eco-green" />

            <h4 className="text-xl font-bold text-white">
              System Recommendation
            </h4>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-gray-500">
                Monthly Electric Bill
              </div>

              <div className="mt-2 text-xl font-bold text-white">
                {formatMoney(
                  selectedLead.monthly_bill,
                  selectedLead.currency
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-eco-green/20 bg-eco-green/10 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Zap className="h-4 w-4 text-eco-green" />
                Solar System
              </div>

              <div className="mt-2 text-xl font-bold text-eco-green">
                {toNumber(
                  selectedLead.estimated_kw
                ).toFixed(1)}{' '}
                kW
              </div>
            </div>

            <div className="rounded-2xl border border-eco-cyan/20 bg-eco-cyan/10 p-4">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <BatteryCharging className="h-4 w-4 text-eco-cyan" />
                Battery Capacity
              </div>

              <div className="mt-2 text-xl font-bold text-eco-cyan">
                {toNumber(
                  selectedLead.estimated_battery
                ).toFixed(1)}{' '}
                kWh
              </div>
            </div>

            <div className="rounded-2xl border border-eco-amber/20 bg-eco-amber/10 p-4">
              <div className="text-xs text-gray-400">
                Daily Consumption
              </div>

              <div className="mt-2 text-xl font-bold text-eco-amber">
                {toNumber(
                  selectedLead.daily_consumption
                ).toFixed(1)}{' '}
                kWh
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-gray-500">
                Backup Runtime
              </div>

              <div className="mt-2 text-xl font-bold text-white">
                {toNumber(
                  selectedLead.backup_runtime
                ).toFixed(1)}{' '}
                hours
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-gray-500">
                Monthly Savings
              </div>

              <div className="mt-2 text-xl font-bold text-eco-green">
                {formatMoney(
                  selectedLead.monthly_savings,
                  selectedLead.currency
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-gray-500">
                Expected ROI
              </div>

              <div className="mt-2 text-xl font-bold text-eco-cyan">
                {toNumber(
                  selectedLead.roi_years
                ).toFixed(2)}{' '}
                years
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-gray-500">
                Grid Independence
              </div>

              <div className="mt-2 text-xl font-bold text-eco-amber">
                {Math.round(
                  toNumber(
                    selectedLead.grid_independence
                  )
                )}
                %
              </div>
            </div>
          </div>
        </div>

        {/* Selected Appliances */}
        <div className="mt-6">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-eco-cyan" />

            <h4 className="text-xl font-bold text-white">
              Selected Appliances
            </h4>
          </div>

          {selectedLeadAppliances.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {selectedLeadAppliances.map(
                (appliance, index) => {
                  const watts = Number(
                    appliance.watts ?? 0
                  );

                  const quantity = Number(
                    appliance.quantity ?? 1
                  );

                  const hoursPerDay = Number(
                    appliance.hoursPerDay ?? 0
                  );

                  const dailyEnergyKWh =
                    (watts *
                      quantity *
                      hoursPerDay) /
                    1000;

                  return (
                    <div
                      key={
                        appliance.id ??
                        `${appliance.name}-${index}`
                      }
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="font-semibold text-white">
                        {appliance.name ||
                          'Custom Appliance'}
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-400">
                        <div>
                          Power:{' '}
                          <span className="text-white">
                            {watts} W
                          </span>
                        </div>

                        <div>
                          Quantity:{' '}
                          <span className="text-white">
                            {quantity}
                          </span>
                        </div>

                        <div>
                          Usage:{' '}
                          <span className="text-white">
                            {hoursPerDay} hrs/day
                          </span>
                        </div>

                        <div>
                          Daily:{' '}
                          <span className="text-eco-green">
                            {dailyEnergyKWh.toFixed(2)}{' '}
                            kWh
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-gray-400">
              No appliance details were stored for this
              lead.
            </div>
          )}
        </div>

        {/* Customer and Admin Notes */}
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-eco-amber" />

              <h4 className="font-bold text-white">
                Customer Notes
              </h4>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
              {selectedLead.notes ||
                'No customer notes were submitted.'}
            </p>
          </div>

          <div className="rounded-2xl border border-eco-green/20 bg-eco-green/5 p-5">
            <div className="flex items-center gap-2">
              <PencilLine className="h-5 w-5 text-eco-green" />

              <h4 className="font-bold text-white">
                Lead Management
              </h4>
            </div>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-gray-300">
                Lead Status
              </span>

              <select
                value={draftStatus}
                onChange={(event) => {
                  setDraftStatus(
                    event.target.value as LeadStatus
                  );

                  setLeadUpdateError('');
                  setLeadUpdateSuccess('');
                }}
                disabled={isLeadSaving}
                className="w-full rounded-xl border border-white/10 bg-dark-800 px-4 py-3 text-sm text-white outline-none focus:border-eco-green disabled:cursor-not-allowed disabled:opacity-60"
              >
                {LEAD_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-medium text-gray-300">
                Private Admin Notes
              </span>

              <textarea
                value={draftAdminNotes}
                onChange={(event) => {
                  setDraftAdminNotes(
                    event.target.value
                  );

                  setLeadUpdateError('');
                  setLeadUpdateSuccess('');
                }}
                disabled={isLeadSaving}
                rows={5}
                placeholder="Add follow-up details, customer requirements, or next actions..."
                className="w-full resize-none rounded-xl border border-white/10 bg-dark-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-eco-green disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            {leadUpdateError && (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                {leadUpdateError}
              </div>
            )}

            {leadUpdateSuccess && (
              <div className="mt-4 rounded-xl border border-eco-green/30 bg-eco-green/10 p-3 text-sm text-eco-green">
                {leadUpdateSuccess}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeLeadDetails}
                disabled={isLeadSaving}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Close
              </button>

              <button
                type="button"
                onClick={() =>
                  void saveLeadChanges()
                }
                disabled={isLeadSaving}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan px-5 py-3 text-sm font-semibold text-dark-900 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLeadSaving ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}

                {isLeadSaving
                  ? 'Saving Changes...'
                  : 'Save Lead Changes'}
              </button>
            </div>
          </div>
         </div>
       </motion.div>
    </motion.div>
  )}

  {selectedCustomer && (
    <motion.div
      key="customer-details"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => {
        if (!isCustomerSaving) {
          closeCustomerDetails();
        }
      }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm"
    >
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          scale: 0.96,
          y: 20,
        }}
        transition={{ duration: 0.2 }}
        onClick={(event) =>
          event.stopPropagation()
        }
        className="relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/10 bg-dark-800 p-6 shadow-2xl sm:p-8"
      >
        <button
          type="button"
          onClick={closeCustomerDetails}
          disabled={isCustomerSaving}
          aria-label="Close customer details"
          className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/5 p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pr-12">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                selectedCustomer.status
              )}`}
            >
              {formatStatus(
                selectedCustomer.status
              )}
            </span>

            <span className="inline-flex items-center gap-2 text-xs text-gray-500">
              <CalendarDays className="h-4 w-4" />
              Submitted{' '}
              {formatLeadDate(
                selectedCustomer.created_at
              )}
            </span>
          </div>

          <h3 className="mt-4 text-3xl font-bold text-white">
            {selectedCustomer.full_name}
          </h3>

          <p className="mt-2 text-sm text-gray-400">
            Complete protected customer inquiry
            and follow-up management.
          </p>
        </div>

        {/* Customer Information */}
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Mail className="mt-0.5 h-5 w-5 text-eco-green" />

            <div className="min-w-0">
              <div className="text-xs text-gray-500">
                Email Address
              </div>

              <div className="mt-1 break-all text-sm font-medium text-white">
                {selectedCustomer.email ||
                  'No email address'}
              </div>

              {selectedCustomer.email && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={`mailto:${
                      selectedCustomer.email
                    }?subject=${encodeURIComponent(
                      'EcoStep Customer Inquiry Follow-Up'
                    )}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-eco-green/20 bg-eco-green/10 px-3 py-2 text-xs font-semibold text-eco-green transition-colors hover:bg-eco-green hover:text-dark-900"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </a>
              
                  <button
                    type="button"
                    onClick={() =>
                      void copyContactValue(
                        selectedCustomer.email || '',
                        'Email address'
                      )
                    }
                    className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </button>
                </div>
              )}

            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Phone className="mt-0.5 h-5 w-5 text-eco-cyan" />

            <div>
              <div className="text-xs text-gray-500">
                Phone Number
              </div>

              <div className="mt-1 text-sm font-medium text-white">
                {selectedCustomer.phone_number ||
                  'No phone number'}
              </div>
            </div>
          </div>

          {selectedCustomer.phone_number && (
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={createPhoneLink(
                  selectedCustomer.phone_number
                )}
                className="inline-flex items-center gap-2 rounded-lg border border-eco-cyan/20 bg-eco-cyan/10 px-3 py-2 text-xs font-semibold text-eco-cyan transition-colors hover:bg-eco-cyan hover:text-dark-900"
              >
                <Phone className="h-3.5 w-3.5" />
                Call
              </a>
          
              <button
                type="button"
                onClick={() =>
                  void copyContactValue(
                    selectedCustomer.phone_number ||
                      '',
                    'Phone number'
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </button>
            </div>
          )}

          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <FileText className="mt-0.5 h-5 w-5 text-eco-amber" />

            <div>
              <div className="text-xs text-gray-500">
                Request Type
              </div>

              <div className="mt-1 text-sm font-medium text-white">
                {formatCustomerRequestType(
                  selectedCustomer.request_type
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <Users className="mt-0.5 h-5 w-5 text-eco-green" />

            <div>
              <div className="text-xs text-gray-500">
                Customer Location
              </div>

              <div className="mt-1 text-sm font-medium text-white">
                {selectedCustomer.location ||
                  'Location not provided'}
              </div>
            </div>
          </div>
        </div>

        {contactActionMessage && (
          <div
            className={`mt-3 flex items-center gap-2 rounded-xl border p-3 text-sm ${
              contactActionError
                ? 'border-red-500/30 bg-red-500/10 text-red-400'
                : 'border-eco-green/30 bg-eco-green/10 text-eco-green'
            }`}
          >
            {contactActionError ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
        
            {contactActionMessage}
          </div>
        )}

        {/* Customer Management */}
        <div className="mt-6 rounded-2xl border border-eco-green/20 bg-eco-green/5 p-5">
          <div className="flex items-center gap-2">
            <PencilLine className="h-5 w-5 text-eco-green" />

            <h4 className="text-xl font-bold text-white">
              Customer Management
            </h4>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">
                Customer Status
              </span>

              <select
                value={draftCustomerStatus}
                onChange={(event) => {
                  setDraftCustomerStatus(
                    event.target
                      .value as LeadStatus
                  );

                  setCustomerUpdateError('');
                  setCustomerUpdateSuccess('');
                }}
                disabled={isCustomerSaving}
                className="w-full rounded-xl border border-white/10 bg-dark-800 px-4 py-3 text-sm text-white outline-none focus:border-eco-green disabled:cursor-not-allowed disabled:opacity-60"
              >
                {LEAD_STATUSES.map((status) => (
                  <option
                    key={status}
                    value={status}
                  >
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-300">
                Private Admin Notes
              </span>

              <textarea
                value={draftCustomerAdminNotes}
                onChange={(event) => {
                  setDraftCustomerAdminNotes(
                    event.target.value
                  );

                  setCustomerUpdateError('');
                  setCustomerUpdateSuccess('');
                }}
                disabled={isCustomerSaving}
                rows={5}
                placeholder="Add follow-up details, quotation notes, or next actions..."
                className="w-full resize-none rounded-xl border border-white/10 bg-dark-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-eco-green disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          </div>

          {customerUpdateError && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {customerUpdateError}
            </div>
          )}

          {customerUpdateSuccess && (
            <div className="mt-4 rounded-xl border border-eco-green/30 bg-eco-green/10 p-3 text-sm text-eco-green">
              {customerUpdateSuccess}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeCustomerDetails}
              disabled={isCustomerSaving}
              className="flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-4 w-4" />
              Close
            </button>

            <button
              type="button"
              onClick={() =>
                void saveCustomerChanges()
              }
              disabled={isCustomerSaving}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-eco-green to-eco-cyan px-5 py-3 text-sm font-semibold text-dark-900 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCustomerSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              {isCustomerSaving
                ? 'Saving Changes...'
                : 'Save Customer Changes'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}

</AnimatePresence>
</section>
  
  );
}
