import { Header } from "@/components/layout/header";
import prisma from "@/lib/prisma";
import { SystemCompareClient } from "./system-compare-client";

interface SystemWithStats {
  id: string;
  name: string;
  description: string | null;
  type: string;
  assetClass: string;
  timeframe: string | null;
  isActive: boolean;
  riskPerTrade: number | null;
  defaultRR: number | null;
  backtestCount: number;
  // Aggregated metrics
  avgWinRate: number | null;
  avgReturnPercent: number | null;
  avgProfitFactor: number | null;
  avgSharpeRatio: number | null;
  bestReturn: number | null;
  worstReturn: number | null;
  maxDrawdownWorst: number | null;
  profitableBacktests: number;
  returnStdDev: number | null;
  totalTrades: number;
  totalReturnPercent: number;
}

async function getSystemsWithStats(): Promise<SystemWithStats[]> {
  const systems = await prisma.tradingSystem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      backtests: {
        select: {
          winRate: true,
          netProfitPercent: true,
          profitFactor: true,
          sharpeRatio: true,
          maxDrawdownPercent: true,
          netProfit: true,
          totalTrades: true,
        },
      },
    },
  });

  return systems.map((system) => {
    const backtests = system.backtests;
    const count = backtests.length;

    if (count === 0) {
      return {
        id: system.id,
        name: system.name,
        description: system.description,
        type: system.type,
        assetClass: system.assetClass,
        timeframe: system.timeframe,
        isActive: system.isActive,
        riskPerTrade: system.riskPerTrade ? Number(system.riskPerTrade) : null,
        defaultRR: system.defaultRR ? Number(system.defaultRR) : null,
        backtestCount: 0,
        avgWinRate: null,
        avgReturnPercent: null,
        avgProfitFactor: null,
        avgSharpeRatio: null,
        bestReturn: null,
        worstReturn: null,
        maxDrawdownWorst: null,
        profitableBacktests: 0,
        returnStdDev: null,
        totalTrades: 0,
        totalReturnPercent: 0,
      };
    }

    // Calculate averages
    const winRates = backtests
      .map((b) => (b.winRate ? Number(b.winRate) : null))
      .filter((v): v is number => v !== null);
    const returns = backtests
      .map((b) => (b.netProfitPercent ? Number(b.netProfitPercent) : null))
      .filter((v): v is number => v !== null);
    const profitFactors = backtests
      .map((b) => (b.profitFactor ? Number(b.profitFactor) : null))
      .filter((v): v is number => v !== null);
    const sharpeRatios = backtests
      .map((b) => (b.sharpeRatio ? Number(b.sharpeRatio) : null))
      .filter((v): v is number => v !== null);
    const drawdowns = backtests
      .map((b) => (b.maxDrawdownPercent ? Number(b.maxDrawdownPercent) : null))
      .filter((v): v is number => v !== null);

    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

    // Calculate standard deviation for consistency
    const calcStdDev = (arr: number[]): number | null => {
      if (arr.length < 2) return null;
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      const squaredDiffs = arr.map((v) => Math.pow(v - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / arr.length;
      return Math.sqrt(variance);
    };

    // Count profitable backtests
    const profitableCount = backtests.filter(
      (b) => b.netProfit && Number(b.netProfit) > 0
    ).length;

    // Sum total trades
    const totalTradesSum = backtests.reduce(
      (sum, b) => sum + (b.totalTrades || 0),
      0
    );

    // Sum total return percent
    const totalReturnSum = returns.reduce((sum, r) => sum + r, 0);

    return {
      id: system.id,
      name: system.name,
      description: system.description,
      type: system.type,
      assetClass: system.assetClass,
      timeframe: system.timeframe,
      isActive: system.isActive,
      riskPerTrade: system.riskPerTrade ? Number(system.riskPerTrade) : null,
      defaultRR: system.defaultRR ? Number(system.defaultRR) : null,
      backtestCount: count,
      avgWinRate: avg(winRates),
      avgReturnPercent: avg(returns),
      avgProfitFactor: avg(profitFactors),
      avgSharpeRatio: avg(sharpeRatios),
      bestReturn: returns.length > 0 ? Math.max(...returns) : null,
      worstReturn: returns.length > 0 ? Math.min(...returns) : null,
      maxDrawdownWorst: drawdowns.length > 0 ? Math.min(...drawdowns) : null, // Most negative = worst
      profitableBacktests: profitableCount,
      returnStdDev: calcStdDev(returns),
      totalTrades: totalTradesSum,
      totalReturnPercent: totalReturnSum,
    };
  });
}

export default async function CompareSystemsPage() {
  const systems = await getSystemsWithStats();

  return (
    <>
      <Header title="Compare Systems" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <p className="text-muted-foreground">
          Compare trading systems based on aggregated backtest performance
        </p>
        <SystemCompareClient systems={systems} />
      </div>
    </>
  );
}
