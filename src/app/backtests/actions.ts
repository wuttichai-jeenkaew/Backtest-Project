"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createBacktest(formData: FormData) {
  try {
    const tradingSystemId = formData.get("tradingSystemId") as string;
    const name = formData.get("name") as string | null;
    const symbol = formData.get("symbol") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    const startingCapital = parseFloat(
      formData.get("startingCapital") as string
    );
    const totalTrades = parseInt(formData.get("totalTrades") as string);
    const winningTrades = parseInt(formData.get("winningTrades") as string);
    const losingTrades = parseInt(formData.get("losingTrades") as string);

    // Validation
    if (!tradingSystemId) throw new Error("Trading system is required");
    if (!symbol || !symbol.trim()) throw new Error("Symbol is required");
    if (isNaN(startingCapital) || startingCapital <= 0)
      throw new Error("Starting capital must be greater than 0");
    if (isNaN(totalTrades) || totalTrades < 0)
      throw new Error("Total trades must be 0 or greater");

    // Helper function to convert % to $ amount
    const percentToAmount = (percentValue: string | null): number | null => {
      if (!percentValue) return null;
      const percent = parseFloat(percentValue);
      if (isNaN(percent)) return null;
      return (percent / 100) * startingCapital;
    };

    // Get percentage values from form
    const grossProfitPercent = formData.get("grossProfitPercent") as
      | string
      | null;
    const grossLossPercent = formData.get("grossLossPercent") as string | null;
    const averageWinPercent = formData.get("averageWinPercent") as
      | string
      | null;
    const averageLossPercent = formData.get("averageLossPercent") as
      | string
      | null;
    const largestWinPercent = formData.get("largestWinPercent") as
      | string
      | null;
    const largestLossPercent = formData.get("largestLossPercent") as
      | string
      | null;
    const maxDrawdownPercentStr = formData.get("maxDrawdownPercent") as
      | string
      | null;

    // Convert % to $ amounts
    const grossProfit = percentToAmount(grossProfitPercent);
    const grossLoss = percentToAmount(grossLossPercent);
    const averageWin = percentToAmount(averageWinPercent);
    const averageLoss = percentToAmount(averageLossPercent);
    const largestWin = percentToAmount(largestWinPercent);
    const largestLoss = percentToAmount(largestLossPercent);
    const maxDrawdownPercent = maxDrawdownPercentStr
      ? parseFloat(maxDrawdownPercentStr)
      : null;
    const maxDrawdown = maxDrawdownPercent
      ? (maxDrawdownPercent / 100) * startingCapital
      : null;

    // Calculate net profit from gross profit and loss percentages
    const grossProfitPct = grossProfitPercent
      ? parseFloat(grossProfitPercent)
      : 0;
    const grossLossPct = grossLossPercent ? parseFloat(grossLossPercent) : 0;
    const netProfitPercent = grossProfitPct - grossLossPct;
    const netProfit = (netProfitPercent / 100) * startingCapital;
    const endingCapital = startingCapital + netProfit;

    // Calculate win rate
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    // Other optional fields
    const maxConsecutiveWins = formData.get("maxConsecutiveWins")
      ? parseInt(formData.get("maxConsecutiveWins") as string)
      : null;
    const maxConsecutiveLosses = formData.get("maxConsecutiveLosses")
      ? parseInt(formData.get("maxConsecutiveLosses") as string)
      : null;
    const notes = formData.get("notes") as string | null;
    const dataSource = formData.get("dataSource") as string | null;

    // Calculate profit factor
    const profitFactor =
      grossProfit && grossLoss && grossLoss > 0
        ? grossProfit / grossLoss
        : null;

    // Calculate expectancy
    const expectancy =
      averageWin && averageLoss && winRate
        ? (winRate / 100) * averageWin -
          ((100 - winRate) / 100) * Math.abs(averageLoss)
        : null;

    const backtest = await prisma.backtestResult.create({
      data: {
        tradingSystemId,
        name: name || null,
        symbol,
        startDate,
        endDate,
        startingCapital,
        endingCapital,
        netProfit,
        netProfitPercent,
        grossProfit,
        grossLoss,
        maxDrawdown,
        maxDrawdownPercent,
        sharpeRatio: null, // Will be calculated separately
        profitFactor,
        totalTrades,
        winningTrades,
        losingTrades,
        winRate,
        averageWin,
        averageLoss,
        averageTrade: totalTrades > 0 ? netProfit / totalTrades : null,
        largestWin,
        largestLoss,
        expectancy,
        maxConsecutiveWins,
        maxConsecutiveLosses,
        notes: notes || null,
        dataSource: dataSource || null,
      },
    });

    revalidatePath("/backtests");
    revalidatePath(`/systems/${tradingSystemId}`);
    revalidatePath("/");

    return backtest.id;
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || "Failed to create backtest");
  }
}

export async function updateBacktest(id: string, formData: FormData) {
  try {
    const tradingSystemId = formData.get("tradingSystemId") as string;
    const name = formData.get("name") as string | null;
    const symbol = formData.get("symbol") as string;
    const startDate = new Date(formData.get("startDate") as string);
    const endDate = new Date(formData.get("endDate") as string);
    const startingCapital = parseFloat(
      formData.get("startingCapital") as string
    );
    const totalTrades = parseInt(formData.get("totalTrades") as string);
    const winningTrades = parseInt(formData.get("winningTrades") as string);
    const losingTrades = parseInt(formData.get("losingTrades") as string);

    // Validation
    if (!tradingSystemId) throw new Error("Trading system is required");
    if (!symbol || !symbol.trim()) throw new Error("Symbol is required");
    if (isNaN(startingCapital) || startingCapital <= 0)
      throw new Error("Starting capital must be greater than 0");
    if (isNaN(totalTrades) || totalTrades < 0)
      throw new Error("Total trades must be 0 or greater");

    // Helper function to convert % to $ amount
    const percentToAmount = (percentValue: string | null): number | null => {
      if (!percentValue) return null;
      const percent = parseFloat(percentValue);
      if (isNaN(percent)) return null;
      return (percent / 100) * startingCapital;
    };

    // Get percentage values from form
    const grossProfitPercent = formData.get("grossProfitPercent") as
      | string
      | null;
    const grossLossPercent = formData.get("grossLossPercent") as string | null;
    const averageWinPercent = formData.get("averageWinPercent") as
      | string
      | null;
    const averageLossPercent = formData.get("averageLossPercent") as
      | string
      | null;
    const largestWinPercent = formData.get("largestWinPercent") as
      | string
      | null;
    const largestLossPercent = formData.get("largestLossPercent") as
      | string
      | null;
    const maxDrawdownPercentStr = formData.get("maxDrawdownPercent") as
      | string
      | null;

    // Convert % to $ amounts
    const grossProfit = percentToAmount(grossProfitPercent);
    const grossLoss = percentToAmount(grossLossPercent);
    const averageWin = percentToAmount(averageWinPercent);
    const averageLoss = percentToAmount(averageLossPercent);
    const largestWin = percentToAmount(largestWinPercent);
    const largestLoss = percentToAmount(largestLossPercent);
    const maxDrawdownPercent = maxDrawdownPercentStr
      ? parseFloat(maxDrawdownPercentStr)
      : null;
    const maxDrawdown = maxDrawdownPercent
      ? (maxDrawdownPercent / 100) * startingCapital
      : null;

    // Calculate net profit from gross profit and loss percentages
    const grossProfitPct = grossProfitPercent
      ? parseFloat(grossProfitPercent)
      : 0;
    const grossLossPct = grossLossPercent ? parseFloat(grossLossPercent) : 0;
    const netProfitPercent = grossProfitPct - grossLossPct;
    const netProfit = (netProfitPercent / 100) * startingCapital;
    const endingCapital = startingCapital + netProfit;

    // Calculate win rate
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    // Other optional fields
    const maxConsecutiveWins = formData.get("maxConsecutiveWins")
      ? parseInt(formData.get("maxConsecutiveWins") as string)
      : null;
    const maxConsecutiveLosses = formData.get("maxConsecutiveLosses")
      ? parseInt(formData.get("maxConsecutiveLosses") as string)
      : null;
    const notes = formData.get("notes") as string | null;
    const dataSource = formData.get("dataSource") as string | null;

    // Calculate profit factor
    const profitFactor =
      grossProfit && grossLoss && grossLoss > 0
        ? grossProfit / grossLoss
        : null;

    // Calculate expectancy
    const expectancy =
      averageWin && averageLoss && winRate
        ? (winRate / 100) * averageWin -
          ((100 - winRate) / 100) * Math.abs(averageLoss)
        : null;

    // Get existing sharpe ratio to preserve it
    const existingBacktest = await prisma.backtestResult.findUnique({
      where: { id },
      select: { sharpeRatio: true },
    });

    await prisma.backtestResult.update({
      where: { id },
      data: {
        tradingSystemId,
        name: name || null,
        symbol,
        startDate,
        endDate,
        startingCapital,
        endingCapital,
        netProfit,
        netProfitPercent,
        grossProfit,
        grossLoss,
        maxDrawdown,
        maxDrawdownPercent,
        sharpeRatio: existingBacktest?.sharpeRatio ?? null, // Preserve existing value
        profitFactor,
        totalTrades,
        winningTrades,
        losingTrades,
        winRate,
        averageWin,
        averageLoss,
        averageTrade: totalTrades > 0 ? netProfit / totalTrades : null,
        largestWin,
        largestLoss,
        expectancy,
        maxConsecutiveWins,
        maxConsecutiveLosses,
        notes: notes || null,
        dataSource: dataSource || null,
      },
    });

    revalidatePath("/backtests");
    revalidatePath(`/backtests/${id}`);
    revalidatePath(`/systems/${tradingSystemId}`);
    revalidatePath("/");
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || "Failed to update backtest");
  }
}

export async function deleteBacktest(id: string) {
  try {
    if (!id) throw new Error("Backtest ID is required");

    const backtest = await prisma.backtestResult.findUnique({
      where: { id },
      select: { tradingSystemId: true },
    });

    if (!backtest) throw new Error("Backtest not found");

    await prisma.backtestResult.delete({
      where: { id },
    });

    revalidatePath("/backtests");
    revalidatePath("/");
    revalidatePath(`/systems/${backtest.tradingSystemId}`);
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || "Failed to delete backtest");
  }
}

// ============== Equity Curve Actions ==============

interface EquityPointInput {
  date: string;
  equity: number;
  drawdown?: number | null;
}

export async function addEquityPoints(
  backtestId: string,
  points: EquityPointInput[]
) {
  try {
    if (!backtestId) throw new Error("Backtest ID is required");
    if (!points || points.length === 0)
      throw new Error("At least one equity point is required");

    await prisma.equityPoint.createMany({
      data: points.map((p) => ({
        backtestId,
        date: new Date(p.date),
        equity: p.equity,
        drawdown: p.drawdown ?? null,
      })),
    });

    revalidatePath(`/backtests/${backtestId}`);
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || "Failed to add equity points");
  }
}

export async function deleteEquityPoints(backtestId: string) {
  try {
    if (!backtestId) throw new Error("Backtest ID is required");

    await prisma.equityPoint.deleteMany({
      where: { backtestId },
    });

    revalidatePath(`/backtests/${backtestId}`);
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || "Failed to delete equity points");
  }
}

// ============== Monthly Returns Actions ==============

interface MonthlyReturnInput {
  year: number;
  month: number;
  returnPercent: number;
  trades?: number | null;
}

export async function addMonthlyReturns(
  backtestId: string,
  returns: MonthlyReturnInput[]
) {
  try {
    if (!backtestId) throw new Error("Backtest ID is required");
    if (!returns || returns.length === 0)
      throw new Error("At least one monthly return is required");

    // Delete existing returns for the same year/month combinations to allow updates
    for (const r of returns) {
      await prisma.monthlyReturn.deleteMany({
        where: {
          backtestId,
          year: r.year,
          month: r.month,
        },
      });
    }

    await prisma.monthlyReturn.createMany({
      data: returns.map((r) => ({
        backtestId,
        year: r.year,
        month: r.month,
        returnPercent: r.returnPercent,
        trades: r.trades ?? null,
      })),
    });

    revalidatePath(`/backtests/${backtestId}`);
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || "Failed to add monthly returns");
  }
}

export async function deleteMonthlyReturns(backtestId: string) {
  try {
    if (!backtestId) throw new Error("Backtest ID is required");

    await prisma.monthlyReturn.deleteMany({
      where: { backtestId },
    });

    revalidatePath(`/backtests/${backtestId}`);
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || "Failed to delete monthly returns");
  }
}

// ============== Duplicate Backtest ==============

// ============== Calculate Sharpe Ratio ==============

export async function calculateSharpeRatioAction(backtestId: string) {
  try {
    if (!backtestId) throw new Error("Backtest ID is required");

    const { calculateBestSharpeRatio } = await import("@/lib/calculations");

    const backtest = await prisma.backtestResult.findUnique({
      where: { id: backtestId },
      include: {
        equityCurve: {
          orderBy: { date: "asc" },
        },
        monthlyReturns: {
          orderBy: [{ year: "asc" }, { month: "asc" }],
        },
      },
    });

    if (!backtest) {
      throw new Error("Backtest not found");
    }

    // Calculate period days
    const startDate = new Date(backtest.startDate);
    const endDate = new Date(backtest.endDate);
    const periodDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Get the best Sharpe Ratio calculation
    const { sharpeRatio, method } = calculateBestSharpeRatio(
      backtest.monthlyReturns,
      backtest.equityCurve,
      backtest.netProfitPercent ? Number(backtest.netProfitPercent) : undefined,
      periodDays,
      backtest.maxDrawdownPercent
        ? Number(backtest.maxDrawdownPercent)
        : undefined
    );

    if (sharpeRatio === null) {
      throw new Error(
        "Unable to calculate Sharpe Ratio. Please add monthly returns or equity curve data first."
      );
    }

    // Update the backtest with the calculated Sharpe Ratio
    await prisma.backtestResult.update({
      where: { id: backtestId },
      data: {
        sharpeRatio: sharpeRatio,
      },
    });

    revalidatePath(`/backtests/${backtestId}`);
    revalidatePath("/backtests");
    revalidatePath("/");

    return {
      sharpeRatio: Number(sharpeRatio.toFixed(4)),
      method,
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || "Failed to calculate Sharpe Ratio");
  }
}

// ============== Calculate Profit Consistency ==============

export async function calculateProfitConsistencyAction(
  backtestId: string,
  threshold: number = 20,
  riskPerTrade?: number // Optional: if provided, use R-Multiple × Risk
) {
  try {
    if (!backtestId) throw new Error("Backtest ID is required");

    const { calculateProfitConsistency } = await import("@/lib/calculations");

    // Fetch trade journal entries linked to this backtest
    const journalEntries = await prisma.tradeJournalEntry.findMany({
      where: { backtestId },
      orderBy: { entryDate: "asc" },
      select: {
        id: true,
        entryDate: true,
        pnl: true,
        rMultiple: true,
      },
    });

    if (journalEntries.length < 2) {
      return {
        consistencyPercent: null,
        passed: false,
        bestDayProfit: 0,
        bestDayDate: null,
        totalProfit: 0,
        profitableDays: 0,
        losingDays: 0,
        threshold,
        message: `ต้องมี Trade Journal อย่างน้อย 2 รายการ (ปัจจุบันมี ${journalEntries.length} รายการ)`,
        method: riskPerTrade ? "r_multiple" : "trade_journal",
        tradesCount: journalEntries.length,
        riskPerTrade,
      };
    }

    let dailyPnL: { date: string; pnl: number }[];
    let method: string;

    if (riskPerTrade && riskPerTrade > 0) {
      // Method 2: Use R-Multiple × Risk per Trade
      dailyPnL = journalEntries
        .filter((entry) => entry.rMultiple !== null)
        .map((entry) => ({
          date: entry.entryDate.toISOString().split("T")[0],
          pnl: Number(entry.rMultiple) * riskPerTrade,
        }));
      method = "r_multiple";

      if (dailyPnL.length < 2) {
        // Fallback to P/L if not enough R-Multiple data
        dailyPnL = journalEntries
          .filter((entry) => entry.pnl !== null)
          .map((entry) => ({
            date: entry.entryDate.toISOString().split("T")[0],
            pnl: Number(entry.pnl),
          }));
        method = "trade_journal";
      }
    } else {
      // Method 1: Use P/L directly
      dailyPnL = journalEntries
        .filter((entry) => entry.pnl !== null)
        .map((entry) => ({
          date: entry.entryDate.toISOString().split("T")[0],
          pnl: Number(entry.pnl),
        }));
      method = "trade_journal";
    }

    if (dailyPnL.length < 2) {
      return {
        consistencyPercent: null,
        passed: false,
        bestDayProfit: 0,
        bestDayDate: null,
        totalProfit: 0,
        profitableDays: 0,
        losingDays: 0,
        threshold,
        message: riskPerTrade
          ? `ต้องมี Trade ที่มี R-Multiple อย่างน้อย 2 รายการ`
          : `ต้องมี Trade ที่มี P/L อย่างน้อย 2 รายการ`,
        method,
        tradesCount: journalEntries.length,
        riskPerTrade,
      };
    }

    // Calculate profit consistency
    const result = calculateProfitConsistency(dailyPnL, threshold);

    revalidatePath(`/backtests/${backtestId}`);

    return {
      ...result,
      method,
      tradesCount: dailyPnL.length,
      riskPerTrade,
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || "Failed to calculate Profit Consistency");
  }
}

// ============== Calculate Profit Consistency from Backtest Stats ==============

export async function calculateProfitConsistencyFromStatsAction(
  backtestId: string,
  riskPercent: number,
  rrRatio: number,
  threshold: number = 20
) {
  try {
    if (!backtestId) throw new Error("Backtest ID is required");
    if (riskPercent <= 0) throw new Error("Risk % must be greater than 0");
    if (rrRatio <= 0) throw new Error("RR Ratio must be greater than 0");

    // Fetch backtest stats
    const backtest = await prisma.backtestResult.findUnique({
      where: { id: backtestId },
      select: {
        winningTrades: true,
        losingTrades: true,
        totalTrades: true,
        riskRewardRatio: true,
      },
    });

    if (!backtest) {
      throw new Error("Backtest not found");
    }

    const wins = backtest.winningTrades;
    const losses = backtest.losingTrades;
    const totalTrades = backtest.totalTrades;

    if (totalTrades < 2) {
      return {
        consistencyPercent: null,
        passed: false,
        bestDayProfit: 0,
        totalProfit: 0,
        profitableDays: wins,
        losingDays: losses,
        threshold,
        message: `ต้องมีอย่างน้อย 2 trades (ปัจจุบันมี ${totalTrades})`,
        method: "backtest_stats",
        riskPercent,
        rrRatio,
      };
    }

    // Calculate using the formula:
    // Best Day Profit = Risk × RR (one winning trade)
    // Total Profit = (Wins × Risk × RR) - (Losses × Risk)
    const bestDayProfit = riskPercent * rrRatio;
    const totalWinProfit = wins * riskPercent * rrRatio;
    const totalLossAmount = losses * riskPercent;
    const totalProfit = totalWinProfit - totalLossAmount;

    // Edge case: total profit is 0 or negative
    if (totalProfit <= 0) {
      return {
        consistencyPercent: null,
        passed: false,
        bestDayProfit,
        totalProfit,
        profitableDays: wins,
        losingDays: losses,
        threshold,
        message:
          totalProfit === 0
            ? "กำไรรวมเป็น 0 - ไม่สามารถคำนวณได้"
            : "กำไรรวมติดลบ - ไม่ผ่านเกณฑ์",
        method: "backtest_stats",
        riskPercent,
        rrRatio,
      };
    }

    // Calculate profit consistency
    const consistencyPercent = (bestDayProfit / totalProfit) * 100;
    const passed = consistencyPercent <= threshold;

    let message: string;
    if (passed) {
      message = `✓ ผ่านเกณฑ์ ${threshold}% (${consistencyPercent.toFixed(1)}%)`;
    } else {
      // Calculate how many more trades needed to pass
      // consistency = bestDay / total <= threshold/100
      // total >= bestDay / (threshold/100)
      // total >= bestDay * 100 / threshold
      const neededTotal = (bestDayProfit * 100) / threshold;
      const neededExtraProfit = neededTotal - totalProfit;
      const neededExtraWins = Math.ceil(
        neededExtraProfit / (riskPercent * rrRatio)
      );
      message = `✗ ไม่ผ่านเกณฑ์ ${threshold}% - ต้องชนะเพิ่มอีก ~${neededExtraWins} ไม้เพื่อผ่าน`;
    }

    return {
      consistencyPercent,
      passed,
      bestDayProfit,
      totalProfit,
      profitableDays: wins,
      losingDays: losses,
      threshold,
      message,
      method: "backtest_stats",
      riskPercent,
      rrRatio,
      totalTrades,
    };
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || "Failed to calculate Profit Consistency");
  }
}

export async function duplicateBacktest(id: string) {
  try {
    if (!id) throw new Error("Backtest ID is required");

    const original = await prisma.backtestResult.findUnique({
      where: { id },
      include: {
        equityCurve: true,
        monthlyReturns: true,
      },
    });

    if (!original) {
      throw new Error("Backtest not found");
    }

    // Create a copy with "(Copy)" appended to name
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      id: _id,
      createdAt: _createdAt,
      equityCurve,
      monthlyReturns,
      ...data
    } = original;

    const newBacktest = await prisma.backtestResult.create({
      data: {
        ...data,
        name: original.name ? `${original.name} (Copy)` : "(Copy)",
        // Also copy equity curve and monthly returns
        equityCurve: {
          create: equityCurve.map((p) => ({
            date: p.date,
            equity: p.equity,
            drawdown: p.drawdown,
          })),
        },
        monthlyReturns: {
          create: monthlyReturns.map((r) => ({
            year: r.year,
            month: r.month,
            returnPercent: r.returnPercent,
            trades: r.trades,
          })),
        },
      },
    });

    revalidatePath("/backtests");
    revalidatePath(`/systems/${original.tradingSystemId}`);
    revalidatePath("/");

    return newBacktest.id;
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || "Failed to duplicate backtest");
  }
}
