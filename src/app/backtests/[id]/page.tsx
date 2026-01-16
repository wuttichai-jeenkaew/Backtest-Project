import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft } from "lucide-react";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { DeleteBacktestButton } from "./delete-button";
import { DuplicateBacktestButton } from "./duplicate-button";
import { BacktestCharts } from "./backtest-charts";
import { TradingViewSection } from "./tradingview-section";
import { CalculateSharpeButton } from "./calculate-sharpe-button";
import { ProfitConsistencyCalculator } from "./profit-consistency-calculator";

interface BacktestDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getBacktest(id: string) {
  return prisma.backtestResult.findUnique({
    where: { id },
    include: {
      tradingSystem: true,
      equityCurve: {
        orderBy: { date: "asc" },
      },
      monthlyReturns: {
        orderBy: [{ year: "asc" }, { month: "asc" }],
      },
    },
  });
}

export default async function BacktestDetailPage({
  params,
}: BacktestDetailPageProps) {
  const { id } = await params;
  const backtest = await getBacktest(id);

  if (!backtest) {
    notFound();
  }

  // Serialize Decimal objects to plain numbers for Client Components
  const serializedEquityCurve = backtest.equityCurve.map((point) => ({
    id: point.id,
    backtestId: point.backtestId,
    date: point.date.toISOString(),
    equity: Number(point.equity),
    drawdown: point.drawdown ? Number(point.drawdown) : null,
  }));

  const serializedMonthlyReturns = backtest.monthlyReturns.map((ret) => ({
    id: ret.id,
    backtestId: ret.backtestId,
    year: ret.year,
    month: ret.month,
    returnPercent: Number(ret.returnPercent),
    trades: ret.trades,
  }));

  const metrics = [
    {
      label: "Net Profit",
      value: `$${Number(backtest.netProfit).toLocaleString()}`,
      color:
        Number(backtest.netProfit) >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: "Return %",
      value: backtest.netProfitPercent
        ? `${Number(backtest.netProfitPercent).toFixed(2)}%`
        : "-",
      color:
        Number(backtest.netProfitPercent) >= 0
          ? "text-green-600"
          : "text-red-600",
    },
    {
      label: "Win Rate",
      value: backtest.winRate ? `${Number(backtest.winRate).toFixed(1)}%` : "-",
    },
    {
      label: "Profit Factor",
      value: backtest.profitFactor
        ? Number(backtest.profitFactor).toFixed(2)
        : "-",
    },
    {
      label: "Sharpe Ratio",
      value: backtest.sharpeRatio
        ? Number(backtest.sharpeRatio).toFixed(2)
        : "-",
    },
    {
      label: "Max Drawdown",
      value: backtest.maxDrawdownPercent
        ? `${Number(backtest.maxDrawdownPercent).toFixed(1)}%`
        : "-",
      color: "text-red-600",
    },
  ];

  const tradeStats = [
    { label: "Total Trades", value: backtest.totalTrades },
    { label: "Winning Trades", value: backtest.winningTrades },
    { label: "Losing Trades", value: backtest.losingTrades },
    {
      label: "Average Win",
      value: backtest.averageWin
        ? `$${Number(backtest.averageWin).toLocaleString()}`
        : "-",
    },
    {
      label: "Average Loss",
      value: backtest.averageLoss
        ? `$${Number(backtest.averageLoss).toLocaleString()}`
        : "-",
    },
    {
      label: "Average Trade",
      value: backtest.averageTrade
        ? `$${Number(backtest.averageTrade).toFixed(2)}`
        : "-",
    },
    {
      label: "Largest Win",
      value: backtest.largestWin
        ? `$${Number(backtest.largestWin).toLocaleString()}`
        : "-",
    },
    {
      label: "Largest Loss",
      value: backtest.largestLoss
        ? `$${Number(backtest.largestLoss).toLocaleString()}`
        : "-",
    },
    {
      label: "Expectancy",
      value: backtest.expectancy
        ? `$${Number(backtest.expectancy).toFixed(2)}`
        : "-",
    },
    {
      label: "Max Consecutive Wins",
      value: backtest.maxConsecutiveWins ?? "-",
    },
    {
      label: "Max Consecutive Losses",
      value: backtest.maxConsecutiveLosses ?? "-",
    },
  ];

  return (
    <>
      <Header title={`${backtest.tradingSystem.name} - ${backtest.symbol}`} />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/backtests">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to List
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/backtests/${backtest.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DuplicateBacktestButton id={backtest.id} />
          <DeleteBacktestButton id={backtest.id} symbol={backtest.symbol} />
        </div>

        {/* Info Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Link
                    href={`/systems/${backtest.tradingSystemId}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {backtest.tradingSystem.name}
                  </Link>
                  <Badge variant="outline">{backtest.symbol}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(backtest.startDate, "MMMM d, yyyy")} -{" "}
                  {format(backtest.endDate, "MMMM d, yyyy")}
                </p>
                {backtest.name && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {backtest.name}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">
                  Starting Capital
                </p>
                <p className="font-medium">
                  ${Number(backtest.startingCapital).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Ending Capital
                </p>
                <p className="font-medium">
                  ${Number(backtest.endingCapital).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className={`text-2xl font-bold ${metric.color || ""}`}>
                  {metric.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trade Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {tradeStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex justify-between border-b pb-2"
                >
                  <span className="text-muted-foreground">{stat.label}</span>
                  <span className="font-medium">{stat.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Metrics & Sharpe Ratio Calculator */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics - คำนวณ Sharpe Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-medium mb-2">
                  ค่า Sharpe Ratio ปัจจุบัน
                </h4>
                <p className="text-3xl font-bold">
                  {backtest.sharpeRatio
                    ? Number(backtest.sharpeRatio).toFixed(2)
                    : "-"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Number(backtest.sharpeRatio) >= 2
                    ? "✓ ดีมาก (>2.0)"
                    : Number(backtest.sharpeRatio) >= 1
                    ? "○ ยอมรับได้ (1.0-2.0)"
                    : backtest.sharpeRatio
                    ? "△ ต้องปรับปรุง (<1.0)"
                    : "ยังไม่มีข้อมูล"}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">คำนวณอัตโนมัติ</h4>
                <CalculateSharpeButton
                  backtestId={backtest.id}
                  currentValue={
                    backtest.sharpeRatio ? Number(backtest.sharpeRatio) : null
                  }
                  hasMonthlyReturns={backtest.monthlyReturns.length >= 3}
                  hasEquityCurve={backtest.equityCurve.length >= 10}
                  hasDrawdownData={backtest.maxDrawdownPercent !== null}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profit Consistency Calculator */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Consistency Rule</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfitConsistencyCalculator
              backtestId={backtest.id}
              winningTrades={backtest.winningTrades}
              losingTrades={backtest.losingTrades}
              totalTrades={backtest.totalTrades}
              riskRewardRatio={
                backtest.riskRewardRatio
                  ? Number(backtest.riskRewardRatio)
                  : null
              }
              defaultRiskPercent={
                backtest.tradingSystem.riskPerTrade
                  ? Number(backtest.tradingSystem.riskPerTrade)
                  : null
              }
              defaultRR={
                backtest.tradingSystem.defaultRR
                  ? Number(backtest.tradingSystem.defaultRR)
                  : null
              }
            />
          </CardContent>
        </Card>

        {/* Charts - Equity Curve & Monthly Returns */}
        <BacktestCharts
          backtestId={backtest.id}
          equityCurve={serializedEquityCurve}
          monthlyReturns={serializedMonthlyReturns}
        />

        {/* TradingView Chart */}
        <TradingViewSection
          symbol={backtest.symbol}
          timeframe={backtest.tradingSystem.timeframe}
        />

        {/* Notes */}
        {backtest.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{backtest.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Source</span>
                <span>{backtest.dataSource || "Not specified"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{format(backtest.createdAt, "PPpp")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{format(backtest.updatedAt, "PPpp")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
