"use client";

import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AlertLevel = "normal" | "warning" | "critical";

export type AlertStateContextValue = {
  isAlert: boolean;
  setIsAlert: Dispatch<SetStateAction<boolean>>;
  alertLevel: AlertLevel;
  setAlertLevel: Dispatch<SetStateAction<AlertLevel>>;
};

export const AlertStateContext = createContext<
  AlertStateContextValue | undefined
>(undefined);

export function AlertStateProvider({
  children,
  initialAlert = false,
  initialLevel = "normal",
}: {
  children: ReactNode;
  initialAlert?: boolean;
  initialLevel?: AlertLevel;
}) {
  const [isAlert, setIsAlert] = useState(initialAlert);
  const [alertLevel, setAlertLevel] = useState<AlertLevel>(initialLevel);

  useEffect(() => {
    setIsAlert(initialAlert);
  }, [initialAlert]);

  useEffect(() => {
    setAlertLevel(initialLevel);
  }, [initialLevel]);

  // Update body background based on alert level
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("alert-normal", "alert-warning", "alert-critical");
    root.classList.add(`alert-${alertLevel}`);
  }, [alertLevel]);

  const value = useMemo(
    () => ({
      isAlert,
      setIsAlert,
      alertLevel,
      setAlertLevel,
    }),
    [isAlert, alertLevel],
  );

  return (
    <AlertStateContext.Provider value={value}>
      {children}
    </AlertStateContext.Provider>
  );
}

export function useAlertState() {
  const context = useContext(AlertStateContext);
  if (!context) {
    throw new Error("useAlertState must be used within an AlertStateProvider");
  }
  return context;
}
