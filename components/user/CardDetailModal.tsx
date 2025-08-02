"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, Download, FileText, Loader2 } from "lucide-react"

interface CardDetailModalProps {
  card: any
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void
}

export function CardDetailModal({ card, open, onOpenChange, onUpdate }: CardDetailModalProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("cardId", card.id.toString())

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        onUpdate()
        // Reset file input
        e.target.value = ""
      } else {
        const data = await response.json()
        setUploadError(data.error || "Upload failed")
      }
    } catch (error) {
      setUploadError("Upload failed")
    } finally {
      setUploading(false)
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

  const renderCardDetails = () => {
    switch (card.type) {
      case "LinkedIn":
        return (
          <div className="space-y-4">
            <div>
              <Label>LinkedIn Username</Label>
              <Input placeholder="Enter your LinkedIn username" />
            </div>
            <div>
              <Label>Profile URL</Label>
              <Input placeholder="https://linkedin.com/in/username" />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" placeholder="Enter password" />
            </div>
          </div>
        )
      case "TEFL Certificate":
        return (
          <div className="space-y-4">
            <div>
              <Label>Certificate Number</Label>
              <Input placeholder="Enter certificate number" />
            </div>
            <div>
              <Label>Verification URL</Label>
              <Input placeholder="https://teachersrecord.com/verify" />
            </div>
            <div>
              <Label>Issue Date</Label>
              <Input type="date" />
            </div>
          </div>
        )
      case "Bachelor Degree":
        return (
          <div className="space-y-4">
            <div>
              <Label>Degree Title</Label>
              <Input placeholder="Bachelor of Science in Computer Science" />
            </div>
            <div>
              <Label>University</Label>
              <Input placeholder="University name" />
            </div>
            <div>
              <Label>Graduation Year</Label>
              <Input type="number" placeholder="2023" />
            </div>
            <div>
              <Label>GPA</Label>
              <Input placeholder="3.8/4.0" />
            </div>
          </div>
        )
      default:
        return (
          <div className="space-y-4">
            <div>
              <Label>Additional Information</Label>
              <Input placeholder="Enter relevant details" />
            </div>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{getCardIcon(card.type)}</span>
            <div>
              <DialogTitle className="text-2xl">{card.title}</DialogTitle>
              <DialogDescription className="flex items-center space-x-2">
                <Badge variant="outline">{card.type}</Badge>
                <span className={`font-bold ${getProgressColor(card.progress)}`}>{card.progress}% Complete</span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">Completion Progress</Label>
              <span className={`text-sm font-bold ${getProgressColor(card.progress)}`}>{card.progress}%</span>
            </div>
            <Progress value={card.progress} className="h-3" />
          </div>

          {/* Description */}
          {card.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{card.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Tabs for Details and Files */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="files">Files ({card.files?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Card Information</CardTitle>
                  <CardDescription>Fill in the required information for this card</CardDescription>
                </CardHeader>
                <CardContent>
                  {renderCardDetails()}
                  <div className="mt-6">
                    <Button className="w-full animate-pulse-yellow">Save Information</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">File Upload</CardTitle>
                  <CardDescription>Upload documents and files related to this card</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <div className="space-y-2">
                        <Label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-blue-600 hover:text-blue-500">Click to upload files</span>
                          <span className="text-gray-500"> or drag and drop</span>
                        </Label>
                        <Input
                          id="file-upload"
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          disabled={uploading}
                        />
                        <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
                      </div>
                    </div>

                    {uploading && (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    )}

                    {uploadError && (
                      <Alert variant="destructive">
                        <AlertDescription>{uploadError}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Uploaded Files */}
              {card.files && card.files.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Uploaded Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {card.files.map((file: any) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{file.file_name}</p>
                              <p className="text-sm text-gray-500">{new Date(file.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
