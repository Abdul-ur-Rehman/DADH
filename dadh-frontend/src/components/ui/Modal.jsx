import React, { useEffect, useCallback } from "react"
import ReactDOM from "react-dom"
import { cn } from "../../lib/utils"

function Modal({ open, onClose, className, children }) {
  const handleBackdrop = useCallback(
    (e) => { if (e.target === e.currentTarget) onClose?.() },
    [onClose]
  )

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e) => { if (e.key === "Escape") onClose?.() }
    document.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener("keydown", onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fade-in"
      onClick={handleBackdrop}
    >
      <div
        className={cn(
          "relative w-full max-w-lg bg-card text-card-foreground rounded-lg shadow-lg border border-border",
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

function ModalHeader({ className, ...props }) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6 pb-0", className)}
      {...props}
    />
  )
}

function ModalTitle({ className, ...props }) {
  return (
    <h2
      className={cn("text-lg font-semibold leading-none tracking-tight text-foreground", className)}
      {...props}
    />
  )
}

function ModalDescription({ className, ...props }) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

function ModalBody({ className, ...props }) {
  return (
    <div className={cn("p-6", className)} {...props} />
  )
}

function ModalFooter({ className, ...props }) {
  return (
    <div
      className={cn("flex items-center justify-end gap-2 p-6 pt-0", className)}
      {...props}
    />
  )
}

function ModalClose({ onClose, className, ...props }) {
  return (
    <button
      type="button"
      onClick={onClose}
      className={cn(
        "absolute right-4 top-4 rounded-sm text-muted-foreground hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors",
        className
      )}
      aria-label="Close"
      {...props}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    </button>
  )
}

export { Modal, ModalHeader, ModalTitle, ModalDescription, ModalBody, ModalFooter, ModalClose }
export default Modal
