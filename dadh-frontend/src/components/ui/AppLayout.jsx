import React from "react"
import { cn } from "../../lib/utils"

function AppLayout({ children, className }) {
  return (
    <div className={cn("dadh-tw-root min-h-screen bg-background text-foreground", className)}>
      {children}
    </div>
  )
}

export { AppLayout }
export default AppLayout
