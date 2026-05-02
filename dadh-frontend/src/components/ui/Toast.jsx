import React, { createContext, useContext, useCallback, useState } from "react"
import ReactDOM from "react-dom"
import { cn } from "../../lib/utils"

const ToastContext = createContext(null)

let _id = 0

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ title, description, variant = "default", duration = 4000 }) => {
    const id = ++_id
    setToasts((prev) => [...prev, { id, title, description, variant }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {ReactDOM.createPortal(
        <Toaster toasts={toasts} onDismiss={dismiss} />,
        document.body
      )}
    </ToastContext.Provider>
  )
}

function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>")
  return ctx
}

const variantStyles = {
  default: "bg-card border-border text-foreground",
  success: "bg-success text-success-foreground border-success/30",
  destructive: "bg-destructive text-destructive-foreground border-destructive/30",
}

function Toaster({ toasts, onDismiss }) {
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "relative flex flex-col gap-0.5 rounded-lg border px-4 py-3 shadow-md animate-fade-in",
            variantStyles[t.variant] ?? variantStyles.default
          )}
        >
          {t.title && (
            <p className="text-sm font-semibold leading-none">{t.title}</p>
          )}
          {t.description && (
            <p className="text-sm opacity-90">{t.description}</p>
          )}
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="absolute right-2 top-2 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M11 3L3 11M3 3l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

export { ToastProvider, useToast, Toaster }
export default ToastProvider
