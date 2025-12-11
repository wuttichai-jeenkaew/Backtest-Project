"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { NoteType } from "@prisma/client"

export async function createNote(data: {
  title?: string
  content: string
  noteType?: NoteType
  backtestId?: string
  systemId?: string
  journalEntryId?: string
  equityPointId?: string
  isPinned?: boolean
  color?: string
}) {
  try {
    if (!data.content || data.content.trim() === '') {
      return { success: false, error: "กรุณากรอกเนื้อหา Note" }
    }

    const note = await prisma.note.create({
      data: {
        title: data.title?.trim() || null,
        content: data.content.trim(),
        noteType: data.noteType || 'GENERAL',
        backtestId: data.backtestId || null,
        systemId: data.systemId || null,
        journalEntryId: data.journalEntryId || null,
        equityPointId: data.equityPointId || null,
        isPinned: data.isPinned || false,
        color: data.color || null
      }
    })

    revalidatePath('/notes')
    if (data.backtestId) revalidatePath(`/backtests/${data.backtestId}`)
    if (data.systemId) revalidatePath(`/systems/${data.systemId}`)
    
    return { success: true, data: note }
  } catch (error) {
    console.error("Error creating note:", error)
    return { success: false, error: "ไม่สามารถสร้าง Note ได้" }
  }
}

export async function updateNote(id: string, data: {
  title?: string
  content?: string
  noteType?: NoteType
  isPinned?: boolean
  color?: string
}) {
  try {
    if (!id) {
      return { success: false, error: "ไม่พบ Note ID" }
    }

    const note = await prisma.note.update({
      where: { id },
      data: {
        title: data.title?.trim() || null,
        content: data.content?.trim(),
        noteType: data.noteType,
        isPinned: data.isPinned,
        color: data.color
      }
    })

    revalidatePath('/notes')
    return { success: true, data: note }
  } catch (error) {
    console.error("Error updating note:", error)
    return { success: false, error: "ไม่สามารถอัพเดท Note ได้" }
  }
}

export async function deleteNote(id: string) {
  try {
    if (!id) {
      return { success: false, error: "ไม่พบ Note ID" }
    }

    await prisma.note.delete({
      where: { id }
    })

    revalidatePath('/notes')
    return { success: true }
  } catch (error) {
    console.error("Error deleting note:", error)
    return { success: false, error: "ไม่สามารถลบ Note ได้" }
  }
}

export async function togglePinNote(id: string) {
  try {
    const note = await prisma.note.findUnique({
      where: { id },
      select: { isPinned: true }
    })

    if (!note) {
      return { success: false, error: "ไม่พบ Note" }
    }

    await prisma.note.update({
      where: { id },
      data: { isPinned: !note.isPinned }
    })

    revalidatePath('/notes')
    return { success: true }
  } catch (error) {
    console.error("Error toggling pin:", error)
    return { success: false, error: "ไม่สามารถปักหมุด Note ได้" }
  }
}

export async function getNotes(filters?: {
  backtestId?: string
  systemId?: string
  journalEntryId?: string
  noteType?: NoteType
}) {
  try {
    const notes = await prisma.note.findMany({
      where: {
        backtestId: filters?.backtestId,
        systemId: filters?.systemId,
        journalEntryId: filters?.journalEntryId,
        noteType: filters?.noteType
      },
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
  } catch (error) {
    console.error("Error getting notes:", error)
    return []
  }
}
