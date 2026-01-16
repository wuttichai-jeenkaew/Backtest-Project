import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { StatsClient } from "@/components/stats/stats-client";

async function getStatisticsData() {
  const [systems, backtests, tags] = await Promise.all([
    prisma.tradingSystem.findMany({
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    }),
    prisma.backtestResult.findMany({
      include: {
        tradingSystem: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  // Format systems with tag IDs
  const formattedSystems = systems.map((system) => ({
    id: system.id,
    name: system.name,
    tagIds: system.tags.map((st) => st.tagId),
  }));

  // Format backtests for client - serialize Decimal values
  const formattedBacktests = backtests.map((b) => ({
    id: b.id,
    name: b.name,
    symbol: b.symbol,
    tradingSystemId: b.tradingSystemId,
    winRate: b.winRate ? Number(b.winRate) : null,
    profitFactor: b.profitFactor ? Number(b.profitFactor) : null,
    sharpeRatio: b.sharpeRatio ? Number(b.sharpeRatio) : null,
    maxDrawdown: b.maxDrawdown ? Number(b.maxDrawdown) : null,
    maxDrawdownPercent: b.maxDrawdownPercent
      ? Number(b.maxDrawdownPercent)
      : null,
    totalTrades: b.totalTrades,
    winningTrades: b.winningTrades,
    losingTrades: b.losingTrades,
    netProfit: Number(b.netProfit),
    netProfitPercent: b.netProfitPercent ? Number(b.netProfitPercent) : null,
    maxConsecutiveWins: b.maxConsecutiveWins,
    maxConsecutiveLosses: b.maxConsecutiveLosses,
    riskRewardRatio: b.riskRewardRatio ? Number(b.riskRewardRatio) : null,
    expectancy: b.expectancy ? Number(b.expectancy) : null,
    createdAt: b.createdAt.toISOString(),
    tradingSystem: {
      id: b.tradingSystem.id,
      name: b.tradingSystem.name,
    },
  }));

  // Format tags
  const formattedTags = tags.map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
  }));

  return {
    systems: formattedSystems,
    backtests: formattedBacktests,
    tags: formattedTags,
  };
}

export default async function StatisticsPage() {
  const { systems, backtests, tags } = await getStatisticsData();

  if (backtests.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Statistics & Analytics
          </h1>
          <p className="text-muted-foreground">
            สถิติและการวิเคราะห์ผลการ Backtest
          </p>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">ยังไม่มีข้อมูล</h3>
            <p className="text-sm text-muted-foreground">
              เพิ่ม Backtest เพื่อดูสถิติและการวิเคราะห์
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Statistics & Analytics
        </h1>
        <p className="text-muted-foreground">
          สถิติและการวิเคราะห์ผลการ Backtest
        </p>
      </div>

      <StatsClient systems={systems} tags={tags} backtests={backtests} />
    </div>
  );
}
