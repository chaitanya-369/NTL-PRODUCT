"use client"

import { useState } from "react"
import { GlowButton } from "@/components/ui/GlowButton"
import { TerminalText } from "@/components/ui/TerminalText"
import { useAuth } from "@/contexts/AuthContext"
import { doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

export default function OnboardingPage() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [github, setGithub] = useState("")
  const [discord, setDiscord] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNext = () => {
    if (step < 3) setStep(step + 1)
  }

  const handleComplete = async () => {
    if (!user) return
    setIsSubmitting(true)
    setError(null)
    
    try {
      const userRef = doc(db, "users", user.uid)
      
      await updateDoc(userRef, {
        "skillProfile.githubUrl": github,
        "skillProfile.skills": [],
        "skillProfile.skillScores": {},
        "skillProfile.primaryRole": "Unknown",
        "skillProfile.linkedinUrl": "",
        "skillProfile.resumeStorageRef": "",
        "skillProfile.lastProfileSync": Timestamp.now(),
        
        "hackathonHistory.totalParticipations": 0,
        "hackathonHistory.wins": 0,
        "hackathonHistory.winRate": 0,
        "hackathonHistory.totalPrizeMoney": 0,
        "hackathonHistory.contributionScore": 0,
        
        "notificationPreferences.discord": true,
        "notificationPreferences.slack": false,
        "notificationPreferences.email": true,
        "notificationPreferences.telegram": false,
        "notificationPreferences.whatsapp": false,
        "notificationPreferences.discordHandle": discord,
        "notificationPreferences.slackId": "",
        "notificationPreferences.telegramChatId": "",
        "notificationPreferences.whatsappNumber": "",
        
        updatedAt: Timestamp.now()
      })
      
      // Redirect to dashboard (they will see a "Pending Board Approval" screen because of their RECRUIT status)
      window.location.href = "/dashboard"
    } catch (err: any) {
      console.error("Failed to save onboarding data", err)
      setError(err.message)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex flex-col items-start gap-6 max-w-2xl w-full p-10 border border-border rounded-xl bg-surface/50 backdrop-blur-md">
        
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Welcome, Recruit.</h1>
          <p className="text-text-secondary text-lg mt-2">
            <TerminalText animate>AWAITING_SYSTEM_INITIALIZATION...</TerminalText>
          </p>
        </div>

        {/* Step 1: GitHub Integration */}
        {step === 1 && (
          <div className="w-full mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl text-primary font-semibold">1. Connect Developer Profile</h2>
            <p className="text-text-secondary">
              NTL Intelligence requires access to your GitHub to parse your skill matrix.
            </p>
            <input 
              type="url" 
              placeholder="https://github.com/username"
              className="w-full bg-surface-2 border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />
            <div className="pt-4">
              <GlowButton onClick={handleNext} disabled={!github}>Continue</GlowButton>
            </div>
          </div>
        )}

        {/* Step 2: Discord & Notifications */}
        {step === 2 && (
          <div className="w-full mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl text-primary font-semibold">2. Communication Relays</h2>
            <p className="text-text-secondary">
              Provide your Discord handle so the Agent can notify you of squad placements and critical alerts.
            </p>
            <input 
              type="text" 
              placeholder="Discord Handle (e.g., hacker#1234)"
              className="w-full bg-surface-2 border border-border rounded-md px-4 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              value={discord}
              onChange={(e) => setDiscord(e.target.value)}
            />
            <div className="pt-4 flex gap-4">
              <GlowButton variant="outline" onClick={() => setStep(1)}>Back</GlowButton>
              <GlowButton onClick={handleNext} disabled={!discord}>Continue</GlowButton>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="w-full mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-xl text-primary font-semibold">3. Verification Complete</h2>
            <div className="p-4 bg-surface-2 border border-border rounded-md font-mono text-sm space-y-2">
              <p><span className="text-text-secondary">USER:</span> {user?.email}</p>
              <p><span className="text-text-secondary">GITHUB:</span> {github}</p>
              <p><span className="text-text-secondary">DISCORD:</span> {discord}</p>
              <p><span className="text-text-secondary">STATUS:</span> <span className="text-warning">PENDING_BOARD_APPROVAL</span></p>
            </div>
            
            {error && <p className="text-danger mt-2">Error: {error}</p>}

            <p className="text-text-secondary mt-4">
              Your profile will be parsed by the AI agent shortly. The Board will review your clearance level.
            </p>
            <div className="pt-4 flex gap-4">
              <GlowButton variant="outline" onClick={() => setStep(2)}>Back</GlowButton>
              <GlowButton onClick={handleComplete} disabled={isSubmitting}>
                {isSubmitting ? "INITIALIZING..." : "Enter System"}
              </GlowButton>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
