import { getDoc, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { toast } from "sonner"

/**
 * A utility function to set up the first manager as the admin manager
 * Run this manually from a component when needed
 */
export async function setupAdminManager(userId: string) {
  try {
    // Check if the user exists and is a manager
    const userRef = doc(db, "users", userId)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      toast.error("User not found")
      return false
    }

    const userData = userDoc.data()

    // If user is not a manager, make them one
    if (userData.role !== "manager") {
      await updateDoc(userRef, {
        role: "manager",
        updatedAt: new Date(),
      })
      toast.info("User has been promoted to manager")
    }

    // Check if there's already an admin manager
    if (userData.isAdmin) {
      toast.info("This user is already the admin manager")
      return true
    }

    // Set this user as admin
    await updateDoc(userRef, {
      role: "manager", // Ensure they're a manager
      isAdmin: true,
      updatedAt: new Date(),
    })

    toast.success("Admin manager set successfully")
    return true
  } catch (error) {
    console.error("Error setting admin manager:", error)
    toast.error("Failed to set admin manager")
    return false
  }
}

