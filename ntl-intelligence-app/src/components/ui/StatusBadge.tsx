import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      status: {
        AVAILABLE: "border-transparent bg-primary/10 text-primary",
        REVIEWING: "border-transparent bg-warning/10 text-warning",
        LOCKED: "border-transparent bg-danger/10 text-danger",
        RECRUIT: "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      status: "RECRUIT",
    },
  }
)

export interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusBadgeVariants> {}

function StatusBadge({ className, status, ...props }: StatusBadgeProps) {
  return (
    <div className={cn(statusBadgeVariants({ status }), className)} {...props}>
      {status}
    </div>
  )
}

export { StatusBadge, statusBadgeVariants }
