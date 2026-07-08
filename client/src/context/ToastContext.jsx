/**
 * Toast notification system
 * --------------------------
 * Lightweight, zero-dependency toast using CSS animations.
 * Import { useToast, ToastContainer } and place <ToastContainer /> in the layout.
 */
import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle className="h-5 w-5 text-emerald-400" />,
  error:   <XCircle    className="h-5 w-5 text-red-400"     />,
  warning: <AlertCircle className="h-5 w-5 text-amber-400"  />,
  info:    <Info        className="h-5 w-5 text-blue-400"   />,
};

const BG = {
  success: "border-emerald-500/30 bg-emerald-500/10",
  error:   "border-red-500/30     bg-red-500/10",
  warning: "border-amber-500/30   bg-amber-500/10",
  info:    "border-blue-500/30    bg-blue-500/10",
};

let _id = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++_id;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      {/* Toast container — fixed bottom-right */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 pointer-events-auto
              rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm
              animate-slide-in max-w-sm ${BG[t.type]}`}
          >
            <span className="mt-0.5 shrink-0">{ICONS[t.type]}</span>
            <p className="text-sm text-white/90 leading-snug flex-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="shrink-0 text-white/50 hover:text-white/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx.toast;
}
