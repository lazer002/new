import {
  createContext,
  useState,
  useContext,
  ReactNode,
} from "react";

/* ───────────── TYPES ───────────── */

export type PriceRange = {
  min: number;
  max: number;
} | null;

export type FilterState = {
  category: string | null;
  sizes: string[];
  colors: string[];
  price: PriceRange;

  inStockOnly: boolean;
  onSale: boolean;
  isNewProduct: boolean;
};

type FilterContextType = {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  activeCount: number; // 👈 NEW
 isFilterOpen: boolean;
setIsFilterOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

/* ───────────── DEFAULTS ───────────── */

const defaultFilters: FilterState = {
  category: null,
  sizes: [],
  colors: [],
  price: null,
  inStockOnly: false,
  onSale: false,
  isNewProduct: false,
};

/* ───────────── CONTEXT ───────────── */

const FilterContext = createContext<FilterContextType | undefined>(
  undefined
);

/* ───────────── PROVIDER ───────────── */

export function FilterProvider({ children }: { children: ReactNode }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] =
    useState<FilterState>(defaultFilters);

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // ✅ Count how many FILTER GROUPS are active
  const activeCount = getActiveFilterCount(filters);


  return (
    <FilterContext.Provider
      value={{
        filters,
        setFilters,
        resetFilters,
        activeCount,
       isFilterOpen,        // ✅
    setIsFilterOpen
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

/* ───────────── HOOK ───────────── */

export function useFilter() {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error(
      "useFilter must be used inside FilterProvider"
    );
  }
  return ctx;
}

/* ───────────── HELPERS ───────────── */

function getActiveFilterCount(filters: FilterState) {
  let count = 0;

  if (filters.category) count++;
  if (filters.sizes.length > 0) count++;
  if (filters.colors.length > 0) count++;
  if (filters.price) count++;
  if (filters.inStockOnly) count++;
  if (filters.onSale) count++;
  if (filters.isNewProduct) count++;

  return count;
}
