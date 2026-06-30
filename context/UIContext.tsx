import React, {
  createContext,
  useContext,
  useState,
} from "react";

type UIContextType = {

  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;

  filterOpen: boolean;
  setFilterOpen: (v: boolean) => void;

  tabBarVisible: boolean;
  setTabBarVisible: (v: boolean) => void;

};

const UIContext =
  createContext<UIContextType>(
    {} as UIContextType
  );

export function UIProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [filterOpen, setFilterOpen] =
    useState(false);

  const [tabBarVisible, setTabBarVisible] =
    useState(true);

  return (

    <UIContext.Provider
      value={{

        drawerOpen,
        setDrawerOpen,

        filterOpen,
        setFilterOpen,

        tabBarVisible,
        setTabBarVisible,

      }}
    >

      {children}

    </UIContext.Provider>

  );

}

export const useUI = () =>
  useContext(UIContext);