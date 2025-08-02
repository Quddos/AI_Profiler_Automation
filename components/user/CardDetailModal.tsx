"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { FileText, LinkIcon, Key, Loader2, Trash, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CardDetail {
  field_name: string
  field_value: string
  file_url?: string
}

interface CardFile {
  id: number
  file_name: string
  file_url: string
}

interface CardData {
  id: number
  title: string
  description: string
  type: string
  progress: number
  assigned_user_id: number | null
  details: CardDetail[]
  files: CardFile[]
}

interface CardDetailModalProps {
  card: CardData
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: () => void // Callback to refresh cards after update
}

export function CardDetailModal({ card, open, onOpenChange, onUpdate }: CardDetailModalProps) {
  const [currentCard, setCurrentCard] = useState<CardData>(card)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setCurrentCard(card)
  }, [card])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError("")

    try {
      const uploadedFiles = []
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const response = await fetch(`/api/upload?filename=${file.name}&cardId=${currentCard.id}`, {
          method: "POST",
          body: file,
        })

        if (response.ok) {
          const blob = await response.json()
          uploadedFiles.push({ id: Date.now() + i, file_name: file.name, file_url: blob.url })
        } else {
          const errorData = await response.json()
          setError(`Failed to upload ${file.name}: ${errorData.message || "Unknown error"}`)
          break // Stop on first error
        }
      }
      setCurrentCard((prev) => ({
        ...prev,
        files: [...prev.files, ...uploadedFiles],
      }))
      onUpdate() // Refresh parent component's card list
    } catch (err) {
      setError("An error occurred during file upload.")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = async (fileId: number, fileUrl: string) => {
    if (!confirm("Are you sure you want to remove this file?")) return
    setError("")
    try {
      // Assuming a DELETE endpoint for files, or handling removal via card update
      // For simplicity, we'll just remove it from the state and rely on card update to sync
      // A real app would have a dedicated /api/files/[id] DELETE endpoint
      const response = await fetch(`/api/files/${fileId}`, { method: "DELETE" }) // Placeholder
      if (response.ok) {
        setCurrentCard((prev) => ({
          ...prev,
          files: prev.files.filter((f) => f.id !== fileId),
        }))
        onUpdate()
      } else {
        setError("Failed to remove file from database.")
      }
    } catch (err) {
      setError("An error occurred while removing file.")
      console.error(err)
    }
  }

  const getDetailIcon = (fieldName: string) => {
    const lowerCaseName = fieldName.toLowerCase()
    if (lowerCaseName.includes("link") || lowerCaseName.includes("url"))
      return <LinkIcon className="h-4 w-4 text-blue-500" />
    if (lowerCaseName.includes("password") || lowerCaseName.includes("credential"))
      return <Key className="h-4 w-4 text-yellow-500" />
    if (lowerCaseName.includes("document") || lowerCaseName.includes("certificate") || lowerCaseName.includes("degree"))
      return <FileText className="h-4 w-4 text-green-500" />
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{currentCard.title}</DialogTitle>
          <DialogDescription>{currentCard.description || "No description provided."}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex items-center justify-between">
            <Label>Type:</Label>
            <span className="font-medium">{currentCard.type}</span>
          </div>
          <div className="flex items-center justify-between">
            <Label>Progress:</Label>
            <div className="flex items-center gap-2">
              <Progress value={currentCard.progress} className="w-[100px]" />
              <span className="font-medium">{currentCard.progress}%</span>
            </div>
          </div>

          {currentCard.details && currentCard.details.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-lg font-semibold">Details:</h4>
              {currentCard.details.map((detail, index) => (
                <div key={index} className="flex items-center gap-2 rounded-md border p-2">
                  {getDetailIcon(detail.field_name)}
                  <Label className="font-medium">{detail.field_name}:</Label>
                  {detail.file_url ? (
                    <a
                      href={detail.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex-1"
                    >
                      {detail.field_value || "View Document"}
                    </a>
                  ) : (
                    <span className="flex-1">{detail.field_value}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Uploaded Files:</h4>
            <Input type="file" multiple onChange={handleFileUpload} disabled={uploading} />
            {uploading && (
              <div className="flex items-center text-sm text-gray-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading files...
              </div>
            )}
            <div className="space-y-2">
              {currentCard.files.length === 0 && !uploading && (
                <p className="text-sm text-gray-500">No files uploaded for this card yet.</p>
              )}
              {currentCard.files.map((file) => (
                <div key={file.id} className="flex items-center justify-between rounded-md border p-2">
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline"
                  >
                    <Download className="h-4 w-4" />
                    {file.file_name}
                  </a>
                  <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(file.id, file.file_url)}>
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
