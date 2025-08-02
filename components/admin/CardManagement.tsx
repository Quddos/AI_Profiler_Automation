"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"

interface User {
  id: number
  name: string
  email: string
}

interface CardData {
  id: number
  title: string
  description: string
  type: string
  progress: number
  assigned_user_id: number
  assigned_user_name: string
  assigned_user_email: string
  created_at: string
}

const CARD_TYPES = [
  "LinkedIn",
  "TEFL Certificate",
  "Bachelor Degree",
  "University Applied",
  "Internships",
  "Recommendation",
  "Profile Details",
]

export function CardManagement() {
  const [cards, setCards] = useState<CardData[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCard, setEditingCard] = useState<CardData | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    assigned_user_id: "",
    progress: 0,
  })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchCards()
    fetchUsers()
  }, [])

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/cards")
      if (response.ok) {
        const data = await response.json()
        setCards(data.cards)
      }
    } catch (error) {
      console.error("Error fetching cards:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users.filter((user: User) => user.role === "user"))
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const url = editingCard ? `/api/cards/${editingCard.id}` : "/api/cards"
      const method = editingCard ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          assigned_user_id: formData.assigned_user_id ? Number.parseInt(formData.assigned_user_id) : null,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        await fetchCards()
        setDialogOpen(false)
        resetForm()
      } else {
        setError(data.error || "An error occurred")
      }
    } catch (error) {
      setError("An error occurred")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (card: CardData) => {
    setEditingCard(card)
    setFormData({
      title: card.title,
      description: card.description,
      type: card.type,
      assigned_user_id: card.assigned_user_id?.toString() || "0",
      progress: card.progress,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (cardId: number) => {
    if (!confirm("Are you sure you want to delete this card?")) return

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchCards()
      }
    } catch (error) {
      console.error("Error deleting card:", error)
    }
  }

  const resetForm = () => {
    setFormData({ title: "", description: "", type: "", assigned_user_id: "0", progress: 0 })
    setEditingCard(null)
    setError("")
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Card Management</CardTitle>
            <CardDescription>Create and manage user profile cards</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="animate-pulse-yellow">
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingCard ? "Edit Card" : "Add New Card"}</DialogTitle>
                <DialogDescription>
                  {editingCard ? "Update card information" : "Create a new profile card"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select card type" />
                      </SelectTrigger>
                      <SelectContent>
                        {CARD_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="assigned_user">Assign to User</Label>
                    <Select
                      value={formData.assigned_user_id}
                      onValueChange={(value) => setFormData({ ...formData, assigned_user_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Unassigned</SelectItem>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="progress">Progress ({formData.progress}%)</Label>
                    <Input
                      id="progress"
                      type="range"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={(e) => setFormData({ ...formData, progress: Number.parseInt(e.target.value) })}
                      className="mt-2"
                    />
                    <Progress value={formData.progress} className="mt-2" />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {editingCard ? "Updating..." : "Creating..."}
                      </>
                    ) : editingCard ? (
                      "Update Card"
                    ) : (
                      "Create Card"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Assigned User</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.map((card) => (
              <TableRow key={card.id} className="animate-fade-in">
                <TableCell className="font-medium">{card.title}</TableCell>
                <TableCell>
                  <Badge variant="outline">{card.type}</Badge>
                </TableCell>
                <TableCell>
                  {card.assigned_user_name ? (
                    <div>
                      <div className="font-medium">{card.assigned_user_name}</div>
                      <div className="text-sm text-gray-500">{card.assigned_user_email}</div>
                    </div>
                  ) : (
                    <span className="text-gray-400">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Progress value={card.progress} className="w-16" />
                    <span className="text-sm font-medium">{card.progress}%</span>
                  </div>
                </TableCell>
                <TableCell>{new Date(card.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(card)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(card.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
