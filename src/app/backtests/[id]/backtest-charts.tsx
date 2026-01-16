"use client";

import { EquityCurveChart } from "@/components/charts/equity-curve-chart";
import { MonthlyReturnsHeatmap } from "@/components/charts/monthly-returns-heatmap";
import {
  addEquityPoints,
  deleteEquityPoints,
  addMonthlyReturns,
  deleteMonthlyReturns,
} from "../actions";

// Support both Decimal objects (from Prisma) and plain numbers (serialized)
interface EquityPoint {
  id: string;
  date: Date | string;
  equity: number | { toNumber?(): number; toString(): string };
  drawdown: number | { toNumber?(): number; toString(): string } | null;
}

interface MonthlyReturn {
  id: string;
  year: number;
  month: number;
  returnPercent: number | { toNumber?(): number; toString(): string };
  trades: number | null;
}

interface BacktestChartsProps {
  backtestId: string;
  equityCurve: EquityPoint[];
  monthlyReturns: MonthlyReturn[];
}

// Helper to convert Decimal or number to number
function toNumber(
  value: number | { toNumber?(): number; toString(): string }
): number {
  if (typeof value === "number") return value;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value.toString());
}

export function BacktestCharts({
  backtestId,
  equityCurve,
  monthlyReturns,
}: BacktestChartsProps) {
  // Convert to serializable format
  const equityData = equityCurve.map((p) => ({
    date:
      typeof p.date === "string"
        ? p.date.split("T")[0]
        : p.date.toISOString().split("T")[0],
    equity: toNumber(p.equity),
    drawdown: p.drawdown ? toNumber(p.drawdown) : null,
  }));

  const monthlyData = monthlyReturns.map((r) => ({
    id: r.id,
    year: r.year,
    month: r.month,
    returnPercent: toNumber(r.returnPercent),
    trades: r.trades,
  }));

  async function handleAddEquityPoints(
    points: { date: string; equity: number; drawdown?: number | null }[]
  ) {
    await addEquityPoints(backtestId, points);
  }

  async function handleDeleteEquityPoints() {
    if (confirm("Are you sure you want to delete all equity curve data?")) {
      await deleteEquityPoints(backtestId);
    }
  }

  async function handleAddMonthlyReturns(
    returns: {
      year: number;
      month: number;
      returnPercent: number;
      trades?: number | null;
    }[]
  ) {
    await addMonthlyReturns(backtestId, returns);
  }

  async function handleDeleteMonthlyReturns() {
    if (confirm("Are you sure you want to delete all monthly returns data?")) {
      await deleteMonthlyReturns(backtestId);
    }
  }

  return (
    <div className="space-y-6">
      <EquityCurveChart
        data={equityData}
        onAddPoints={handleAddEquityPoints}
        onDeletePoints={handleDeleteEquityPoints}
      />
      <MonthlyReturnsHeatmap
        data={monthlyData}
        onAddReturns={handleAddMonthlyReturns}
        onDeleteReturns={handleDeleteMonthlyReturns}
      />
    </div>
  );
}
