import React from "react"
import { cn } from "../../lib/utils"

const Avatar = React.forwardRef(function Avatar({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    />
  )
})

const AvatarImage = React.forwardRef(function AvatarImage(
  { className, src, alt = "", onError, ...props },
  ref
) {
  const [failed, setFailed] = React.useState(false)

  if (failed || !src) return null

  return (
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={cn("h-full w-full object-cover", className)}
      onError={() => { setFailed(true); onError?.() }}
      {...props}
    />
  )
})

const AvatarFallback = React.forwardRef(function AvatarFallback(
  { className, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        "absolute inset-0 flex items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-medium select-none",
        className
      )}
      {...props}
    />
  )
})

export { Avatar, AvatarImage, AvatarFallback }
export default Avatar
