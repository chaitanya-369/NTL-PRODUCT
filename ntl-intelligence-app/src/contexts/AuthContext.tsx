"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, User } from "firebase/auth"
import { auth, db } from "@/lib/firebase/client"
import { doc, onSnapshot } from "firebase/firestore"

interface AuthContextType {
  user: User | null
  role: string | null
  status: string | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  status: null,
  isLoading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        // Fetch role via Custom Claims (Token)
        const tokenResult = await currentUser.getIdTokenResult(true)
        setRole((tokenResult.claims.role as string) || "recruit")

        // Also listen to Firestore document for real-time status changes
        const unsubDoc = onSnapshot(doc(db, "users", currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setStatus(docSnap.data().status || "RECRUIT")
          }
        })
        
        setIsLoading(false)
        return () => unsubDoc()
      } else {
        setRole(null)
        setStatus(null)
        setIsLoading(false)
      }
    })

    return () => unsubscribeAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, status, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
