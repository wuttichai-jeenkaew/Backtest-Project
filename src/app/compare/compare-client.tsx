"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Check, Equal, DollarSign, Percent } from "lucide-react";

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
import { ScrollArea } from "@/components/ui/scroll-area";

interface Backtest {
  id: string;
  name: string | null;
  symbol: string;
  startDate: Date;
  endDate: Date;
  startingCapital: number | null;
  endingCapital: number | null;
  netProfit: number | null;
  netProfitPercent: number | null;
  winRate: number | null;
  profitFactor: number | null;
  sharpeRatio: number | null;
  maxDrawdownPercent: number | null;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  averageWin: number | null;
  averageLoss: number | null;
  expectancy: number | null;
  tradingSystem: {
    name: string;
  };
}

interface CompareClientProps {
  backtests: Backtest[];
}

type DisplayMode = "absolute" | "percentage";

export function CompareClient({ backtests }: CompareClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("percentage");

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const selectedBacktests = backtests.filter((bt) =>
    selectedIds.includes(bt.id)
  );

  // Helper function to calculate percentage of starting capital
  const toPercent = (
    value: number | null,
    startingCapital: number | null
  ): number | null => {
    if (value === null || startingCapital === null || startingCapital === 0)
      return null;
    return (Number(value) / Number(startingCapital)) * 100;
  };

  const formatPercent = (value: number | null): string => {
    if (value === null) return "-";
    return `${value.toFixed(2)}%`;
  };

  const formatDollar = (value: number | null): string => {
    if (value === null) return "-";
    return `$${Number(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const metrics = [
    {
      label: displayMode === "percentage" ? "Return %" : "Net Profit",
      getValue: (bt: Backtest) =>
        displayMode === "percentage"
          ? formatPercent(Number(bt.netProfitPercent))
          : formatDollar(Number(bt.netProfit)),
      getRawValue: (bt: Backtest) =>
        displayMode === "percentage"
          ? Number(bt.netProfitPercent) || 0
          : Number(bt.netProfit) || 0,
      getBestIds: (bts: Backtest[]) => {
        const getValue =
          displayMode === "percentage"
            ? (bt: Backtest) => Number(bt.netProfitPercent) || 0
            : (bt: Backtest) => Number(bt.netProfit) || 0;
        const maxVal = Math.max(...bts.map(getValue));
        return bts.filter((bt) => getValue(bt) === maxVal).map((bt) => bt.id);
      },
      isProfit: true,
    },
    {
      label: "Win Rate",
      getValue: (bt: Backtest) =>
        bt.winRate ? `${Number(bt.winRate).toFixed(1)}%` : "-",
      getRawValue: (bt: Backtest) => Number(bt.winRate) || 0,
      getBestIds: (bts: Backtest[]) => {
        const maxVal = Math.max(...bts.map((bt) => Number(bt.winRate) || 0));
        return bts
          .filter((bt) => (Number(bt.winRate) || 0) === maxVal)
          .map((bt) => bt.id);
      },
    },
    {
      label: "Profit Factor",
      getValue: (bt: Backtest) =>
        bt.profitFactor ? Number(bt.profitFactor).toFixed(2) : "-",
      getRawValue: (bt: Backtest) => Number(bt.profitFactor) || 0,
      getBestIds: (bts: Backtest[]) => {
        const maxVal = Math.max(
          ...bts.map((bt) => Number(bt.profitFactor) || 0)
        );
        return bts
          .filter((bt) => (Number(bt.profitFactor) || 0) === maxVal)
          .map((bt) => bt.id);
      },
    },
    {
      label: "Sharpe Ratio",
      getValue: (bt: Backtest) =>
        bt.sharpeRatio ? Number(bt.sharpeRatio).toFixed(2) : "-",
      getRawValue: (bt: Backtest) => Number(bt.sharpeRatio) || 0,
      getBestIds: (bts: Backtest[]) => {
        const maxVal = Math.max(
          ...bts.map((bt) => Number(bt.sharpeRatio) || 0)
        );
        return bts
          .filter((bt) => (Number(bt.sharpeRatio) || 0) === maxVal)
          .map((bt) => bt.id);
      },
    },
    {
      label: "Max Drawdown %",
      getValue: (bt: Backtest) =>
        bt.maxDrawdownPercent
          ? `${Number(bt.maxDrawdownPercent).toFixed(1)}%`
          : "-",
      getRawValue: (bt: Backtest) =>
        Math.abs(Number(bt.maxDrawdownPercent) || 0),
      getBestIds: (bts: Backtest[]) => {
        const vals = bts.map((bt) =>
          Math.abs(Number(bt.maxDrawdownPercent) || 0)
        );
        const minVal = Math.min(...vals);
        return bts
          .filter(
            (bt) => Math.abs(Number(bt.maxDrawdownPercent) || 0) === minVal
          )
          .map((bt) => bt.id);
      },
      isLowerBetter: true,
    },
    {
      label: "Total Trades",
      getValue: (bt: Backtest) => bt.totalTrades.toString(),
      getRawValue: (bt: Backtest) => bt.totalTrades,
      getBestIds: () => [] as string[],
    },
    {
      label: "Winning Trades",
      getValue: (bt: Backtest) => bt.winningTrades.toString(),
      getRawValue: (bt: Backtest) => bt.winningTrades,
      getBestIds: () => [] as string[],
    },
    {
      label: "Losing Trades",
      getValue: (bt: Backtest) => bt.losingTrades.toString(),
      getRawValue: (bt: Backtest) => bt.losingTrades,
      getBestIds: () => [] as string[],
    },
    {
      label: displayMode === "percentage" ? "Avg Win %" : "Average Win",
      getValue: (bt: Backtest) =>
        displayMode === "percentage"
          ? formatPercent(toPercent(bt.averageWin, bt.startingCapital))
          : formatDollar(Number(bt.averageWin)),
      getRawValue: (bt: Backtest) =>
        displayMode === "percentage"
          ? toPercent(bt.averageWin, bt.startingCapital) || 0
          : Number(bt.averageWin) || 0,
      getBestIds: (bts: Backtest[]) => {
        const getValue =
          displayMode === "percentage"
            ? (bt: Backtest) =>
                toPercent(bt.averageWin, bt.startingCapital) || 0
            : (bt: Backtest) => Number(bt.averageWin) || 0;
        const maxVal = Math.max(...bts.map(getValue));
        return bts.filter((bt) => getValue(bt) === maxVal).map((bt) => bt.id);
      },
    },
    {
      label: displayMode === "percentage" ? "Avg Loss %" : "Average Loss",
      getValue: (bt: Backtest) =>
        displayMode === "percentage"
          ? formatPercent(toPercent(bt.averageLoss, bt.startingCapital))
          : formatDollar(Number(bt.averageLoss)),
      getRawValue: (bt: Backtest) =>
        displayMode === "percentage"
          ? Math.abs(toPercent(bt.averageLoss, bt.startingCapital) || 0)
          : Math.abs(Number(bt.averageLoss) || 0),
      getBestIds: (bts: Backtest[]) => {
        const getValue =
          displayMode === "percentage"
            ? (bt: Backtest) =>
                Math.abs(toPercent(bt.averageLoss, bt.startingCapital) || 0)
            : (bt: Backtest) => Math.abs(Number(bt.averageLoss) || 0);
        const vals = bts.map(getValue);
        const minVal = Math.min(...vals);
        return bts.filter((bt) => getValue(bt) === minVal).map((bt) => bt.id);
      },
      isLowerBetter: true,
    },
    {
      label: displayMode === "percentage" ? "Expectancy %" : "Expectancy",
      getValue: (bt: Backtest) =>
        displayMode === "percentage"
          ? formatPercent(toPercent(bt.expectancy, bt.startingCapital))
          : formatDollar(Number(bt.expectancy)),
      getRawValue: (bt: Backtest) =>
        displayMode === "percentage"
          ? toPercent(bt.expectancy, bt.startingCapital) || 0
          : Number(bt.expectancy) || 0,
      getBestIds: (bts: Backtest[]) => {
        const getValue =
          displayMode === "percentage"
            ? (bt: Backtest) =>
                toPercent(bt.expectancy, bt.startingCapital) || 0
            : (bt: Backtest) => Number(bt.expectancy) || 0;
        const maxVal = Math.max(...bts.map(getValue));
        return bts.filter((bt) => getValue(bt) === maxVal).map((bt) => bt.id);
      },
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Selection Panel */}
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Select Backtests</CardTitle>
          {selectedIds.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear ({selectedIds.length})
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            <div className="space-y-1 p-4">
              {backtests.length > 0 ? (
                backtests.map((bt) => (
                  <div
                    key={bt.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedIds.includes(bt.id)
                        ? "bg-primary/10 border border-primary"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => toggleSelection(bt.id)}
                  >
                    <Checkbox
                      checked={selectedIds.includes(bt.id)}
                      onCheckedChange={() => toggleSelection(bt.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {bt.name || bt.tradingSystem.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {bt.symbol}
                        </Badge>
                        <span>
                          {format(bt.startDate, "MMM yy")} -{" "}
                          {format(bt.endDate, "MMM yy")}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        Number(bt.netProfit) >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      ${Number(bt.netProfit).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No backtests available
                </p>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Comparison</CardTitle>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
            <Button
              variant={displayMode === "percentage" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setDisplayMode("percentage")}
            >
              <Percent className="h-4 w-4" />
              <span className="hidden sm:inline">Percentage</span>
            </Button>
            <Button
              variant={displayMode === "absolute" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setDisplayMode("absolute")}
            >
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Absolute</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedBacktests.length >= 2 ? (
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Metric</TableHead>
                    {selectedBacktests.map((bt) => (
                      <TableHead key={bt.id} className="min-w-[120px]">
                        <div className="space-y-1">
                          <p className="font-medium">
                            {bt.name || bt.tradingSystem.name}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {bt.symbol}
                          </Badge>
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.map((metric) => {
                    const bestIds = metric.getBestIds(selectedBacktests);
                    const isTie = bestIds.length > 1;
                    return (
                      <TableRow key={metric.label}>
                        <TableCell className="font-medium">
                          {metric.label}
                        </TableCell>
                        {selectedBacktests.map((bt) => {
                          const isBest = bestIds.includes(bt.id);
                          const value = metric.getValue(bt);
                          return (
                            <TableCell
                              key={bt.id}
                              className={
                                isBest ? "bg-green-50 dark:bg-green-950" : ""
                              }
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={
                                    metric.isProfit
                                      ? Number(bt.netProfit) >= 0
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
          ) : selectedBacktests.length === 1 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>Select at least one more backtest to compare</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>Select at least 2 backtests to compare</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
