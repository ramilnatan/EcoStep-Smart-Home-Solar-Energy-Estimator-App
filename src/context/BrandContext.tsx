import { createContext, useContext } from 'react';
import type { OrganizationRecord } from '../types';

type BrandContextType = {
  organization: OrganizationRecord | null;
};

export const BrandContext = createContext<BrandContextType>({
  organization: null,
});

export const useBrand = () => useContext(BrandContext);
