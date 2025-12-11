"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createSystemVersion(data: {
  systemId: string
  versionNumber: string
  versionName?: string
  entryRules?: string
  exitRules?: string
  description?: string
  changelog?: string | null
  winRate?: number | null
  profitFactor?: number | null
  maxDrawdown?: number | null
  totalTrades?: number | null
  netProfit?: number | null
  isActive?: boolean
}) {
  try {
    if (!data.systemId) {
      return { success: false, error: "กรุณาเลือก Trading System" }
    }

    if (!data.versionNumber || data.versionNumber.trim() === '') {
      return { success: false, error: "กรุณากรอกหมายเลข Version" }
    }

    // Set previous active version to inactive if this one is active
    if (data.isActive !== false) {
      await prisma.systemVersion.updateMany({
        where: { 
          systemId: data.systemId,
          isActive: true 
        },
        data: { isActive: false }
      })
    }

    const version = await prisma.systemVersion.create({
      data: {
        systemId: data.systemId,
        versionNumber: data.versionNumber.trim(),
        versionName: data.versionName?.trim() || null,
        entryRules: data.entryRules?.trim() || null,
        exitRules: data.exitRules?.trim() || null,
        description: data.description?.trim() || null,
        changelog: data.changelog?.trim() || null,
        avgWinRate: data.winRate ?? null,
        avgProfitFactor: data.profitFactor ?? null,
        isActive: data.isActive !== false
      }
    })

    revalidatePath(`/systems/${data.systemId}`)
    revalidatePath('/versions')
    return { success: true, data: version }
  } catch (error) {
    console.error("Error creating version:", error)
    if (String(error).includes('Unique constraint')) {
      return { success: false, error: "Version นี้มีอยู่แล้ว" }
    }
    return { success: false, error: "ไม่สามารถสร้าง Version ได้" }
  }
}

export async function updateSystemVersion(id: string, data: {
  versionNumber?: string
  versionName?: string
  entryRules?: string
  exitRules?: string
  description?: string
  changelog?: string | null
  winRate?: number | null
  profitFactor?: number | null
  maxDrawdown?: number | null
  totalTrades?: number | null
  netProfit?: number | null
  isActive?: boolean
}) {
  try {
    if (!id) {
      return { success: false, error: "ไม่พบ Version ID" }
    }

    // If setting this version as active, deactivate others
    if (data.isActive) {
      const version = await prisma.systemVersion.findUnique({
        where: { id },
        select: { systemId: true }
      })

      if (version) {
        await prisma.systemVersion.updateMany({
          where: { 
            systemId: version.systemId,
            isActive: true 
          },
          data: { isActive: false }
        })
      }
    }

    const updated = await prisma.systemVersion.update({
      where: { id },
      data: {
        versionNumber: data.versionNumber?.trim() || undefined,
        versionName: data.versionName?.trim() || null,
        entryRules: data.entryRules?.trim() || null,
        exitRules: data.exitRules?.trim() || null,
        description: data.description?.trim() || null,
        changelog: data.changelog?.trim() || null,
        avgWinRate: data.winRate ?? undefined,
        avgProfitFactor: data.profitFactor ?? undefined,
        isActive: data.isActive ?? undefined
      }
    })

    revalidatePath(`/systems/${updated.systemId}`)
    revalidatePath('/versions')
    return { success: true, data: updated }
  } catch (error) {
    console.error("Error updating version:", error)
    return { success: false, error: "ไม่สามารถอัพเดท Version ได้" }
  }
}

export async function deleteSystemVersion(id: string) {
  try {
    if (!id) {
      return { success: false, error: "ไม่พบ Version ID" }
    }

    const version = await prisma.systemVersion.delete({
      where: { id }
    })

    revalidatePath(`/systems/${version.systemId}`)
    revalidatePath('/versions')
    return { success: true }
  } catch (error) {
    console.error("Error deleting version:", error)
    return { success: false, error: "ไม่สามารถลบ Version ได้" }
  }
}

export async function assignBacktestToVersion(backtestId: string, versionId: string) {
  try {
    // Remove existing version assignments for this backtest
    await prisma.backtestVersion.deleteMany({
      where: { backtestId }
    })

    // Create new assignment
    await prisma.backtestVersion.create({
      data: {
        backtestId,
        versionId
      }
    })

    revalidatePath('/versions')
    return { success: true }
  } catch (error) {
    console.error("Error assigning backtest to version:", error)
    return { success: false, error: "ไม่สามารถกำหนด Version ได้" }
  }
}

export async function getSystemVersions(systemId: string) {
  try {
    const system = await prisma.tradingSystem.findUnique({
      where: { id: systemId },
      select: {
        id: true,
        name: true,
      }
    })

    if (!system) {
      return { success: false, error: "ไม่พบระบบนี้" }
    }

    const versions = await prisma.systemVersion.findMany({
      where: { systemId },
      orderBy: { createdAt: 'desc' }
    })

    return {
      success: true,
      data: {
        ...system,
        versions: versions.map(v => ({
          ...v,
          winRate: v.avgWinRate ? Number(v.avgWinRate) : null,
          profitFactor: v.avgProfitFactor ? Number(v.avgProfitFactor) : null,
          maxDrawdown: null,
          totalTrades: v.totalBacktests,
          netProfit: null,
        }))
      }
    }
  } catch (error) {
    console.error("Error getting versions:", error)
    return { success: false, error: "ไม่สามารถโหลด Versions ได้" }
  }
}

export async function updateVersionStats(versionId: string) {
  try {
    const backtests = await prisma.backtestVersion.findMany({
      where: { versionId },
      include: {
        backtest: {
          select: {
            winRate: true,
            profitFactor: true
          }
        }
      }
    })

    if (backtests.length === 0) {
      await prisma.systemVersion.update({
        where: { id: versionId },
        data: {
          avgWinRate: null,
          avgProfitFactor: null,
          totalBacktests: 0
        }
      })
      return
    }

    const avgWinRate = backtests.reduce((sum, b) => sum + Number(b.backtest.winRate || 0), 0) / backtests.length
    const avgProfitFactor = backtests.reduce((sum, b) => sum + Number(b.backtest.profitFactor || 0), 0) / backtests.length

    await prisma.systemVersion.update({
      where: { id: versionId },
      data: {
        avgWinRate,
        avgProfitFactor,
        totalBacktests: backtests.length
      }
    })
  } catch (error) {
    console.error("Error updating version stats:", error)
  }
}
