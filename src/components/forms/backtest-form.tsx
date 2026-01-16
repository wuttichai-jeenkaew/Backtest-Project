"use client";

import { useRouter } from "next/navigation";
import { TradingSystem } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BacktestFormProps {
  action: (formData: FormData) => Promise<void>;
  systems: TradingSystem[];
  defaultSystemId?: string;
  initialData?: {
    tradingSystemId: string;
    name?: string | null;
    symbol: string;
    startDate: Date;
    endDate: Date;
    startingCapital: number;
    endingCapital: number;
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    grossProfit?: number | null;
    grossLoss?: number | null;
    maxDrawdown?: number | null;
    maxDrawdownPercent?: number | null;
    sharpeRatio?: number | null;
    averageWin?: number | null;
    averageLoss?: number | null;
    largestWin?: number | null;
    largestLoss?: number | null;
    maxConsecutiveWins?: number | null;
    maxConsecutiveLosses?: number | null;
    notes?: string | null;
    dataSource?: string | null;
  };
  submitLabel: string;
}

export function BacktestForm({
  action,
  systems,
  defaultSystemId,
  initialData,
  submitLabel,
}: BacktestFormProps) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  return (
    <form action={action} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tradingSystemId">Trading System *</Label>
              <Select
                name="tradingSystemId"
                defaultValue={initialData?.tradingSystemId || defaultSystemId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a system" />
                </SelectTrigger>
                <SelectContent>
                  {systems.map((system) => (
                    <SelectItem key={system.id} value={system.id}>
                      {system.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                name="symbol"
                required
                placeholder="e.g., EUR/USD, AAPL, BTC/USDT"
                defaultValue={initialData?.symbol}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Backtest Name (Optional)</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., Q4 2025 Test"
              defaultValue={initialData?.name || ""}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                defaultValue={
                  initialData ? formatDate(initialData.startDate) : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                required
                defaultValue={
                  initialData ? formatDate(initialData.endDate) : ""
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataSource">Data Source</Label>
            <Input
              id="dataSource"
              name="dataSource"
              placeholder="e.g., TradingView, MetaTrader, Manual"
              defaultValue={initialData?.dataSource || ""}
            />
          </div>
        </CardContent>
      </Card>

      {/* Capital & P/L */}
      <Card>
        <CardHeader>
          <CardTitle>Capital & Profit/Loss</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startingCapital">Starting Capital *</Label>
            <Input
              id="startingCapital"
              name="startingCapital"
              type="number"
              step="0.01"
              required
              placeholder="10000"
              defaultValue={initialData?.startingCapital}
            />
            <p className="text-xs text-muted-foreground">
              Ending Capital จะถูกคำนวณอัตโนมัติจาก Gross Profit/Loss
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="grossProfitPercent">Gross Profit (%)</Label>
              <Input
                id="grossProfitPercent"
                name="grossProfitPercent"
                type="number"
                step="0.01"
                placeholder="e.g., 25.5 (เป็น % ของ Starting Capital)"
                defaultValue={
                  initialData?.grossProfit && initialData?.startingCapital
                    ? (
                        (initialData.grossProfit /
                          initialData.startingCapital) *
                        100
                      ).toFixed(2)
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grossLossPercent">
                Gross Loss (%, absolute value)
              </Label>
              <Input
                id="grossLossPercent"
                name="grossLossPercent"
                type="number"
                step="0.01"
                placeholder="e.g., 10.5 (เป็น % ของ Starting Capital)"
                defaultValue={
                  initialData?.grossLoss && initialData?.startingCapital
                    ? (
                        (Math.abs(initialData.grossLoss) /
                          initialData.startingCapital) *
                        100
                      ).toFixed(2)
                    : ""
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Statistics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="totalTrades">Total Trades *</Label>
              <Input
                id="totalTrades"
                name="totalTrades"
                type="number"
                required
                placeholder="100"
                defaultValue={initialData?.totalTrades}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="winningTrades">Winning Trades *</Label>
              <Input
                id="winningTrades"
                name="winningTrades"
                type="number"
                required
                placeholder="60"
                defaultValue={initialData?.winningTrades}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="losingTrades">Losing Trades *</Label>
              <Input
                id="losingTrades"
                name="losingTrades"
                type="number"
                required
                placeholder="40"
                defaultValue={initialData?.losingTrades}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="averageWinPercent">Average Win (%)</Label>
              <Input
                id="averageWinPercent"
                name="averageWinPercent"
                type="number"
                step="0.01"
                placeholder="e.g., 2.5 (% ของ Starting Capital)"
                defaultValue={
                  initialData?.averageWin && initialData?.startingCapital
                    ? (
                        (initialData.averageWin / initialData.startingCapital) *
                        100
                      ).toFixed(2)
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="averageLossPercent">Average Loss (%)</Label>
              <Input
                id="averageLossPercent"
                name="averageLossPercent"
                type="number"
                step="0.01"
                placeholder="e.g., 1.0 (% ของ Starting Capital)"
                defaultValue={
                  initialData?.averageLoss && initialData?.startingCapital
                    ? (
                        (Math.abs(initialData.averageLoss) /
                          initialData.startingCapital) *
                        100
                      ).toFixed(2)
                    : ""
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="largestWinPercent">Largest Win (%)</Label>
              <Input
                id="largestWinPercent"
                name="largestWinPercent"
                type="number"
                step="0.01"
                placeholder="e.g., 5.0 (% ของ Starting Capital)"
                defaultValue={
                  initialData?.largestWin && initialData?.startingCapital
                    ? (
                        (initialData.largestWin / initialData.startingCapital) *
                        100
                      ).toFixed(2)
                    : ""
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="largestLossPercent">Largest Loss (%)</Label>
              <Input
                id="largestLossPercent"
                name="largestLossPercent"
                type="number"
                step="0.01"
                placeholder="e.g., 3.0 (% ของ Starting Capital)"
                defaultValue={
                  initialData?.largestLoss && initialData?.startingCapital
                    ? (
                        (Math.abs(initialData.largestLoss) /
                          initialData.startingCapital) *
                        100
                      ).toFixed(2)
                    : ""
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maxConsecutiveWins">Max Consecutive Wins</Label>
              <Input
                id="maxConsecutiveWins"
                name="maxConsecutiveWins"
                type="number"
                placeholder="Longest winning streak"
                defaultValue={initialData?.maxConsecutiveWins ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxConsecutiveLosses">
                Max Consecutive Losses
              </Label>
              <Input
                id="maxConsecutiveLosses"
                name="maxConsecutiveLosses"
                type="number"
                placeholder="Longest losing streak"
                defaultValue={initialData?.maxConsecutiveLosses ?? ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="maxDrawdownPercent">Max Drawdown (%)</Label>
            <Input
              id="maxDrawdownPercent"
              name="maxDrawdownPercent"
              type="number"
              step="0.01"
              placeholder="e.g., 15.5"
              defaultValue={initialData?.maxDrawdownPercent ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              Max Drawdown ($) จะถูกคำนวณอัตโนมัติจาก % และ Starting Capital
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Any observations, market conditions, or notes about this backtest..."
            rows={4}
            defaultValue={initialData?.notes || ""}
          />
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
