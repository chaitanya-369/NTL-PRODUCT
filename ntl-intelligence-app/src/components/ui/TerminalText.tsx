import * as React from "react"
import { cn } from "@/lib/utils"

export interface TerminalTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  animate?: boolean
}

function TerminalText({ className, children, animate = false, ...props }: TerminalTextProps) {
  return (
    <span
      className={cn(
        "font-mono text-secondary",
        animate && "animate-pulse",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { TerminalText }
