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
    const startingCapital = parseFloat(formData.get("startingCapital") as string);
    const endingCapital = parseFloat(formData.get("endingCapital") as string);
    const totalTrades = parseInt(formData.get("totalTrades") as string);
    const winningTrades = parseInt(formData.get("winningTrades") as string);
    const losingTrades = parseInt(formData.get("losingTrades") as string);

    // Validation
    if (!tradingSystemId) throw new Error("Trading system is required");
    if (!symbol || !symbol.trim()) throw new Error("Symbol is required");
    if (isNaN(startingCapital) || startingCapital <= 0) throw new Error("Starting capital must be greater than 0");
    if (isNaN(endingCapital)) throw new Error("Ending capital is required");
    if (isNaN(totalTrades) || totalTrades < 0) throw new Error("Total trades must be 0 or greater");

    // Calculate derived values
    const netProfit = endingCapital - startingCapital;
    const netProfitPercent = startingCapital > 0 ? (netProfit / startingCapital) * 100 : 0;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    // Optional fields
    const grossProfit = formData.get("grossProfit")
      ? parseFloat(formData.get("grossProfit") as string)
      : null;
    const grossLoss = formData.get("grossLoss")
      ? parseFloat(formData.get("grossLoss") as string)
      : null;
    const maxDrawdown = formData.get("maxDrawdown")
      ? parseFloat(formData.get("maxDrawdown") as string)
      : null;
    const maxDrawdownPercent = formData.get("maxDrawdownPercent")
      ? parseFloat(formData.get("maxDrawdownPercent") as string)
      : null;
    const sharpeRatio = formData.get("sharpeRatio")
      ? parseFloat(formData.get("sharpeRatio") as string)
      : null;
    const averageWin = formData.get("averageWin")
      ? parseFloat(formData.get("averageWin") as string)
      : null;
    const averageLoss = formData.get("averageLoss")
      ? parseFloat(formData.get("averageLoss") as string)
      : null;
    const largestWin = formData.get("largestWin")
      ? parseFloat(formData.get("largestWin") as string)
      : null;
    const largestLoss = formData.get("largestLoss")
      ? parseFloat(formData.get("largestLoss") as string)
      : null;
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
      grossProfit && grossLoss && grossLoss > 0 ? grossProfit / grossLoss : null;

    // Calculate expectancy
    const expectancy =
      averageWin && averageLoss && winRate
        ? (winRate / 100) * averageWin - ((100 - winRate) / 100) * Math.abs(averageLoss)
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
        sharpeRatio,
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
    const startingCapital = parseFloat(formData.get("startingCapital") as string);
    const endingCapital = parseFloat(formData.get("endingCapital") as string);
    const totalTrades = parseInt(formData.get("totalTrades") as string);
    const winningTrades = parseInt(formData.get("winningTrades") as string);
    const losingTrades = parseInt(formData.get("losingTrades") as string);

    // Validation
    if (!tradingSystemId) throw new Error("Trading system is required");
    if (!symbol || !symbol.trim()) throw new Error("Symbol is required");
    if (isNaN(startingCapital) || startingCapital <= 0) throw new Error("Starting capital must be greater than 0");
    if (isNaN(endingCapital)) throw new Error("Ending capital is required");
    if (isNaN(totalTrades) || totalTrades < 0) throw new Error("Total trades must be 0 or greater");

    const netProfit = endingCapital - startingCapital;
    const netProfitPercent = startingCapital > 0 ? (netProfit / startingCapital) * 100 : 0;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    const grossProfit = formData.get("grossProfit")
      ? parseFloat(formData.get("grossProfit") as string)
      : null;
    const grossLoss = formData.get("grossLoss")
      ? parseFloat(formData.get("grossLoss") as string)
      : null;
    const maxDrawdown = formData.get("maxDrawdown")
      ? parseFloat(formData.get("maxDrawdown") as string)
      : null;
    const maxDrawdownPercent = formData.get("maxDrawdownPercent")
      ? parseFloat(formData.get("maxDrawdownPercent") as string)
      : null;
    const sharpeRatio = formData.get("sharpeRatio")
      ? parseFloat(formData.get("sharpeRatio") as string)
      : null;
    const averageWin = formData.get("averageWin")
      ? parseFloat(formData.get("averageWin") as string)
      : null;
    const averageLoss = formData.get("averageLoss")
      ? parseFloat(formData.get("averageLoss") as string)
      : null;
    const largestWin = formData.get("largestWin")
      ? parseFloat(formData.get("largestWin") as string)
      : null;
    const largestLoss = formData.get("largestLoss")
      ? parseFloat(formData.get("largestLoss") as string)
      : null;
    const maxConsecutiveWins = formData.get("maxConsecutiveWins")
      ? parseInt(formData.get("maxConsecutiveWins") as string)
      : null;
    const maxConsecutiveLosses = formData.get("maxConsecutiveLosses")
      ? parseInt(formData.get("maxConsecutiveLosses") as string)
      : null;
    const notes = formData.get("notes") as string | null;
    const dataSource = formData.get("dataSource") as string | null;

    const profitFactor =
      grossProfit && grossLoss && grossLoss > 0 ? grossProfit / grossLoss : null;

    const expectancy =
      averageWin && averageLoss && winRate
        ? (winRate / 100) * averageWin - ((100 - winRate) / 100) * Math.abs(averageLoss)
        : null;

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
        sharpeRatio,
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

export async function addEquityPoints(backtestId: string, points: EquityPointInput[]) {
  try {
    if (!backtestId) throw new Error("Backtest ID is required");
    if (!points || points.length === 0) throw new Error("At least one equity point is required");

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

export async function addMonthlyReturns(backtestId: string, returns: MonthlyReturnInput[]) {
  try {
    if (!backtestId) throw new Error("Backtest ID is required");
    if (!returns || returns.length === 0) throw new Error("At least one monthly return is required");

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
    const { id: _id, createdAt: _createdAt, equityCurve, monthlyReturns, ...data } = original;

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
