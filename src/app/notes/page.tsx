import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, StickyNote, Pin, Lightbulb, AlertTriangle, Trophy, Wrench, BookOpen } from "lucide-react"
import Link from "next/link"
import { NotesList } from "@/components/notes/notes-list"
import { CreateNoteDialog } from "@/components/notes/create-note-dialog"

const noteTypeIcons = {
  GENERAL: StickyNote,
  LESSON: BookOpen,
  IDEA: Lightbulb,
  IMPROVEMENT: Wrench,
  WARNING: AlertTriangle,
  MILESTONE: Trophy
}

const noteTypeLabels = {
  GENERAL: "ทั่วไป",
  LESSON: "บทเรียน",
  IDEA: "ไอเดีย",
  IMPROVEMENT: "ปรับปรุง",
  WARNING: "คำเตือน",
  MILESTONE: "Milestone"
}

const noteTypeColors = {
  GENERAL: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  LESSON: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  IDEA: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  IMPROVEMENT: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  WARNING: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  MILESTONE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
}

async function getNotes() {
  const notes = await prisma.note.findMany({
    include: {
      backtest: {
        select: { id: true, name: true, symbol: true }
      },
      system: {
        select: { id: true, name: true }
      },
      journalEntry: {
        select: { id: true, symbol: true, entryDate: true }
      }
    },
    orderBy: [
      { isPinned: 'desc' },
      { createdAt: 'desc' }
    ]
  })

  return notes
}

async function getSystems() {
  return prisma.tradingSystem.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })
}

async function getBacktests() {
  const backtests = await prisma.backtestResult.findMany({
    select: { 
      id: true, 
      name: true, 
      symbol: true,
      tradingSystem: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
  return backtests
}

export default async function NotesPage() {
  const [notes, systems, backtests] = await Promise.all([
    getNotes(),
    getSystems(),
    getBacktests()
  ])

  const pinnedNotes = notes.filter(n => n.isPinned)
  const unpinnedNotes = notes.filter(n => !n.isPinned)

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes & Annotations</h1>
          <p className="text-muted-foreground">
            บันทึก Lessons, Ideas และข้อคิดต่างๆ จากการเทรด
          </p>
        </div>
        <CreateNoteDialog systems={systems} backtests={backtests} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        {(Object.keys(noteTypeLabels) as Array<keyof typeof noteTypeLabels>).map((type) => {
          const Icon = noteTypeIcons[type]
          const count = notes.filter(n => n.noteType === type).length
          return (
            <Card key={type}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`p-2 rounded-lg ${noteTypeColors[type]}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{noteTypeLabels[type]}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pinned Notes */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4 text-yellow-500" />
            <h2 className="text-lg font-semibold">Pinned Notes</h2>
          </div>
          <NotesList 
            notes={pinnedNotes} 
            noteTypeLabels={noteTypeLabels}
            noteTypeColors={noteTypeColors}
            noteTypeIcons={noteTypeIcons}
          />
        </div>
      )}

      {/* All Notes */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">All Notes</h2>
        {unpinnedNotes.length === 0 && pinnedNotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <StickyNote className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">ยังไม่มี Notes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                สร้าง Note เพื่อบันทึกสิ่งที่เรียนรู้และไอเดียต่างๆ
              </p>
              <CreateNoteDialog systems={systems} backtests={backtests} />
            </CardContent>
          </Card>
        ) : (
          <NotesList 
            notes={unpinnedNotes} 
            noteTypeLabels={noteTypeLabels}
            noteTypeColors={noteTypeColors}
            noteTypeIcons={noteTypeIcons}
          />
        )}
      </div>
    </div>
  )
}
