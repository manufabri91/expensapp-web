'use client';

import { ToastConfig, ToastType } from '@/components/Toast';
import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react';

interface ToastContextProps {
  showToast: (message: string, type?: ToastType, delay?: number) => void;
  clearToast: () => void;
  toastData: ToastConfig | undefined;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toastData, setToastData] = useState<ToastConfig | undefined>();
  const [isCleanup, setIsCleanup] = useState<boolean>(false);
  const [timeoutRef, setTimeoutRef] = useState<NodeJS.Timeout | null>(null);

  const showToast = useMemo(
    () =>
      (message: string, type = ToastType.Info, delay = 10000) => {
        setToastData({ message, type });
        const timeout = setTimeout(() => {
          setToastData(undefined);
        }, delay);
        setTimeoutRef(timeout);
      },
    [setToastData, setTimeoutRef]
  );

  const clearToast = useMemo(
    () => () => {
      setToastData(undefined);
      setIsCleanup(true);
    },
    [setToastData]
  );

  useEffect(() => {
    if (isCleanup && timeoutRef) {
      clearTimeout(timeoutRef);
      setTimeoutRef(null);
      setIsCleanup(false);
    }
  }, [isCleanup, timeoutRef]);

  return <ToastContext.Provider value={{ showToast, clearToast, toastData }}>{children}</ToastContext.Provider>;
};

export const useToaster = (): ToastContextProps => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
