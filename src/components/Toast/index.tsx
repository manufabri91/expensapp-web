'use client';

import { useToaster } from '@/components/Toast/ToastProvider';
import { Toast as FlowbiteToast } from 'flowbite-react';
import { HiCheck, HiExclamationTriangle, HiInformationCircle, HiXMark } from 'react-icons/hi2';

export enum ToastType {
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
  Info = 'info',
}

export interface ToastConfig {
  message: string;
  type: ToastType;
}

export function Toast() {
  const { toastData, clearToast } = useToaster();
  if (!toastData) {
    return null;
  }
  return (
    <FlowbiteToast
      className="fixed bottom-9 z-[999] self-center"
      theme={{
        root: {
          base: 'flex w-full max-w-lg items-center rounded-lg bg-white p-4 text-gray-600 shadow dark:bg-gray-800 dark:text-gray-300',
          closed: 'opacity-0 ease-out',
        },
      }}
    >
      {toastData.type === ToastType.Success && (
        <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-700 dark:text-green-200">
          <HiCheck className="size-5" />
        </div>
      )}
      {toastData.type === ToastType.Error && (
        <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200">
          <HiXMark className="size-5" />
        </div>
      )}
      {toastData.type === ToastType.Warning && (
        <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-500 dark:bg-orange-700 dark:text-orange-200">
          <HiExclamationTriangle className="size-5" />
        </div>
      )}
      {toastData.type === ToastType.Info && (
        <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100 text-cyan-500 dark:bg-cyan-800 dark:text-cyan-200">
          <HiInformationCircle className="size-5" />
        </div>
      )}
      <div className="ml-3 text-sm font-semibold">{toastData.message}</div>
      <FlowbiteToast.Toggle onDismiss={clearToast} />
    </FlowbiteToast>
  );
}
