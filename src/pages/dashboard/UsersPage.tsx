"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { Navigate } from "react-router-dom"
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User, UserRole } from "@/lib/types"
import { Users, Search, UserCog, Shield, UserIcon, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function UsersPage() {
  const { userData, isAdminManager } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [shouldFetch, setShouldFetch] = useState(false)

  // Only managers should access this page
  if (userData?.role !== "manager") {
    return <Navigate to="/dashboard" />
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const usersRef = collection(db, "users")
      const querySnapshot = await getDocs(usersRef)

      const fetchedUsers: User[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        fetchedUsers.push({
          id: doc.id,
          email: data.email,
          displayName: data.displayName,
          role: data.role || "user",
          isAdmin: data.isAdmin || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        })
      })

      setUsers(fetchedUsers)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (shouldFetch) {
      setShouldFetch(false)
      // Trigger user refetch after role or admin status update
      const timer = setTimeout(() => {
        fetchUsers()
      }, 500) // Delay to avoid immediate re-fetching

      return () => clearTimeout(timer)
    }
  }, [shouldFetch, fetchUsers])

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    // Check if the current user has admin privileges for downgrading managers
    const isAdmin = isAdminManager()
    const targetUser = users.find((user) => user.id === userId)

    // Only admin can downgrade a manager to user
    if (targetUser?.role === "manager" && newRole === "user" && !isAdmin) {
      toast.error("Only admin managers can downgrade managers to users")
      return
    }

    // Regular managers can promote users to managers
    if (targetUser?.role === "user" && newRole === "manager") {
      try {
        const userRef = doc(db, "users", userId)
        await updateDoc(userRef, {
          role: newRole,
          updatedAt: new Date(),
        })

        setUsers((prev) =>
          prev.map((user) => (user.id === userId ? { ...user, role: newRole, updatedAt: new Date() } : user)),
        )

        toast.success(`User promoted to ${newRole}`)
        setShouldFetch(true)
      } catch (error) {
        console.error("Error updating user role:", error)
        toast.error("Failed to update user role")
      }
      return
    }

    // For all other role changes, require admin privileges
    if (!isAdmin) {
      toast.error("Only admin managers can perform this role change")
      return
    }

    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date(),
      })

      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, role: newRole, updatedAt: new Date() } : user)),
      )

      toast.success(`User role updated to ${newRole}`)
    } catch (error) {
      console.error("Error updating user role:", error)
      toast.error("Failed to update user role")
    }
    setShouldFetch(true)
  }

  const handleSetAdminStatus = async (userId: string, isAdmin: boolean) => {
    // Check if the current user has admin privileges
    if (!isAdminManager()) {
      toast.error("Only the admin manager can set admin privileges")
      return
    }

    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        isAdmin: isAdmin,
        updatedAt: new Date(),
      })

      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, isAdmin, updatedAt: new Date() } : user)))

      toast.success(isAdmin ? "User is now the admin manager" : "Admin privileges removed")

      // If setting a new admin manager, provide warning
      if (isAdmin && userData?.uid !== userId) {
        toast.warning("Warning: You've transferred admin privileges to another manager")
      }
    } catch (error) {
      console.error("Error updating admin status:", error)
      toast.error("Failed to update admin status")
    }
    setShouldFetch(true)
  }

  // New function to delete a user
  const handleDeleteUser = async (userId: string, userName: string) => {
    // Only admin can delete users
    if (!isAdminManager()) {
      toast.error("Only admin managers can delete users")
      return
    }

    // Prevent deleting yourself
    if (userId === userData?.uid) {
      toast.error("You cannot delete your own account")
      return
    }

    try {
      const userRef = doc(db, "users", userId)
      await deleteDoc(userRef)

      setUsers((prev) => prev.filter((user) => user.id !== userId))
      toast.success(`User ${userName} has been deleted`)
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Failed to delete user")
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleBadge = (user: User) => {
    if (user.role === "manager") {
      return (
        <div className="flex items-center gap-1">
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Manager</Badge>
          {user.isAdmin && <Badge className="bg-amber-100 text-amber-800">Admin</Badge>}
        </div>
      )
    } else if (user.role === "user") {
      return <Badge variant="outline">User</Badge>
    } else {
      return <Badge variant="outline">General</Badge>
    }
  }

  // Determine if current user is the admin manager
  const isCurrentUserAdmin = isAdminManager()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

      {!isCurrentUserAdmin && (
        <div className="mb-6 p-4 border border-yellow-200 rounded-lg bg-yellow-50">
          <div className="flex items-start gap-2">
            <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-800">Limited Access</h3>
              <p className="text-sm text-yellow-700">
                As a regular manager, you can only promote users to managers. Only the admin manager can downgrade
                managers, set admin privileges, or delete users.
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <CardTitle>System Users</CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-10">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No users found</h3>
              <p className="text-muted-foreground">Try adjusting your search</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {user.displayName || "N/A"}
                          {user.isAdmin && <Star className="h-4 w-4 text-amber-500" />}
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <UserCog className="h-4 w-4 mr-2" />
                              Manage
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {/* Role management */}
                            {user.role === "user" && (
                              <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "manager")}>
                                <Shield className="h-4 w-4 mr-2" />
                                Promote to Manager
                              </DropdownMenuItem>
                            )}

                            {/* Only admin can downgrade managers */}
                            {isCurrentUserAdmin && user.role === "manager" && (
                              <DropdownMenuItem onClick={() => handleUpdateRole(user.id, "user")}>
                                <UserIcon className="h-4 w-4 mr-2" />
                                Downgrade to User
                              </DropdownMenuItem>
                            )}

                            {/* Admin management - only for manager accounts and only if current user is admin */}
                            {isCurrentUserAdmin && user.role === "manager" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuLabel>Admin Status</DropdownMenuLabel>

                                {/* Make admin option */}
                                {!user.isAdmin && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-amber-600">
                                        <Star className="h-4 w-4 mr-2" />
                                        Make Admin Manager
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Transfer Admin Privileges</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          You are about to make {user.displayName || user.email} the admin manager. They
                                          will be able to promote/demote users. You will lose this ability unless they
                                          grant it back to you.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleSetAdminStatus(user.id, true)}
                                          className="bg-amber-600 hover:bg-amber-700"
                                        >
                                          Transfer Admin
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}

                                {/* Remove admin option (only if not the current user) */}
                                {user.isAdmin && userData?.uid !== user.id && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                        <Shield className="h-4 w-4 mr-2" />
                                        Remove Admin Status
                                      </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Remove Admin Privileges</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          You are about to remove admin privileges from {user.displayName || user.email}
                                          . They will no longer be able to promote or demote users.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleSetAdminStatus(user.id, false)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Remove Admin
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                              </>
                            )}

                            {/* Delete user option - only for admin */}
                            {isCurrentUserAdmin && userData?.uid !== user.id && (
                              <>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete User
                                    </DropdownMenuItem>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete User</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        You are about to permanently delete {user.displayName || user.email}. This
                                        action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDeleteUser(user.id, user.displayName || user.email || "User")
                                        }
                                        className="bg-red-600 hover:bg-red-700"
                                      >
                                        Delete User
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </>
                            )}

                            {/* Show a notice if not an admin */}
                            {!isCurrentUserAdmin && user.role === "manager" && (
                              <DropdownMenuItem disabled className="text-muted-foreground">
                                <Shield className="h-4 w-4 mr-2" />
                                Only admin can manage managers
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

