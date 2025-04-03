"use client"

import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"
import { useState } from "react"

export function AdminDebugger() {
  const { currentUser, userData, isAdminManager } = useAuth()
  const [loading, setLoading] = useState(false)
  const [userDoc, setUserDoc] = useState<any>(null)

  const fetchUserDocument = async () => {
    if (!currentUser) {
      toast.error("No user logged in")
      return
    }

    setLoading(true)
    try {
      const userRef = doc(db, "users", currentUser.uid)
      const docSnap = await getDoc(userRef)

      if (docSnap.exists()) {
        setUserDoc(docSnap.data())
        toast.success("User document fetched")
      } else {
        toast.error("User document not found")
      }
    } catch (error) {
      console.error("Error fetching user doc:", error)
      toast.error("Failed to fetch user document")
    } finally {
      setLoading(false)
    }
  }

  const forceSetAdmin = async () => {
    if (!currentUser) {
      toast.error("No user logged in")
      return
    }

    setLoading(true)
    try {
      const userRef = doc(db, "users", currentUser.uid)
      await updateDoc(userRef, {
        role: "manager",
        isAdmin: true,
        updatedAt: new Date(),
      })

      toast.success("Admin status forced - please refresh the page")
      setTimeout(() => window.location.reload(), 2000)
    } catch (error) {
      console.error("Error setting admin:", error)
      toast.error("Failed to set admin status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800">Admin Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <p>
            <strong>User ID:</strong> {currentUser?.uid || "Not logged in"}
          </p>
          <p>
            <strong>Email:</strong> {userData?.email || "N/A"}
          </p>
          <p>
            <strong>Role:</strong> {userData?.role || "N/A"}
          </p>
          <p>
            <strong>Is Admin (from userData):</strong> {userData?.isAdmin ? "Yes" : "No"}
          </p>
          <p>
            <strong>isAdminManager() returns:</strong> {isAdminManager() ? "Yes" : "No"}
          </p>

          {userDoc && (
            <div className="mt-4 p-2 bg-white rounded border border-red-200">
              <p className="font-bold">Raw User Document:</p>
              <pre className="text-xs overflow-auto max-h-40">{JSON.stringify(userDoc, null, 2)}</pre>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button onClick={fetchUserDocument} disabled={loading} variant="outline" className="flex-1">
            Fetch User Doc
          </Button>

          <Button onClick={forceSetAdmin} disabled={loading} variant="destructive" className="flex-1">
            Force Admin Status
          </Button>
        </div>

        <p className="text-xs text-red-600">
          Note: After using "Force Admin Status", you'll need to refresh the page for changes to take effect.
        </p>
      </CardContent>
    </Card>
  )
}

