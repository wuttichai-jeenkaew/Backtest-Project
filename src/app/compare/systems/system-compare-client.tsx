"use client";

import { useState, useMemo } from "react";
import { Check, Equal, TrendingUp, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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

interface SystemCompareClientProps {
  systems: SystemWithStats[];
}

// Distinct color palette for bar chart
const BAR_COLORS = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
];

// Chart metrics configuration
const CHART_METRICS = [
  {
    key: "winRate",
    name: "Win Rate",
    unit: "%",
    getValue: (sys: SystemWithStats) => sys.avgWinRate ?? 0,
    format: (v: number) => `${v.toFixed(1)}%`,
  },
  {
    key: "return",
    name: "Avg Return",
    unit: "%",
    getValue: (sys: SystemWithStats) => sys.avgReturnPercent ?? 0,
    format: (v: number) => `${v.toFixed(2)}%`,
  },
  {
    key: "totalReturn",
    name: "Total Return",
    unit: "%",
    getValue: (sys: SystemWithStats) => sys.totalReturnPercent,
    format: (v: number) => `${v.toFixed(2)}%`,
  },
  {
    key: "profitFactor",
    name: "Profit Factor",
    unit: "",
    getValue: (sys: SystemWithStats) => sys.avgProfitFactor ?? 0,
    format: (v: number) => v.toFixed(2),
  },
  {
    key: "sharpe",
    name: "Sharpe Ratio",
    unit: "",
    getValue: (sys: SystemWithStats) => sys.avgSharpeRatio ?? 0,
    format: (v: number) => v.toFixed(2),
  },
  {
    key: "totalTrades",
    name: "Total Orders",
    unit: "",
    getValue: (sys: SystemWithStats) => sys.totalTrades,
    format: (v: number) => v.toLocaleString(),
  },
  {
    key: "maxDrawdown",
    name: "Max Drawdown",
    unit: "%",
    getValue: (sys: SystemWithStats) => Math.abs(sys.maxDrawdownWorst ?? 0),
    format: (v: number) => `-${v.toFixed(1)}%`,
  },
];

export function SystemCompareClient({ systems }: SystemCompareClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("winRate");

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const selectedSystems = systems.filter((sys) => selectedIds.includes(sys.id));

  // Get current metric config
  const currentMetric = CHART_METRICS.find((m) => m.key === selectedMetric)!;

  // Prepare bar chart data for selected metric
  const barChartData = useMemo(() => {
    if (selectedSystems.length < 2) return [];

    return selectedSystems.map((sys, idx) => ({
      name: sys.name.length > 15 ? sys.name.slice(0, 15) + "..." : sys.name,
      fullName: sys.name,
      value: Number(currentMetric.getValue(sys).toFixed(2)),
      color: BAR_COLORS[idx % BAR_COLORS.length],
    }));
  }, [selectedSystems, currentMetric]);

  // Metrics for comparison table
  const metrics = [
    {
      label: "Total Orders",
      getValue: (sys: SystemWithStats) => sys.totalTrades.toLocaleString(),
      getRawValue: (sys: SystemWithStats) => sys.totalTrades,
      getBestIds: (systems: SystemWithStats[]) => {
        const maxVal = Math.max(...systems.map((s) => s.totalTrades));
        return systems.filter((s) => s.totalTrades === maxVal).map((s) => s.id);
      },
    },
    {
      label: "Total Return %",
      getValue: (sys: SystemWithStats) =>
        `${sys.totalReturnPercent.toFixed(2)}%`,
      getRawValue: (sys: SystemWithStats) => sys.totalReturnPercent,
      getBestIds: (systems: SystemWithStats[]) => {
        const maxVal = Math.max(...systems.map((s) => s.totalReturnPercent));
        return systems
          .filter((s) => s.totalReturnPercent === maxVal)
          .map((s) => s.id);
      },
      isProfit: true,
    },
    {
      label: "Avg Return %",
      getValue: (sys: SystemWithStats) =>
        sys.avgReturnPercent !== null
          ? `${sys.avgReturnPercent.toFixed(2)}%`
          : "-",
      getRawValue: (sys: SystemWithStats) => sys.avgReturnPercent ?? -Infinity,
      getBestIds: (systems: SystemWithStats[]) => {
        const values = systems.map((s) => s.avgReturnPercent ?? -Infinity);
        const maxVal = Math.max(...values);
        if (maxVal === -Infinity) return [];
        return systems
          .filter((s) => s.avgReturnPercent === maxVal)
          .map((s) => s.id);
      },
      isProfit: true,
    },
    {
      label: "Avg Win Rate",
      getValue: (sys: SystemWithStats) =>
        sys.avgWinRate !== null ? `${sys.avgWinRate.toFixed(1)}%` : "-",
      getRawValue: (sys: SystemWithStats) => sys.avgWinRate ?? -Infinity,
      getBestIds: (systems: SystemWithStats[]) => {
        const values = systems.map((s) => s.avgWinRate ?? -Infinity);
        const maxVal = Math.max(...values);
        if (maxVal === -Infinity) return [];
        return systems.filter((s) => s.avgWinRate === maxVal).map((s) => s.id);
      },
    },
    {
      label: "Avg Profit Factor",
      getValue: (sys: SystemWithStats) =>
        sys.avgProfitFactor !== null ? sys.avgProfitFactor.toFixed(2) : "-",
      getRawValue: (sys: SystemWithStats) => sys.avgProfitFactor ?? -Infinity,
      getBestIds: (systems: SystemWithStats[]) => {
        const values = systems.map((s) => s.avgProfitFactor ?? -Infinity);
        const maxVal = Math.max(...values);
        if (maxVal === -Infinity) return [];
        return systems
          .filter((s) => s.avgProfitFactor === maxVal)
          .map((s) => s.id);
      },
    },
    {
      label: "Avg Sharpe Ratio",
      getValue: (sys: SystemWithStats) =>
        sys.avgSharpeRatio !== null ? sys.avgSharpeRatio.toFixed(2) : "-",
      getRawValue: (sys: SystemWithStats) => sys.avgSharpeRatio ?? -Infinity,
      getBestIds: (systems: SystemWithStats[]) => {
        const values = systems.map((s) => s.avgSharpeRatio ?? -Infinity);
        const maxVal = Math.max(...values);
        if (maxVal === -Infinity) return [];
        return systems
          .filter((s) => s.avgSharpeRatio === maxVal)
          .map((s) => s.id);
      },
    },
    {
      label: "Best Return %",
      getValue: (sys: SystemWithStats) =>
        sys.bestReturn !== null ? `${sys.bestReturn.toFixed(2)}%` : "-",
      getRawValue: (sys: SystemWithStats) => sys.bestReturn ?? -Infinity,
      getBestIds: (systems: SystemWithStats[]) => {
        const values = systems.map((s) => s.bestReturn ?? -Infinity);
        const maxVal = Math.max(...values);
        if (maxVal === -Infinity) return [];
        return systems.filter((s) => s.bestReturn === maxVal).map((s) => s.id);
      },
      isProfit: true,
    },
    {
      label: "Worst Return %",
      getValue: (sys: SystemWithStats) =>
        sys.worstReturn !== null ? `${sys.worstReturn.toFixed(2)}%` : "-",
      getRawValue: (sys: SystemWithStats) => sys.worstReturn ?? Infinity,
      getBestIds: (systems: SystemWithStats[]) => {
        // Higher (less negative) is better
        const values = systems.map((s) => s.worstReturn ?? -Infinity);
        const maxVal = Math.max(...values);
        if (maxVal === -Infinity) return [];
        return systems.filter((s) => s.worstReturn === maxVal).map((s) => s.id);
      },
      isProfit: true,
    },
    {
      label: "Max Drawdown (Worst)",
      getValue: (sys: SystemWithStats) =>
        sys.maxDrawdownWorst !== null
          ? `${sys.maxDrawdownWorst.toFixed(1)}%`
          : "-",
      getRawValue: (sys: SystemWithStats) =>
        Math.abs(sys.maxDrawdownWorst ?? Infinity),
      getBestIds: (systems: SystemWithStats[]) => {
        // Less negative (closer to 0) is better
        const values = systems.map((s) => s.maxDrawdownWorst ?? -Infinity);
        const maxVal = Math.max(...values);
        if (maxVal === -Infinity) return [];
        return systems
          .filter((s) => s.maxDrawdownWorst === maxVal)
          .map((s) => s.id);
      },
      isLowerBetter: true,
    },
    {
      label: "% Profitable Backtests",
      getValue: (sys: SystemWithStats) => {
        if (sys.backtestCount === 0) return "-";
        const pct = (sys.profitableBacktests / sys.backtestCount) * 100;
        return `${pct.toFixed(0)}% (${sys.profitableBacktests}/${
          sys.backtestCount
        })`;
      },
      getRawValue: (sys: SystemWithStats) =>
        sys.backtestCount > 0
          ? sys.profitableBacktests / sys.backtestCount
          : -Infinity,
      getBestIds: (systems: SystemWithStats[]) => {
        const values = systems.map((s) =>
          s.backtestCount > 0 ? s.profitableBacktests / s.backtestCount : -1
        );
        const maxVal = Math.max(...values);
        if (maxVal === -1) return [];
        return systems
          .filter(
            (s) =>
              s.backtestCount > 0 &&
              s.profitableBacktests / s.backtestCount === maxVal
          )
          .map((s) => s.id);
      },
    },
    {
      label: "Return Consistency (Std Dev)",
      getValue: (sys: SystemWithStats) =>
        sys.returnStdDev !== null ? sys.returnStdDev.toFixed(2) : "-",
      getRawValue: (sys: SystemWithStats) => sys.returnStdDev ?? Infinity,
      getBestIds: (systems: SystemWithStats[]) => {
        // Lower is better
        const values = systems.map((s) => s.returnStdDev ?? Infinity);
        const minVal = Math.min(...values);
        if (minVal === Infinity) return [];
        return systems
          .filter((s) => s.returnStdDev === minVal)
          .map((s) => s.id);
      },
      isLowerBetter: true,
    },
    {
      label: "Total Backtests",
      getValue: (sys: SystemWithStats) => sys.backtestCount.toString(),
      getRawValue: (sys: SystemWithStats) => sys.backtestCount,
      getBestIds: () => [] as string[], // No highlighting for this
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Selection Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Select Systems</CardTitle>
            {selectedIds.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear ({selectedIds.length})
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <div className="space-y-1 p-4">
                {systems.length > 0 ? (
                  systems.map((sys) => (
                    <div
                      key={sys.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedIds.includes(sys.id)
                          ? "bg-primary/10 border border-primary"
                          : "hover:bg-muted"
                      }`}
                      onClick={() => toggleSelection(sys.id)}
                    >
                      <Checkbox
                        checked={selectedIds.includes(sys.id)}
                        onCheckedChange={() => toggleSelection(sys.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      {/* Color indicator when selected */}
                      {selectedIds.includes(sys.id) && (
                        <div
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{
                            backgroundColor:
                              BAR_COLORS[
                                selectedIds.indexOf(sys.id) % BAR_COLORS.length
                              ],
                          }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{sys.name}</p>
                          {sys.isActive ? (
                            <Badge
                              variant="default"
                              className="text-xs shrink-0"
                            >
                              Active
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs shrink-0"
                            >
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {sys.assetClass}
                          </Badge>
                          <span>{sys.totalTrades} orders</span>
                        </div>
                      </div>
                      {sys.avgReturnPercent !== null && (
                        <span
                          className={`text-sm font-medium ${
                            sys.avgReturnPercent >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {sys.avgReturnPercent >= 0 ? "+" : ""}
                          {sys.avgReturnPercent.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No systems available
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Bar Chart - Performance Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Metric Selector */}
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-2">
                {CHART_METRICS.map((metric) => (
                  <Button
                    key={metric.key}
                    variant={
                      selectedMetric === metric.key ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedMetric(metric.key)}
                    className="shrink-0"
                  >
                    {metric.name}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>

            {selectedSystems.length >= 2 ? (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 50, left: 10, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 12 }}
                      width={100}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border rounded-lg shadow-lg p-3">
                              <p className="font-medium">{data.fullName}</p>
                              <p className="text-lg font-bold">
                                {currentMetric.format(data.value)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={35}>
                      {barChartData.map((entry, index) => (
                        <rect key={index} fill={entry.color} />
                      ))}
                      <LabelList
                        dataKey="value"
                        position="right"
                        formatter={(value) =>
                          currentMetric.format(Number(value))
                        }
                        style={{ fontSize: 12, fontWeight: 600 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <AlertTriangle className="h-8 w-8 mb-2" />
                <p>Select at least 2 systems to see the comparison chart</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedSystems.length >= 2 ? (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Metric</TableHead>
                    {selectedSystems.map((sys, idx) => (
                      <TableHead key={sys.id} className="min-w-[150px]">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{
                              backgroundColor:
                                BAR_COLORS[idx % BAR_COLORS.length],
                            }}
                          />
                          <div className="space-y-1">
                            <p className="font-medium">{sys.name}</p>
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-xs">
                                {sys.assetClass}
                              </Badge>
                              {sys.timeframe && (
                                <Badge variant="secondary" className="text-xs">
                                  {sys.timeframe}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => {
                    const bestIds = metric.getBestIds(selectedSystems);
                    const isTie = bestIds.length > 1;
                    return (
                      <TableRow key={metric.label}>
                        <TableCell className="font-medium">
                          {metric.label}
                        </TableCell>
                        {selectedSystems.map((sys) => {
                          const isBest = bestIds.includes(sys.id);
                          const value = metric.getValue(sys);
                          const rawValue = metric.getRawValue(sys);
                          return (
                            <TableCell
                              key={sys.id}
                              className={
                                isBest ? "bg-green-50 dark:bg-green-950" : ""
                              }
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={
                                    metric.isProfit
                                      ? rawValue >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                      : ""
                                  }
                                >
                                  {value}
                                </span>
                                {isBest && isTie && (
                                  <Equal className="h-4 w-4 text-yellow-500" />
                                )}
                                {isBest && !isTie && (
                                  <Check className="h-4 w-4 text-green-600" />
                                )}
                              </div>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : selectedSystems.length === 1 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>Select at least one more system to compare</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>Select at least 2 systems to compare</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
