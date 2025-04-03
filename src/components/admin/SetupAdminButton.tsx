"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { setupAdminManager } from "@/lib/utils/setupAdminManager"
import { useState } from "react"
import { toast } from "sonner"

interface SetupAdminButtonProps {
  userId?: string // Optional: provide a specific user ID, otherwise uses current user
}

export function SetupAdminButton({ userId }: SetupAdminButtonProps) {
  const { currentUser, userData } = useAuth()
  const [loading, setLoading] = useState(false)

  // Use provided userId or fall back to current user's ID
  const targetUserId = userId || currentUser?.uid

  const handleSetupAdmin = async () => {
    if (!targetUserId) {
      toast.error("No user ID available")
      return
    }

    setLoading(true)
    try {
      const success = await setupAdminManager(targetUserId)
      if (success) {
        toast.success(`User is now the admin manager`)
        // Force page reload to update permissions
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch (error) {
      console.error("Error setting admin:", error)
      toast.error("Failed to set admin manager")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-md bg-amber-50 border-amber-200">
      <h3 className="font-medium mb-2">Admin Setup</h3>
      <p className="text-sm mb-4">
        {userId ? `Set user ID ${userId} as admin manager` : "Set current user as admin manager"}
      </p>
      <p className="text-xs mb-4 text-muted-foreground">Current user ID: {currentUser?.uid || "Not logged in"}</p>
      <Button
        onClick={handleSetupAdmin}
        disabled={loading || !targetUserId}
        className="bg-amber-600 hover:bg-amber-700"
      >
        {loading ? "Setting up..." : "Make Admin Manager"}
      </Button>
    </div>
  )
}

