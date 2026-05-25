"use client"

import { useState } from "react"
import { signInWithGoogle } from "@/lib/firebase/auth"
import { db } from "@/lib/firebase/client"
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore"
import { setAuthCookies } from "@/app/actions/auth"
import { GlowButton } from "@/components/ui/GlowButton"
import { TerminalText } from "@/components/ui/TerminalText"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const user = await signInWithGoogle()
      const token = await user.getIdToken()
      
      const userDocRef = doc(db, "users", user.uid)
      const userDocSnap = await getDoc(userDocRef)
      
      let role = "recruit"
      let status = "RECRUIT"

      if (!userDocSnap.exists()) {
        // Break the deadlock: Immediately create the user's base document
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          role: "recruit",
          labAffiliation: "None",
          status: "RECRUIT",
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          approvedBy: null
        })
      } else {
        const data = userDocSnap.data()
        role = data.role || "recruit"
        status = data.status || "RECRUIT"
      }
      
      // Securely set cookies for Edge Middleware via Server Action
      await setAuthCookies(token, role)
      
      // Dynamic routing
      if (status === "RECRUIT") {
        window.location.href = "/onboarding"
      } else if (role === "board_lead" || role === "super_admin") {
        window.location.href = "/war-room"
      } else {
        window.location.href = "/dashboard"
      }
      
    } catch (err: any) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-8 text-center max-w-md w-full p-8 border border-border rounded-xl bg-surface/50 backdrop-blur-md">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">NTL Intelligence</h1>
          <p className="text-text-secondary mb-6">
            <TerminalText>INITIALIZING_ACCESS_PROTOCOL...</TerminalText>
          </p>
        </div>

        <GlowButton 
          onClick={handleLogin} 
          disabled={isLoading} 
          className="w-full h-12 text-lg"
        >
          {isLoading ? "AUTHENTICATING..." : "Authenticate via Google"}
        </GlowButton>

        {error && (
          <p className="text-danger mt-4 text-sm font-mono border-l-2 border-danger pl-2 text-left w-full">
            ERROR: {error}
          </p>
        )}
      </div>
    </div>
  )
}
