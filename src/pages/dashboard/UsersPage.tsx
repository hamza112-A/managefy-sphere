"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"
import { Navigate } from "react-router-dom"
import { collection, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User, UserRole } from "@/lib/types"
import { Users, Search, UserCog, Shield, UserIcon } from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function UsersPage() {
  const { userData } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [shouldFetch, setShouldFetch] = useState(true)

  // Only managers should access this page
  if (userData?.role !== "manager") {
    return <Navigate to="/dashboard" />
  }

  useEffect(() => {
    if (shouldFetch) {
      const fetchUsers = async () => {
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
          setShouldFetch(false)
        }
      }

      fetchUsers()
    }
  }, [shouldFetch])

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
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

  const filteredUsers = users.filter(
    (user) =>
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "manager":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Manager</Badge>
      case "user":
        return <Badge variant="outline">User</Badge>
      default:
        return <Badge variant="outline">General</Badge>
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">User Management</h1>

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
                      <TableCell className="font-medium">{user.displayName || "N/A"}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <UserCog className="h-4 w-4 mr-2" />
                              Manage
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(user.id, "user")}
                              disabled={user.role === "user"}
                            >
                              <UserIcon className="h-4 w-4 mr-2" />
                              Set as User
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleUpdateRole(user.id, "manager")}
                              disabled={user.role === "manager"}
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Set as Manager
                            </DropdownMenuItem>
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

