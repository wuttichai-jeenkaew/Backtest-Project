"use client";

import { useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Activity,
  Calendar,
  Percent,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { StatsCharts } from "@/components/stats/stats-charts";
import { StatsFilter } from "@/components/stats/stats-filter";

interface BacktestData {
  id: string;
  name: string | null;
  symbol: string;
  tradingSystemId: string;
  winRate: number | null;
  profitFactor: number | null;
  sharpeRatio: number | null;
  maxDrawdown: number | null;
  maxDrawdownPercent: number | null;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  netProfit: number;
  netProfitPercent: number | null;
  maxConsecutiveWins: number | null;
  maxConsecutiveLosses: number | null;
  riskRewardRatio: number | null;
  expectancy: number | null;
  createdAt: string;
  tradingSystem: {
    id: string;
    name: string;
  };
}

interface SystemData {
  id: string;
  name: string;
  tagIds: string[];
}

interface TagData {
  id: string;
  name: string;
  color: string | null;
}

interface StatsClientProps {
  systems: SystemData[];
  tags: TagData[];
  backtests: BacktestData[];
}

export function StatsClient({ systems, tags, backtests }: StatsClientProps) {
  const [filters, setFilters] = useState<{
    systemId: string | null;
    tagId: string | null;
  }>({
    systemId: null,
    tagId: null,
  });

  const handleFilterChange = useCallback(
    (newFilters: { systemId: string | null; tagId: string | null }) => {
      setFilters(newFilters);
    },
    []
  );

  // Filter backtests based on selected filters
  const filteredBacktests = useMemo(() => {
    let result = backtests;

    if (filters.systemId) {
      result = result.filter((b) => b.tradingSystemId === filters.systemId);
    }

    if (filters.tagId) {
      const systemsWithTag = systems.filter((s) =>
        s.tagIds.includes(filters.tagId!)
      );
      const systemIds = systemsWithTag.map((s) => s.id);
      result = result.filter((b) => systemIds.includes(b.tradingSystemId));
    }

    return result;
  }, [backtests, filters, systems]);

  // Calculate statistics from filtered data
  const stats = useMemo(() => {
    if (filteredBacktests.length === 0) {
      return null;
    }

    const avgWinRate =
      filteredBacktests.reduce((sum, b) => sum + Number(b.winRate || 0), 0) /
      filteredBacktests.length;
    const avgProfitFactor =
      filteredBacktests.reduce(
        (sum, b) => sum + Number(b.profitFactor || 0),
        0
      ) / filteredBacktests.length;
    const avgSharpeRatio =
      filteredBacktests.reduce(
        (sum, b) => sum + Number(b.sharpeRatio || 0),
        0
      ) / filteredBacktests.length;
    const avgMaxDrawdown =
      filteredBacktests.reduce(
        (sum, b) => sum + Number(b.maxDrawdownPercent || b.maxDrawdown || 0),
        0
      ) / filteredBacktests.length;

    const sortedByWinRate = [...filteredBacktests].sort(
      (a, b) => Number(b.winRate || 0) - Number(a.winRate || 0)
    );
    const bestWinRate = sortedByWinRate[0];
    const worstWinRate = sortedByWinRate[sortedByWinRate.length - 1];

    const sortedByPF = [...filteredBacktests].sort(
      (a, b) => Number(b.profitFactor || 0) - Number(a.profitFactor || 0)
    );
    const bestProfitFactor = sortedByPF[0];
    const worstProfitFactor = sortedByPF[sortedByPF.length - 1];

    const sortedByDrawdown = [...filteredBacktests].sort(
      (a, b) =>
        Number(a.maxDrawdownPercent || a.maxDrawdown || 0) -
        Number(b.maxDrawdownPercent || b.maxDrawdown || 0)
    );
    const lowestDrawdown = sortedByDrawdown[0];
    const highestDrawdown = sortedByDrawdown[sortedByDrawdown.length - 1];

    const totalTrades = filteredBacktests.reduce(
      (sum, b) => sum + b.totalTrades,
      0
    );
    const totalWinningTrades = filteredBacktests.reduce(
      (sum, b) => sum + b.winningTrades,
      0
    );
    const totalLosingTrades = filteredBacktests.reduce(
      (sum, b) => sum + b.losingTrades,
      0
    );

    const maxConsecutiveWins = Math.max(
      ...filteredBacktests.map((b) => b.maxConsecutiveWins || 0)
    );
    const maxConsecutiveLosses = Math.max(
      ...filteredBacktests.map((b) => b.maxConsecutiveLosses || 0)
    );

    const totalNetProfit = filteredBacktests.reduce(
      (sum, b) => sum + Number(b.netProfit),
      0
    );
    const profitableBacktests = filteredBacktests.filter(
      (b) => Number(b.netProfit) > 0
    ).length;
    const profitableRate =
      (profitableBacktests / filteredBacktests.length) * 100;

    const avgRiskReward =
      filteredBacktests.reduce(
        (sum, b) => sum + Number(b.riskRewardRatio || 0),
        0
      ) / filteredBacktests.length;
    const avgExpectancy =
      filteredBacktests.reduce((sum, b) => sum + Number(b.expectancy || 0), 0) /
      filteredBacktests.length;

    // System performance for filtered data
    const relevantSystemIds = [
      ...new Set(filteredBacktests.map((b) => b.tradingSystemId)),
    ];
    const systemPerformance = relevantSystemIds
      .map((sysId) => {
        const system = systems.find((s) => s.id === sysId);
        const sysBacktests = filteredBacktests.filter(
          (b) => b.tradingSystemId === sysId
        );
        if (!system || sysBacktests.length === 0) return null;

        return {
          id: system.id,
          name: system.name,
          backtestCount: sysBacktests.length,
          avgWinRate:
            sysBacktests.reduce((sum, b) => sum + Number(b.winRate || 0), 0) /
            sysBacktests.length,
          avgProfitFactor:
            sysBacktests.reduce(
              (sum, b) => sum + Number(b.profitFactor || 0),
              0
            ) / sysBacktests.length,
          avgDrawdown:
            sysBacktests.reduce(
              (sum, b) =>
                sum + Number(b.maxDrawdownPercent || b.maxDrawdown || 0),
              0
            ) / sysBacktests.length,
          totalNetProfitPercent: sysBacktests.reduce(
            (sum, b) => sum + Number(b.netProfitPercent || 0),
            0
          ),
          profitableRate:
            (sysBacktests.filter((b) => Number(b.netProfit) > 0).length /
              sysBacktests.length) *
            100,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (b?.avgWinRate || 0) - (a?.avgWinRate || 0));

    // Monthly trends
    const months: Record<
      string,
      {
        month: string;
        count: number;
        avgWinRate: number;
        avgProfitFactor: number;
      }
    > = {};
    filteredBacktests.forEach((bt) => {
      const date = new Date(bt.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      const monthName = date.toLocaleDateString("th-TH", {
        month: "short",
        year: "2-digit",
      });

      if (!months[key]) {
        months[key] = {
          month: monthName,
          count: 0,
          avgWinRate: 0,
          avgProfitFactor: 0,
        };
      }
      months[key].count++;
      months[key].avgWinRate += Number(bt.winRate || 0);
      months[key].avgProfitFactor += Number(bt.profitFactor || 0);
    });

    const monthlyData = Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([, data]) => ({
        month: data.month,
        count: data.count,
        avgWinRate: data.avgWinRate / data.count,
        avgProfitFactor: data.avgProfitFactor / data.count,
      }));

    // Distribution
    const winRateDistribution = getDistribution(
      filteredBacktests.map((b) => Number(b.winRate || 0)),
      [30, 40, 50, 60, 70]
    );
    const profitFactorDistribution = getDistribution(
      filteredBacktests.map((b) => Number(b.profitFactor || 0)),
      [0.5, 1, 1.5, 2, 3]
    );

    return {
      totalBacktests: filteredBacktests.length,
      overall: {
        avgWinRate,
        avgProfitFactor,
        avgSharpeRatio,
        avgMaxDrawdown,
        avgRiskReward,
        avgExpectancy,
        totalNetProfit,
        profitableRate,
      },
      trades: {
        total: totalTrades,
        winning: totalWinningTrades,
        losing: totalLosingTrades,
        winRate: totalTrades > 0 ? (totalWinningTrades / totalTrades) * 100 : 0,
        maxConsecutiveWins,
        maxConsecutiveLosses,
      },
      best: {
        winRate: bestWinRate,
        profitFactor: bestProfitFactor,
        lowestDrawdown,
      },
      worst: {
        winRate: worstWinRate,
        profitFactor: worstProfitFactor,
        highestDrawdown,
      },
      systemPerformance,
      monthlyData,
      winRateDistribution,
      profitFactorDistribution,
    };
  }, [filteredBacktests, systems]);

  if (!stats) {
    return (
      <div className="space-y-6">
        <StatsFilter
          systems={systems.map((s) => ({ id: s.id, name: s.name }))}
          tags={tags}
          onFilterChange={handleFilterChange}
        />
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">ไม่พบข้อมูล</h3>
            <p className="text-sm text-muted-foreground">
              ไม่มี Backtest ที่ตรงกับตัวกรองที่เลือก
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <StatsFilter
            systems={systems.map((s) => ({ id: s.id, name: s.name }))}
            tags={tags}
            onFilterChange={handleFilterChange}
          />
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>กำลังแสดงสถิติจาก</span>
        <Badge variant="secondary">{stats.totalBacktests} Backtests</Badge>
        {filters.systemId && (
          <>
            <span>ในระบบ</span>
            <Badge variant="outline">
              {systems.find((s) => s.id === filters.systemId)?.name}
            </Badge>
          </>
        )}
        {filters.tagId && (
          <>
            <span>ที่มี Tag</span>
            <Badge
              style={{
                backgroundColor:
                  (tags.find((t) => t.id === filters.tagId)?.color ||
                    "#888888") + "20",
                color:
                  tags.find((t) => t.id === filters.tagId)?.color || "#888888",
              }}
            >
              {tags.find((t) => t.id === filters.tagId)?.name}
            </Badge>
          </>
        )}
      </div>

      {/* Overall Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.overall.avgWinRate >= 50
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {stats.overall.avgWinRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">เฉลี่ยทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Profit Factor
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.overall.avgProfitFactor >= 1
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {stats.overall.avgProfitFactor.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">เฉลี่ยทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Max Drawdown
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {stats.overall.avgMaxDrawdown.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">เฉลี่ยทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profitable Rate
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                stats.overall.profitableRate >= 50
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {stats.overall.profitableRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Backtests ที่กำไร</p>
          </CardContent>
        </Card>
      </div>

      {/* Trade Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Trade Statistics
            </CardTitle>
            <CardDescription>สถิติการเทรดรวม</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Trades</span>
              <span className="font-medium">
                {stats.trades.total.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Winning Trades</span>
              <span className="font-medium text-green-500">
                {stats.trades.winning.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Losing Trades</span>
              <span className="font-medium text-red-500">
                {stats.trades.losing.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Overall Win Rate</span>
              <span
                className={`font-medium ${
                  stats.trades.winRate >= 50 ? "text-green-500" : "text-red-500"
                }`}
              >
                {stats.trades.winRate.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Streak Analysis
            </CardTitle>
            <CardDescription>การวิเคราะห์ชนะ/แพ้ติดต่อกัน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Max Consecutive Wins
              </span>
              <Badge className="bg-green-500 text-white">
                {stats.trades.maxConsecutiveWins}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">
                Max Consecutive Losses
              </span>
              <Badge className="bg-red-500 text-white">
                {stats.trades.maxConsecutiveLosses}
              </Badge>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                ค่าสูงสุดที่พบในทุก Backtest
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-500" />
              Risk Metrics
            </CardTitle>
            <CardDescription>ค่าความเสี่ยงเฉลี่ย</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Sharpe Ratio</span>
              <span
                className={`font-medium ${
                  stats.overall.avgSharpeRatio >= 1
                    ? "text-green-500"
                    : "text-yellow-500"
                }`}
              >
                {stats.overall.avgSharpeRatio.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Risk/Reward</span>
              <span className="font-medium">
                {stats.overall.avgRiskReward.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Avg Expectancy</span>
              <span
                className={`font-medium ${
                  stats.overall.avgExpectancy >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {stats.overall.avgExpectancy.toFixed(2)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best & Worst Performers */}
      {stats.best && stats.worst && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Best Performers
              </CardTitle>
              <CardDescription>Backtest ที่มีผลงานดีที่สุด</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Highest Win Rate
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                </div>
                <p className="font-medium">
                  {stats.best.winRate?.name || stats.best.winRate?.symbol}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.best.winRate?.tradingSystem.name}
                </p>
                <p className="text-lg font-bold text-green-500">
                  {Number(stats.best.winRate?.winRate || 0).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Highest Profit Factor
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                </div>
                <p className="font-medium">
                  {stats.best.profitFactor?.name ||
                    stats.best.profitFactor?.symbol}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.best.profitFactor?.tradingSystem.name}
                </p>
                <p className="text-lg font-bold text-green-500">
                  {Number(stats.best.profitFactor?.profitFactor || 0).toFixed(
                    2
                  )}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Lowest Drawdown
                  </span>
                  <ArrowDownRight className="h-4 w-4 text-green-500" />
                </div>
                <p className="font-medium">
                  {stats.best.lowestDrawdown?.name ||
                    stats.best.lowestDrawdown?.symbol}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.best.lowestDrawdown?.tradingSystem.name}
                </p>
                <p className="text-lg font-bold text-green-500">
                  {Number(
                    stats.best.lowestDrawdown?.maxDrawdownPercent ||
                      stats.best.lowestDrawdown?.maxDrawdown ||
                      0
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                Worst Performers
              </CardTitle>
              <CardDescription>Backtest ที่มีผลงานต่ำที่สุด</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Lowest Win Rate
                  </span>
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                </div>
                <p className="font-medium">
                  {stats.worst.winRate?.name || stats.worst.winRate?.symbol}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.worst.winRate?.tradingSystem.name}
                </p>
                <p className="text-lg font-bold text-red-500">
                  {Number(stats.worst.winRate?.winRate || 0).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Lowest Profit Factor
                  </span>
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                </div>
                <p className="font-medium">
                  {stats.worst.profitFactor?.name ||
                    stats.worst.profitFactor?.symbol}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.worst.profitFactor?.tradingSystem.name}
                </p>
                <p className="text-lg font-bold text-red-500">
                  {Number(stats.worst.profitFactor?.profitFactor || 0).toFixed(
                    2
                  )}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Highest Drawdown
                  </span>
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                </div>
                <p className="font-medium">
                  {stats.worst.highestDrawdown?.name ||
                    stats.worst.highestDrawdown?.symbol}
                </p>
                <p className="text-sm text-muted-foreground">
                  {stats.worst.highestDrawdown?.tradingSystem.name}
                </p>
                <p className="text-lg font-bold text-red-500">
                  {Number(
                    stats.worst.highestDrawdown?.maxDrawdownPercent ||
                      stats.worst.highestDrawdown?.maxDrawdown ||
                      0
                  ).toFixed(1)}
                  %
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {stats.monthlyData &&
        stats.winRateDistribution &&
        stats.profitFactorDistribution &&
        stats.systemPerformance && (
          <StatsCharts
            monthlyData={stats.monthlyData}
            winRateDistribution={stats.winRateDistribution}
            profitFactorDistribution={stats.profitFactorDistribution}
            systemPerformance={stats.systemPerformance}
          />
        )}

      {/* System Performance Comparison */}
      {stats.systemPerformance && stats.systemPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-orange-500" />
              System Performance Comparison
            </CardTitle>
            <CardDescription>เปรียบเทียบผลงานแต่ละระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">System</th>
                    <th className="pb-3 font-medium text-right">Backtests</th>
                    <th className="pb-3 font-medium text-right">Win Rate</th>
                    <th className="pb-3 font-medium text-right">
                      Profit Factor
                    </th>
                    <th className="pb-3 font-medium text-right">
                      Avg Drawdown
                    </th>
                    <th className="pb-3 font-medium text-right">Total P&L %</th>
                    <th className="pb-3 font-medium text-right">
                      Profitable %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stats.systemPerformance.map((system) => (
                    <tr key={system?.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{system?.name}</td>
                      <td className="py-3 text-right">
                        {system?.backtestCount}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={
                            (system?.avgWinRate || 0) >= 50
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {system?.avgWinRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={
                            (system?.avgProfitFactor || 0) >= 1
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {system?.avgProfitFactor.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 text-right text-red-500">
                        {system?.avgDrawdown.toFixed(1)}%
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={
                            (system?.totalNetProfitPercent || 0) >= 0
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {(system?.totalNetProfitPercent || 0).toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={
                            (system?.profitableRate || 0) >= 50
                              ? "text-green-500"
                              : "text-red-500"
                          }
                        >
                          {system?.profitableRate.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getDistribution(values: number[], thresholds: number[]) {
  const result: { range: string; count: number }[] = [];

  result.push({
    range: `< ${thresholds[0]}`,
    count: values.filter((v) => v < thresholds[0]).length,
  });

  for (let i = 0; i < thresholds.length - 1; i++) {
    result.push({
      range: `${thresholds[i]} - ${thresholds[i + 1]}`,
      count: values.filter((v) => v >= thresholds[i] && v < thresholds[i + 1])
        .length,
    });
  }

  result.push({
    range: `> ${thresholds[thresholds.length - 1]}`,
    count: values.filter((v) => v >= thresholds[thresholds.length - 1]).length,
  });

  return result;
}
