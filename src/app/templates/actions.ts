"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createTemplate(data: {
  name: string
  description?: string
  symbol?: string
  startingCapital?: number
  dataSource?: string
  commission?: number
  slippage?: number
  systemId?: string
}) {
  try {
    if (!data.name || data.name.trim() === '') {
      return { success: false, error: "กรุณากรอกชื่อ Template" }
    }

    const template = await prisma.backtestTemplate.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        symbol: data.symbol?.trim() || null,
        startingCapital: data.startingCapital || null,
        dataSource: data.dataSource?.trim() || null,
        commission: data.commission || null,
        slippage: data.slippage || null,
        systemId: data.systemId || null
      }
    })

    revalidatePath('/templates')
    return { success: true, data: template }
  } catch (error) {
    console.error("Error creating template:", error)
    return { success: false, error: "ไม่สามารถสร้าง Template ได้" }
  }
}

export async function updateTemplate(id: string, data: {
  name: string
  description?: string
  symbol?: string
  startingCapital?: number
  dataSource?: string
  commission?: number
  slippage?: number
  systemId?: string
}) {
  try {
    if (!id) {
      return { success: false, error: "ไม่พบ Template ID" }
    }

    if (!data.name || data.name.trim() === '') {
      return { success: false, error: "กรุณากรอกชื่อ Template" }
    }

    const template = await prisma.backtestTemplate.update({
      where: { id },
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        symbol: data.symbol?.trim() || null,
        startingCapital: data.startingCapital || null,
        dataSource: data.dataSource?.trim() || null,
        commission: data.commission || null,
        slippage: data.slippage || null,
        systemId: data.systemId || null
      }
    })

    revalidatePath('/templates')
    revalidatePath(`/templates/${id}`)
    return { success: true, data: template }
  } catch (error) {
    console.error("Error updating template:", error)
    return { success: false, error: "ไม่สามารถอัพเดท Template ได้" }
  }
}

export async function deleteTemplate(id: string) {
  try {
    if (!id) {
      return { success: false, error: "ไม่พบ Template ID" }
    }

    await prisma.backtestTemplate.delete({
      where: { id }
    })

    revalidatePath('/templates')
    return { success: true }
  } catch (error) {
    console.error("Error deleting template:", error)
    return { success: false, error: "ไม่สามารถลบ Template ได้" }
  }
}

export async function incrementTemplateUsage(id: string) {
  try {
    await prisma.backtestTemplate.update({
      where: { id },
      data: {
        usageCount: { increment: 1 }
      }
    })
  } catch (error) {
    console.error("Error incrementing template usage:", error)
  }
}

export async function getTemplateById(id: string) {
  try {
    const template = await prisma.backtestTemplate.findUnique({
      where: { id },
      include: {
        system: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!template) {
      return null
    }

    return {
      ...template,
      startingCapital: template.startingCapital ? Number(template.startingCapital) : null,
      commission: template.commission ? Number(template.commission) : null,
      slippage: template.slippage ? Number(template.slippage) : null
    }
  } catch (error) {
    console.error("Error getting template:", error)
    return null
  }
}
