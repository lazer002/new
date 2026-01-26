import { createContext, useState, useContext } from "react";

const FilterContext = createContext();

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState({
    category: null,
    sizes: [],
    colors: [],
    price: null,
  });

  const resetFilters = () => {
    setFilters({
      category: null,
      sizes: [],
      colors: [],
      price: null,
    });
  };

  const value = {
    filters,
    setFilters,
    resetFilters,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export const useFilter = () => useContext(FilterContext);
