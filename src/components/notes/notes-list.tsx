"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pin, MoreHorizontal, Pencil, Trash2, ExternalLink, LucideIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
} from "@/components/ui/alert-dialog"
import { deleteNote, togglePinNote } from "@/app/notes/actions"
import Link from "next/link"
import { NoteType } from "@prisma/client"

interface Note {
  id: string
  title: string | null
  content: string
  noteType: NoteType
  isPinned: boolean
  color: string | null
  createdAt: Date
  backtest: { id: string; name: string | null; symbol: string } | null
  system: { id: string; name: string } | null
  journalEntry: { id: string; symbol: string; entryDate: Date } | null
}

interface NotesListProps {
  notes: Note[]
  noteTypeLabels: Record<NoteType, string>
  noteTypeColors: Record<NoteType, string>
  noteTypeIcons: Record<NoteType, LucideIcon>
}

export function NotesList({ notes, noteTypeLabels, noteTypeColors, noteTypeIcons }: NotesListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    await deleteNote(deleteId)
    setIsDeleting(false)
    setDeleteId(null)
    router.refresh()
  }

  const handleTogglePin = async (id: string) => {
    await togglePinNote(id)
    router.refresh()
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => {
          const Icon = noteTypeIcons[note.noteType]
          return (
            <Card 
              key={note.id} 
              className={`hover:shadow-md transition-shadow ${note.isPinned ? 'ring-2 ring-yellow-400' : ''}`}
              style={note.color ? { borderLeftColor: note.color, borderLeftWidth: '4px' } : undefined}
            >
              <CardContent className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`p-1.5 rounded ${noteTypeColors[note.noteType]}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    {note.title ? (
                      <h3 className="font-medium truncate">{note.title}</h3>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {noteTypeLabels[note.noteType]}
                      </Badge>
                    )}
                    {note.isPinned && (
                      <Pin className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleTogglePin(note.id)}>
                        <Pin className="h-4 w-4 mr-2" />
                        {note.isPinned ? "เลิกปักหมุด" : "ปักหมุด"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setDeleteId(note.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        ลบ
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Content */}
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {note.content}
                </p>

                {/* Links */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {note.system && (
                    <Link href={`/systems/${note.system.id}`}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                        <ExternalLink className="h-2.5 w-2.5 mr-1" />
                        {note.system.name}
                      </Badge>
                    </Link>
                  )}
                  {note.backtest && (
                    <Link href={`/backtests/${note.backtest.id}`}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                        <ExternalLink className="h-2.5 w-2.5 mr-1" />
                        {note.backtest.name || note.backtest.symbol}
                      </Badge>
                    </Link>
                  )}
                  {note.journalEntry && (
                    <Link href={`/journal/${note.journalEntry.id}`}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-secondary">
                        <ExternalLink className="h-2.5 w-2.5 mr-1" />
                        {note.journalEntry.symbol}
                      </Badge>
                    </Link>
                  )}
                </div>

                {/* Date */}
                <p className="text-xs text-muted-foreground">
                  {new Date(note.createdAt).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบ Note</AlertDialogTitle>
            <AlertDialogDescription>
              คุณต้องการลบ Note นี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "กำลังลบ..." : "ลบ Note"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
