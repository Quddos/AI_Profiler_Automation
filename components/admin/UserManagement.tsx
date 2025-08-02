"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Trash, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface User {
  id: number
  name: string
  email: string
  role: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("user")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError("")
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        setError("Failed to fetch users.")
      }
    } catch (err) {
      setError("An error occurred while fetching users.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = () => {
    setCurrentUser(null)
    setName("")
    setEmail("")
    setPassword("")
    setRole("user")
    setIsModalOpen(true)
  }

  const handleEditUser = (user: User) => {
    setCurrentUser(user)
    setName(user.name)
    setEmail(user.email)
    setPassword("") // Password is not pre-filled for security
    setRole(user.role)
    setIsModalOpen(true)
  }

  const handleDeleteUser = async (id: number) => {
    if (
      !confirm("Are you sure you want to delete this user? This will also delete all their assigned cards and files.")
    )
      return
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/users/${id}`, { method: "DELETE" })
      if (response.ok) {
        fetchUsers()
      } else {
        setError("Failed to delete user.")
      }
    } catch (err) {
      setError("An error occurred while deleting user.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const method = currentUser ? "PUT" : "POST"
    const url = currentUser ? `/api/users/${currentUser.id}` : "/api/users"

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      })

      if (response.ok) {
        setIsModalOpen(false)
        fetchUsers()
      } else {
        const errorData = await response.json()
        setError(errorData.message || `Failed to ${currentUser ? "update" : "create"} user.`)
      }
    } catch (err) {
      setError(`An error occurred while ${currentUser ? "updating" : "creating"} user.`)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>Manage user accounts and assign roles.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Button onClick={handleAddUser} className="animate-pulse-yellow">
            <Plus className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            <span className="ml-2 text-gray-600">Loading users...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No users found. Start by adding a new user!</div>
        ) : (
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
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteUser(user.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {currentUser ? "Edit the user's details." : "Create a new user account."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                required={!currentUser}
                placeholder={currentUser ? "Leave blank to keep current" : ""}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : currentUser ? (
                  "Save Changes"
                ) : (
                  "Create User"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
