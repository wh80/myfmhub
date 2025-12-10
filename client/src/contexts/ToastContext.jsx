import React, { createContext, useRef } from "react";
import { Toast } from "primereact/toast";

const ToastContext = createContext(); // Remove export here

export default function ToastProvider({ children }) {
  const toastRef = useRef(null);

  const toast = {
    success: (message) => {
      toastRef.current?.show({
        severity: "success",
        summary: "Success",
        detail: message,
        life: 3000,
      });
    },
    error: (message) => {
      toastRef.current?.show({
        severity: "error",
        summary: "Error",
        detail: message,
        life: 3000,
      });
    },
    info: (message) => {
      toastRef.current?.show({
        severity: "info",
        summary: "Info",
        detail: message,
        life: 3000,
      });
    },
    warn: (message) => {
      toastRef.current?.show({
        severity: "warn",
        summary: "Warning",
        detail: message,
        life: 3000,
      });
    },
  };

  return (
    <ToastContext.Provider value={toast}>
      <Toast ref={toastRef} />
      {children}
    </ToastContext.Provider>
  );
}

// Export this so useToast hook can access it
export { ToastContext };
