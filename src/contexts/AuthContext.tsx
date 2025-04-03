"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { toast } from "sonner"
import type { UserRole } from "@/lib/types"

interface UserData {
  uid: string
  email: string | null
  displayName: string | null
  role: UserRole
  isAdmin?: boolean
}

interface AuthContextType {
  currentUser: User | null
  userData: UserData | null
  loading: boolean
  signUp: (email: string, password: string, name: string, role?: UserRole) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  getUserRole: () => UserRole
  isAdminManager: () => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed - Current user:", user?.email)
      setCurrentUser(user)

      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid)
          const userDoc = await getDoc(userDocRef)

          console.log("Fetched user document:", userDoc.exists() ? "exists" : "does not exist")

          if (userDoc.exists()) {
            const userDocData = userDoc.data()
            console.log("User document data:", userDocData)

            // Explicitly verify we're getting the role
            const userRole = userDocData.role || "user"
            console.log("User role from Firestore:", userRole)

            const userData = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              role: userRole,
              isAdmin: userDocData.isAdmin || false,
            }

            setUserData(userData)
            console.log("UserData state set to:", userData)
          } else {
            // This is a fallback if the user document doesn't exist
            console.log("User document does not exist, creating default user document")
            const newUserData = {
              email: user.email,
              displayName: user.displayName,
              role: "user" as UserRole,
              isAdmin: false,
            }
            await setDoc(doc(db, "users", user.uid), newUserData)
            setUserData({
              uid: user.uid,
              ...newUserData,
            })
          }
        } catch (error) {
          console.error("Error fetching user data", error)
          toast.error("Error loading user data")
        }
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signUp = async (email: string, password: string, name: string, role: UserRole = "user") => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      await updateProfile(user, { displayName: name })

      // Make sure we're explicitly setting the role in Firestore
      const userData = {
        email: email,
        displayName: name,
        role: role,
        isAdmin: false, // New users are never admin by default
      }

      console.log("Creating user with role:", role)
      await setDoc(doc(db, "users", user.uid), userData)
      console.log("User created with role:", role)

      // Force update userData state
      setUserData({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: role,
        isAdmin: false,
      })

      toast.success("Account created successfully!")
    } catch (error: any) {
      console.error("Error signing up:", error)
      let errorMessage = "Failed to create account"
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email already in use"
      }
      toast.error(errorMessage)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success("Signed in successfully!")
    } catch (error: any) {
      console.error("Error signing in:", error)
      let errorMessage = "Failed to sign in"
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password"
      }
      toast.error(errorMessage)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      toast.success("Signed out successfully")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out")
      throw error
    }
  }

  const getUserRole = (): UserRole => {
    if (!userData) {
      console.log('getUserRole: userData is null, returning "general"')
      return "general"
    }

    console.log("getUserRole called, returning:", userData.role)
    return userData.role
  }

  // New method to check if current user is an admin manager
  const isAdminManager = (): boolean => {
    if (!userData) {
      return false
    }

    console.log("isAdminManager check:", {
      role: userData.role,
      isAdmin: userData.isAdmin,
      result: userData.role === "manager" && userData.isAdmin === true,
    })

    return userData.role === "manager" && userData.isAdmin === true
  }

  const value = {
    currentUser,
    userData,
    loading,
    signUp,
    signIn,
    signOut,
    getUserRole,
    isAdminManager,
  }

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}

