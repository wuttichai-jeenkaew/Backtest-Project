import { Header } from "@/components/layout/header";
import prisma from "@/lib/prisma";
import { CompareClient } from "./compare-client";

async function getBacktestsForComparison() {
  const backtests = await prisma.backtestResult.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      tradingSystem: {
        select: {
          name: true,
        },
      },
    },
  });

  // Serialize Decimal to number for Client Component
  return backtests.map((bt) => ({
    id: bt.id,
    name: bt.name,
    symbol: bt.symbol,
    startDate: bt.startDate,
    endDate: bt.endDate,
    startingCapital: bt.startingCapital ? Number(bt.startingCapital) : null,
    endingCapital: bt.endingCapital ? Number(bt.endingCapital) : null,
    netProfit: bt.netProfit ? Number(bt.netProfit) : null,
    netProfitPercent: bt.netProfitPercent ? Number(bt.netProfitPercent) : null,
    winRate: bt.winRate ? Number(bt.winRate) : null,
    profitFactor: bt.profitFactor ? Number(bt.profitFactor) : null,
    sharpeRatio: bt.sharpeRatio ? Number(bt.sharpeRatio) : null,
    maxDrawdownPercent: bt.maxDrawdownPercent ? Number(bt.maxDrawdownPercent) : null,
    totalTrades: bt.totalTrades,
    winningTrades: bt.winningTrades,
    losingTrades: bt.losingTrades,
    averageWin: bt.averageWin ? Number(bt.averageWin) : null,
    averageLoss: bt.averageLoss ? Number(bt.averageLoss) : null,
    expectancy: bt.expectancy ? Number(bt.expectancy) : null,
    tradingSystem: bt.tradingSystem,
  }));
}

export default async function ComparePage() {
  const backtests = await getBacktestsForComparison();

  return (
    <>
      <Header title="Compare Backtests" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <p className="text-muted-foreground">
          Select backtests to compare side by side
        </p>
        <CompareClient backtests={backtests} />
      </div>
    </>
  );
}
