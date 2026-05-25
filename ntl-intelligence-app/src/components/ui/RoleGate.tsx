"use client"

import * as React from "react"
import { useAuth } from "@/contexts/AuthContext"

export interface RoleGateProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallback?: React.ReactNode
}

function RoleGate({ children, allowedRoles, fallback = null }: RoleGateProps) {
  const { role, isLoading } = useAuth()

  if (isLoading) return null

  if (!role || !allowedRoles.includes(role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

export { RoleGate }
