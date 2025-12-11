"use server";

import prisma from "@/lib/prisma";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from "date-fns";

export interface DailyPL {
  date: string;
  profit: number;
  loss: number;
  netPL: number;
  trades: number;
  winRate: number;
}

export interface WeeklyPL {
  weekStart: string;
  weekEnd: string;
  profit: number;
  loss: number;
  netPL: number;
  trades: number;
  winRate: number;
}

export interface MonthlyPL {
  month: string;
  year: number;
  profit: number;
  loss: number;
  netPL: number;
  trades: number;
  winRate: number;
}

export async function getCalendarData(year: number, month: number) {
  try {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    // Get all journal entries for the month
    const journalEntries = await prisma.tradeJournalEntry.findMany({
      where: {
        entryDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        entryDate: true,
        direction: true,
        entryPrice: true,
        exitPrice: true,
        quantity: true,
        pnl: true,
        symbol: true,
      },
    });

    // Group by date
    const dailyData: Record<string, DailyPL> = {};

    journalEntries.forEach((entry) => {
      const dateKey = format(entry.entryDate, "yyyy-MM-dd");
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          profit: 0,
          loss: 0,
          netPL: 0,
          trades: 0,
          winRate: 0,
        };
      }

      const pl = Number(entry.pnl) || 0;
      dailyData[dateKey].trades += 1;
      dailyData[dateKey].netPL += pl;

      if (pl >= 0) {
        dailyData[dateKey].profit += pl;
      } else {
        dailyData[dateKey].loss += Math.abs(pl);
      }
    });

    // Calculate win rate for each day
    Object.keys(dailyData).forEach((dateKey) => {
      const dayEntries = journalEntries.filter(
        (e) => format(e.entryDate, "yyyy-MM-dd") === dateKey
      );
      const wins = dayEntries.filter((e) => Number(e.pnl) > 0).length;
      dailyData[dateKey].winRate = dayEntries.length > 0 
        ? (wins / dayEntries.length) * 100 
        : 0;
    });

    return { success: true, data: Object.values(dailyData) };
  } catch (error) {
    console.error("Error getting calendar data:", error);
    return { success: false, error: "ไม่สามารถโหลดข้อมูลได้" };
  }
}

export async function getWeeklyPL(year: number, month: number) {
  try {
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const journalEntries = await prisma.tradeJournalEntry.findMany({
      where: {
        entryDate: {
          gte: startOfWeek(startDate, { weekStartsOn: 1 }),
          lte: endOfWeek(endDate, { weekStartsOn: 1 }),
        },
      },
      select: {
        entryDate: true,
        pnl: true,
      },
    });

    // Group by week
    const weeklyData: Record<string, WeeklyPL> = {};

    journalEntries.forEach((entry) => {
      const weekStart = startOfWeek(entry.entryDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(entry.entryDate, { weekStartsOn: 1 });
      const weekKey = format(weekStart, "yyyy-MM-dd");

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          weekStart: format(weekStart, "yyyy-MM-dd"),
          weekEnd: format(weekEnd, "yyyy-MM-dd"),
          profit: 0,
          loss: 0,
          netPL: 0,
          trades: 0,
          winRate: 0,
        };
      }

      const pl = Number(entry.pnl) || 0;
      weeklyData[weekKey].trades += 1;
      weeklyData[weekKey].netPL += pl;

      if (pl >= 0) {
        weeklyData[weekKey].profit += pl;
      } else {
        weeklyData[weekKey].loss += Math.abs(pl);
      }
    });

    // Calculate win rate for each week
    Object.keys(weeklyData).forEach((weekKey) => {
      const weekEntries = journalEntries.filter((e) => {
        const entryWeekStart = format(startOfWeek(e.entryDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
        return entryWeekStart === weekKey;
      });
      const wins = weekEntries.filter((e) => Number(e.pnl) > 0).length;
      weeklyData[weekKey].winRate = weekEntries.length > 0
        ? (wins / weekEntries.length) * 100
        : 0;
    });

    return { success: true, data: Object.values(weeklyData).sort((a, b) => a.weekStart.localeCompare(b.weekStart)) };
  } catch (error) {
    console.error("Error getting weekly P/L:", error);
    return { success: false, error: "ไม่สามารถโหลดข้อมูลได้" };
  }
}

export async function getMonthlyPL(year: number) {
  try {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const journalEntries = await prisma.tradeJournalEntry.findMany({
      where: {
        entryDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        entryDate: true,
        pnl: true,
      },
    });

    // Group by month
    const monthlyData: Record<string, MonthlyPL> = {};

    journalEntries.forEach((entry) => {
      const monthKey = format(entry.entryDate, "yyyy-MM");
      const monthName = format(entry.entryDate, "MMMM");

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthName,
          year: year,
          profit: 0,
          loss: 0,
          netPL: 0,
          trades: 0,
          winRate: 0,
        };
      }

      const pl = Number(entry.pnl) || 0;
      monthlyData[monthKey].trades += 1;
      monthlyData[monthKey].netPL += pl;

      if (pl >= 0) {
        monthlyData[monthKey].profit += pl;
      } else {
        monthlyData[monthKey].loss += Math.abs(pl);
      }
    });

    // Calculate win rate for each month
    Object.keys(monthlyData).forEach((monthKey) => {
      const monthEntries = journalEntries.filter(
        (e) => format(e.entryDate, "yyyy-MM") === monthKey
      );
      const wins = monthEntries.filter((e) => Number(e.pnl) > 0).length;
      monthlyData[monthKey].winRate = monthEntries.length > 0
        ? (wins / monthEntries.length) * 100
        : 0;
    });

    // Fill in missing months
    const allMonths: MonthlyPL[] = [];
    for (let m = 0; m < 12; m++) {
      const monthKey = format(new Date(year, m, 1), "yyyy-MM");
      const monthName = format(new Date(year, m, 1), "MMMM");
      
      if (monthlyData[monthKey]) {
        allMonths.push(monthlyData[monthKey]);
      } else {
        allMonths.push({
          month: monthName,
          year: year,
          profit: 0,
          loss: 0,
          netPL: 0,
          trades: 0,
          winRate: 0,
        });
      }
    }

    return { success: true, data: allMonths };
  } catch (error) {
    console.error("Error getting monthly P/L:", error);
    return { success: false, error: "ไม่สามารถโหลดข้อมูลได้" };
  }
}

export async function getYearlySummary() {
  try {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];

    const summaries = await Promise.all(
      years.map(async (year) => {
        const result = await getMonthlyPL(year);
        if (result.success && result.data) {
          const totalProfit = result.data.reduce((sum, m) => sum + m.profit, 0);
          const totalLoss = result.data.reduce((sum, m) => sum + m.loss, 0);
          const totalTrades = result.data.reduce((sum, m) => sum + m.trades, 0);
          const netPL = totalProfit - totalLoss;

          return {
            year,
            profit: totalProfit,
            loss: totalLoss,
            netPL,
            trades: totalTrades,
          };
        }
        return { year, profit: 0, loss: 0, netPL: 0, trades: 0 };
      })
    );

    return { success: true, data: summaries };
  } catch (error) {
    console.error("Error getting yearly summary:", error);
    return { success: false, error: "ไม่สามารถโหลดข้อมูลได้" };
  }
}
