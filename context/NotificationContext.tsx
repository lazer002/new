// context/NotificationContext.tsx

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "@/utils/config";
import { useAuth } from "./AuthContext";

type NotificationContextType = {
  notifCount: number;
  refreshNotifCount: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider = ({ children }: any) => {
  const { user, guestId } = useAuth();

  const [notifCount, setNotifCount] = useState(0);

  // ✅ persistent lock (correct way)
  const isFetchingRef = useRef(false);

  /* ---------- FETCH COUNT ---------- */

  const refreshNotifCount = async () => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;

    try {
      const res = await api.get("/api/notifications/unread-count");
      setNotifCount(res.data.count || 0);
    } catch (err) {
      console.log("NOTIF COUNT ERROR:", err);
    } finally {
      isFetchingRef.current = false;
    }
  };

  /* ---------- AUTO FETCH (ONLY ON CHANGE) ---------- */

  useEffect(() => {
    refreshNotifCount();
  }, [user, guestId]);

  return (
    <NotificationContext.Provider
      value={{
        notifCount,
        refreshNotifCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification must be used inside NotificationProvider");
  }
  return ctx;
};