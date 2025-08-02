"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Plus, Edit, Trash, Loader2, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CardDetail {
  field_name: string;
  field_value: string;
  file_url?: string;
}

interface CardData {
  id: number;
  title: string;
  description: string;
  type: string;
  progress: number;
  assigned_user_id: number | null;
  assigned_user_name?: string;
  assigned_user_email?: string;
  details: CardDetail[];
  files: { id: number; file_name: string; file_url: string }[];
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

export function CardManagement() {
  const [cards, setCards] = useState<CardData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCard, setCurrentCard] = useState<CardData | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [assignedUserId, setAssignedUserId] = useState<string>("");
  const [cardDetails, setCardDetails] = useState<CardDetail[]>([]);
  const [cardFiles, setCardFiles] = useState<{ id: number; file_name: string; file_url: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCards();
    fetchUsers();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/cards");
      if (response.ok) {
        const data = await response.json();
        setCards(data.cards);
      } else {
        setError("Failed to fetch cards.");
      }
    } catch (err) {
      setError("An error occurred while fetching cards.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setError("Failed to fetch users.");
      }
    } catch (err) {
      setError("An error occurred while fetching users.");
      console.error(err);
    }
  };

  const handleAddCard = () => {
    setCurrentCard(null);
    setTitle("");
    setDescription("");
    setType("");
    setProgress(0);
    setAssignedUserId("");
    setCardDetails([]);
    setCardFiles([]);
    setIsModalOpen(true);
  };

  const handleEditCard = async (card: CardData) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/cards/${card.id}`);
      if (response.ok) {
        const data = await response.json();
        const fullCard = data.card;
        setCurrentCard(fullCard);
        setTitle(fullCard.title);
        setDescription(fullCard.description);
        setType(fullCard.type);
        setProgress(fullCard.progress);
        setAssignedUserId(fullCard.assigned_user_id ? String(fullCard.assigned_user_id) : "");
        setCardDetails(fullCard.details || []);
        setCardFiles(fullCard.files || []);
        setIsModalOpen(true);
      } else {
        setError("Failed to fetch card details for editing.");
      }
    } catch (err) {
      setError("An error occurred while fetching card details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCard = async (id: number) => {
    if (!confirm("Are you sure you want to delete this card?")) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/cards/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchCards();
      } else {
        setError("Failed to delete card.");
      }
    } catch (err) {
      setError("An error occurred while deleting card.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!type || type === "") {
      setError("Please select item in the list");
      setLoading(false);
      return;
    }
    const assignedId = assignedUserId === "null" || assignedUserId === "" ? null : Number(assignedUserId);

    const method = currentCard ? "PUT" : "POST";
    const url = currentCard ? `/api/cards/${currentCard.id}` : "/api/cards";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type,
          progress,
          assignedUserId: assignedId,
          details: cardDetails,
          files: cardFiles,
        }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        fetchCards();
      } else {
        const errorData = await response.json();
        setError(errorData.message || `Failed to ${currentCard ? "update" : "create"} card.`);
      }
    } catch (err) {
      setError(`An error occurred while ${currentCard ? "updating" : "creating"} card.`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailChange = (index: number, field: keyof CardDetail, value: string) => {
    const newDetails = [...cardDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setCardDetails(newDetails);
  };

  const addDetailField = () => {
    setCardDetails([...cardDetails, { field_name: "", field_value: "" }]);
  };

  const removeDetailField = (index: number) => {
    setCardDetails(cardDetails.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentCard) return;

    setUploading(true);
    setError("");

    try {
      const uploadedFiles: { id: number; file_name: string; file_url: string }[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const response = await fetch(`/api/upload?filename=${file.name}&cardId=${currentCard.id}`, {
          method: "POST",
          body: file,
        });

        if (response.ok) {
          const blob = await response.json();
          uploadedFiles.push({ id: Date.now() + i, file_name: file.name, file_url: blob.url });
        } else {
          const errorData = await response.json();
          setError(`Failed to upload ${file.name}: ${errorData.message || "Unknown error"}`);
          break;
        }
      }
      setCardFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
    } catch (err) {
      setError("An error occurred during file upload.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async (fileId: number) => {
    if (!confirm("Are you sure you want to remove this file?")) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/files/${fileId}`, { method: "DELETE" });
      if (response.ok) {
        setCardFiles(cardFiles.filter((f) => f.id !== fileId));
      } else {
        setError("Failed to remove file from database.");
      }
    } catch (err) {
      setError("An error occurred while removing file.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Card Management</CardTitle>
        <CardDescription>Create, edit, and delete profile cards for users.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Button onClick={handleAddCard} className="animate-pulse-yellow">
            <Plus className="mr-2 h-4 w-4" /> Add New Card
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            <span className="ml-2 text-gray-600">Loading cards...</span>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : cards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No cards found. Start by adding a new card!</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="font-medium">{card.title}</TableCell>
                  <TableCell>{card.type}</TableCell>
                  <TableCell>{card.assigned_user_name || "Unassigned"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={card.progress} className="w-[100px]" />
                      <span className="text-sm">{card.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditCard(card)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCard(card.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{currentCard ? "Edit Card" : "Add New Card"}</DialogTitle>
            <DialogDescription>
              {currentCard ? "Edit the details of this profile card." : "Create a new profile card."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {/* Title */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" required />
            </div>
            {/* Description */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
            </div>
            {/* Type */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <select
                id="type"
                value={type}
                onChange={e => { setType(e.target.value); setError(""); }}
                className="col-span-3 border rounded-md px-3 py-2 text-sm"
                required
              >
                <option value="">Select card type</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="TEFL Certificate">TEFL Certificate</option>
                <option value="Bachelor Degree">Bachelor Degree</option>
                <option value="University Applied">University Applied</option>
                <option value="Internships">Internships</option>
                <option value="Recommendation">Recommendation</option>
                <option value="User Profile Details">User Profile Details</option>
                <option value="Other">Other</option>
              </select>
            </div>
            {/* Progress */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="progress" className="text-right">
                Progress (%)
              </Label>
              <Input id="progress" type="number" value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="col-span-3" min={0} max={100} />
            </div>
            {/* Assign To */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="assignedUser" className="text-right">
                Assign To
              </Label>
              <select
                id="assignedUser"
                value={assignedUserId}
                onChange={e => { setAssignedUserId(e.target.value); setError(""); }}
                className="col-span-3 border rounded-md px-3 py-2 text-sm"
              >
                <option value="">Select user (optional)</option>
                <option value="null">Unassigned</option>
                {users.map(user => (
                  <option key={user.id} value={String(user.id)}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Card Details */}
            <div className="col-span-4 space-y-2">
              <div className="flex justify-between items-center">
                <Label>Card Details</Label>
                <Button type="button" variant="outline" size="sm" onClick={addDetailField}>
                  Add Detail Field
                </Button>
              </div>
              {cardDetails.map((detail, index) => (
                <div key={index} className="grid grid-cols-4 items-center gap-2">
                  <Input placeholder="Field Name (e.g., Username)" value={detail.field_name} onChange={(e) => handleDetailChange(index, "field_name", e.target.value)} className="col-span-1" />
                  <Input placeholder="Field Value" value={detail.field_value} onChange={(e) => handleDetailChange(index, "field_value", e.target.value)} className="col-span-2" />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeDetailField(index)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* File Upload */}
            {currentCard && (
              <div className="col-span-4 space-y-2">
                <Label>Files</Label>
                <Input type="file" multiple onChange={handleFileUpload} disabled={uploading} />
                {uploading && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading files...
                  </div>
                )}
                <div className="space-y-2">
                  {cardFiles.length === 0 && !uploading && <p className="text-sm text-gray-500">No files uploaded for this card.</p>}
                  {cardFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between rounded-md border p-2">
                      <a href={file.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                        <FileText className="h-4 w-4" />
                        {file.file_name}
                      </a>
                      <Button variant="ghost" size="sm" onClick={() => handleRemoveFile(file.id)}>
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="submit" disabled={loading || uploading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : currentCard ? (
                  "Save Changes"
                ) : (
                  "Create Card"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
