"use client";

import { EquityCurveChart } from "@/components/charts/equity-curve-chart";
import { MonthlyReturnsHeatmap } from "@/components/charts/monthly-returns-heatmap";
import {
  addEquityPoints,
  deleteEquityPoints,
  addMonthlyReturns,
  deleteMonthlyReturns,
} from "../actions";
import { Decimal } from "@prisma/client/runtime/library";

interface EquityPoint {
  id: string;
  date: Date;
  equity: Decimal;
  drawdown: Decimal | null;
}

interface MonthlyReturn {
  id: string;
  year: number;
  month: number;
  returnPercent: Decimal;
  trades: number | null;
}

interface BacktestChartsProps {
  backtestId: string;
  equityCurve: EquityPoint[];
  monthlyReturns: MonthlyReturn[];
}

export function BacktestCharts({
  backtestId,
  equityCurve,
  monthlyReturns,
}: BacktestChartsProps) {
  // Convert to serializable format
  const equityData = equityCurve.map((p) => ({
    date: p.date.toISOString().split("T")[0],
    equity: Number(p.equity),
    drawdown: p.drawdown ? Number(p.drawdown) : null,
  }));

  const monthlyData = monthlyReturns.map((r) => ({
    id: r.id,
    year: r.year,
    month: r.month,
    returnPercent: Number(r.returnPercent),
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
    returns: { year: number; month: number; returnPercent: number; trades?: number | null }[]
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
