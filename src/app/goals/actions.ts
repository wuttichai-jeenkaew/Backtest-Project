"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { GoalType, GoalStatus } from "@prisma/client"

export async function createGoal(data: {
  name: string
  description?: string
  goalType: GoalType
  targetValue: number
  startDate: Date
  endDate: Date
  systemId?: string
}) {
  await prisma.performanceGoal.create({
    data: {
      name: data.name,
      description: data.description,
      goalType: data.goalType,
      targetValue: data.targetValue,
      startDate: data.startDate,
      endDate: data.endDate,
      systemId: data.systemId,
    },
  })
  
  revalidatePath("/goals")
  return { success: true }
}

export async function updateGoal(
  id: string,
  data: {
    name?: string
    description?: string
    targetValue?: number
    currentValue?: number
    status?: GoalStatus
    startDate?: Date
    endDate?: Date
  }
) {
  await prisma.performanceGoal.update({
    where: { id },
    data,
  })
  
  revalidatePath("/goals")
  return { success: true }
}

export async function deleteGoal(id: string) {
  await prisma.performanceGoal.delete({
    where: { id },
  })
  
  revalidatePath("/goals")
  return { success: true }
}

export async function updateGoalProgress(id: string, currentValue: number) {
  const goal = await prisma.performanceGoal.findUnique({
    where: { id },
  })
  
  if (!goal) return { success: false, error: "Goal not found" }
  
  // Check if goal is achieved or failed
  let status: GoalStatus = "IN_PROGRESS"
  const now = new Date()
  
  if (currentValue >= Number(goal.targetValue)) {
    status = "ACHIEVED"
  } else if (now > goal.endDate) {
    status = "FAILED"
  }
  
  await prisma.performanceGoal.update({
    where: { id },
    data: {
      currentValue,
      status,
    },
  })
  
  revalidatePath("/goals")
  return { success: true }
}

// Calculate current values from actual data
export async function calculateGoalProgress(goalId: string) {
  const goal = await prisma.performanceGoal.findUnique({
    where: { id: goalId },
  })
  
  if (!goal) return { success: false, error: "Goal not found" }
  
  let currentValue = 0
  
  // Get backtests within the goal period
  const backtests = await prisma.backtestResult.findMany({
    where: {
      ...(goal.systemId ? { tradingSystemId: goal.systemId } : {}),
      startDate: { gte: goal.startDate },
      endDate: { lte: goal.endDate },
    },
  })
  
  if (backtests.length === 0) {
    return updateGoalProgress(goalId, 0)
  }
  
  switch (goal.goalType) {
    case "WIN_RATE":
      const avgWinRate = backtests.reduce((sum, b) => sum + Number(b.winRate || 0), 0) / backtests.length
      currentValue = avgWinRate
      break
      
    case "PROFIT_FACTOR":
      const avgPF = backtests.reduce((sum, b) => sum + Number(b.profitFactor || 0), 0) / backtests.length
      currentValue = avgPF
      break
      
    case "TOTAL_TRADES":
      currentValue = backtests.reduce((sum, b) => sum + (b.totalTrades || 0), 0)
      break
      
    case "NET_PROFIT":
      currentValue = backtests.reduce((sum, b) => sum + Number(b.netProfit || 0), 0)
      break
      
    case "MAX_DRAWDOWN":
      // For drawdown, we want the minimum (best) max drawdown
      const maxDD = Math.max(...backtests.map(b => Number(b.maxDrawdown || 0)))
      currentValue = maxDD
      break
      
    case "MONTHLY_RETURN":
      // Calculate average monthly return
      const totalReturn = backtests.reduce((sum, b) => sum + Number(b.netProfit || 0), 0)
      const monthsDiff = Math.max(1, 
        (goal.endDate.getTime() - goal.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      )
      currentValue = totalReturn / monthsDiff
      break
      
    case "CONSECUTIVE_WINS":
      // This would need trade-level data, for now use best from backtests
      currentValue = Math.max(...backtests.map(b => b.maxConsecutiveWins || 0))
      break
      
    case "RISK_REWARD":
      // Calculate from average win/loss
      const validBacktests = backtests.filter(b => b.averageWin && b.averageLoss && Number(b.averageLoss) > 0)
      if (validBacktests.length > 0) {
        const avgRR = validBacktests.reduce((sum, b) => 
          sum + (Number(b.averageWin || 0) / Number(b.averageLoss || 1)), 0
        ) / validBacktests.length
        currentValue = avgRR
      }
      break
  }
  
  return updateGoalProgress(goalId, currentValue)
}

// Refresh all goals
export async function refreshAllGoals() {
  const goals = await prisma.performanceGoal.findMany({
    where: { status: "IN_PROGRESS" },
  })
  
  for (const goal of goals) {
    await calculateGoalProgress(goal.id)
  }
  
  revalidatePath("/goals")
  return { success: true }
}
