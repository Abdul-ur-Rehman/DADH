import React from "react"
import { cn } from "../../lib/utils"
import { Label } from "./Label"

function FormField({ label, htmlFor, error, helper, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? <Label htmlFor={htmlFor}>{label}</Label> : null}
      {children}
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : helper ? (
        <p className="text-sm text-muted-foreground">{helper}</p>
      ) : null}
    </div>
  )
}

export { FormField }
export default FormField
