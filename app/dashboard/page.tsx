"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Shield, LogOut, FileText, Upload, ExternalLink, Loader2 } from "lucide-react"
import { CardDetailModal } from "@/components/user/CardDetailModal"

interface User {
  id: number
  name: string
  email: string
  role: string
}

interface CardData {
  id: number
  title: string
  description: string
  type: string
  progress: number
  created_at: string
  details: any[]
  files: any[]
}

export default function UserDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [cards, setCards] = useState<CardData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCard, setSelectedCard] = useState<CardData | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/check")
      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          setUser(data.user)
          await fetchCards()
        } else {
          router.push("/login")
        }
      } else {
        router.push("/login")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const fetchCards = async () => {
    try {
      const response = await fetch("/api/cards")
      if (response.ok) {
        const data = await response.json()
        setCards(data.cards)
      }
    } catch (error) {
      console.error("Error fetching cards:", error)
    }
  }

  const handleCardClick = async (card: CardData) => {
    try {
      const response = await fetch(`/api/cards/${card.id}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedCard(data.card)
        setModalOpen(true)
      }
    } catch (error) {
      console.error("Error fetching card details:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.href = "/login"
    } catch (error) {
      console.error("Logout error:", error)
      window.location.href = "/login"
    }
  }

  const getCardIcon = (type: string) => {
    switch (type) {
      case "LinkedIn":
        return "💼"
      case "TEFL Certificate":
        return "📜"
      case "Bachelor Degree":
        return "🎓"
      case "University Applied":
        return "🏫"
      case "Internships":
        return "💼"
      case "Recommendation":
        return "⭐"
      case "Profile Details":
        return "👤"
      default:
        return "📄"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600"
    if (progress >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-blue-50 to-yellow-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-yellow-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-yellow-500" />
              <div>
                <h1 className="text-2xl font-bold gradient-bg bg-clip-text text-transparent">My Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="animate-pulse-blue">
                {user.role}
              </Badge>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="card-hover animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{cards.length}</div>
              <p className="text-xs text-muted-foreground">Assigned to you</p>
            </CardContent>
          </Card>

          <Card className="card-hover animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Shield className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {cards.filter((card) => card.progress === 100).length}
              </div>
              <p className="text-xs text-muted-foreground">100% complete</p>
            </CardContent>
          </Card>

          <Card className="card-hover animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
              <Upload className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {cards.length > 0 ? Math.round(cards.reduce((acc, card) => acc + card.progress, 0) / cards.length) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Overall completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Cards Grid */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Profile Cards</h2>
            <Badge variant="outline" className="text-sm">
              {cards.length} cards assigned
            </Badge>
          </div>

          {cards.length === 0 ? (
            <Card className="animate-fade-in">
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No cards assigned</h3>
                <p className="text-gray-500">Your administrator hasn't assigned any profile cards to you yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card, index) => (
                <Card
                  key={card.id}
                  className="card-hover cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleCardClick(card)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getCardIcon(card.type)}</span>
                        <div>
                          <CardTitle className="text-lg">{card.title}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {card.type}
                          </Badge>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="mb-4 line-clamp-2">
                      {card.description || "No description available"}
                    </CardDescription>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progress</span>
                        <span className={`text-sm font-bold ${getProgressColor(card.progress)}`}>{card.progress}%</span>
                      </div>
                      <Progress value={card.progress} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardDetailModal card={selectedCard} open={modalOpen} onOpenChange={setModalOpen} onUpdate={fetchCards} />
      )}
    </div>
  )
}
