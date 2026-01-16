"use client";

import { useState } from "react";
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Upload,
  Loader2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateProfitConsistency } from "@/lib/calculations";
import { calculateProfitConsistencyFromStatsAction } from "../actions";

interface ProfitConsistencyCalculatorProps {
  backtestId: string;
  winningTrades: number;
  losingTrades: number;
  totalTrades: number;
  riskRewardRatio?: number | null;
  defaultRiskPercent?: number | null;
  defaultRR?: number | null;
}

interface DailyPnLEntry {
  date: string;
  pnl: string;
}

interface ConsistencyResult {
  consistencyPercent: number | null;
  passed: boolean;
  bestDayProfit: number;
  totalProfit: number;
  profitableDays: number;
  losingDays: number;
  threshold: number;
  message: string;
  method?: string;
  riskPercent?: number;
  rrRatio?: number;
  totalTrades?: number;
}

export function ProfitConsistencyCalculator({
  backtestId,
  winningTrades,
  losingTrades,
  totalTrades,
  riskRewardRatio,
  defaultRiskPercent,
  defaultRR,
}: ProfitConsistencyCalculatorProps) {
  const [threshold, setThreshold] = useState(20);
  const [riskPercent, setRiskPercent] = useState<string>(
    defaultRiskPercent ? String(defaultRiskPercent) : "0.9"
  );
  const [rrRatio, setRrRatio] = useState<string>(
    defaultRR
      ? String(defaultRR)
      : riskRewardRatio
      ? String(riskRewardRatio)
      : "1"
  );
  const [result, setResult] = useState<ConsistencyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Manual entry
  const [manualEntries, setManualEntries] = useState<DailyPnLEntry[]>([
    { date: "", pnl: "" },
  ]);

  // Bulk import
  const [bulkData, setBulkData] = useState("");

  // Calculate from Backtest Stats (main method)
  const handleCalculateFromStats = async () => {
    setIsCalculating(true);
    setError(null);
    setResult(null);

    try {
      const riskValue = parseFloat(riskPercent);
      const rrValue = parseFloat(rrRatio);

      if (isNaN(riskValue) || riskValue <= 0) {
        throw new Error("กรุณาใส่ Risk % ที่มากกว่า 0");
      }
      if (isNaN(rrValue) || rrValue <= 0) {
        throw new Error("กรุณาใส่ RR Ratio ที่มากกว่า 0");
      }

      const calculated = await calculateProfitConsistencyFromStatsAction(
        backtestId,
        riskValue,
        rrValue,
        threshold
      );
      setResult(calculated);
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message || "Failed to calculate");
    } finally {
      setIsCalculating(false);
    }
  };

  const addManualEntry = () => {
    setManualEntries([...manualEntries, { date: "", pnl: "" }]);
  };

  const removeManualEntry = (index: number) => {
    setManualEntries(manualEntries.filter((_, i) => i !== index));
  };

  const updateManualEntry = (
    index: number,
    field: "date" | "pnl",
    value: string
  ) => {
    const newEntries = [...manualEntries];
    newEntries[index][field] = value;
    setManualEntries(newEntries);
  };

  const calculateFromManual = () => {
    setError(null);
    setResult(null);

    const validEntries = manualEntries
      .filter((e) => e.date && e.pnl)
      .map((e) => ({
        date: e.date,
        pnl: parseFloat(e.pnl),
      }));

    if (validEntries.length < 2) {
      setError("ต้องมีอย่างน้อย 2 วัน เพื่อคำนวณ Profit Consistency");
      return;
    }

    const calcResult = calculateProfitConsistency(validEntries, threshold);
    setResult({ ...calcResult, method: "manual" });
    setIsDialogOpen(false);
  };

  const calculateFromBulk = () => {
    setError(null);
    setResult(null);

    if (!bulkData.trim()) {
      setError("กรุณาใส่ข้อมูล");
      return;
    }

    const lines = bulkData.trim().split("\n");
    const entries: { date: string; pnl: number }[] = [];

    for (const line of lines) {
      const parts = line.split(",").map((s) => s.trim());
      if (parts.length >= 2) {
        const dateStr = parts[0];
        const pnl = parseFloat(parts[1]);

        if (dateStr && !isNaN(pnl)) {
          entries.push({ date: dateStr, pnl });
        }
      }
    }

    if (entries.length < 2) {
      setError("ต้องมีอย่างน้อย 2 วัน เพื่อคำนวณ Profit Consistency");
      return;
    }

    const calcResult = calculateProfitConsistency(entries, threshold);
    setResult({ ...calcResult, method: "csv_import" });
    setIsDialogOpen(false);
  };

  const getMethodLabel = (method?: string) => {
    switch (method) {
      case "backtest_stats":
        return "จาก Backtest Stats";
      case "manual":
        return "กรอกเอง";
      case "csv_import":
        return "Import CSV";
      default:
        return method || "";
    }
  };

  // Preview calculation
  const previewCalc = () => {
    const risk = parseFloat(riskPercent) || 0;
    const rr = parseFloat(rrRatio) || 1;
    const bestDay = risk * rr;
    const total = winningTrades * risk * rr - losingTrades * risk;
    const consistency = total > 0 ? (bestDay / total) * 100 : null;
    return { bestDay, total, consistency };
  };

  const preview = previewCalc();

  return (
    <div className="space-y-4">
      {/* Settings Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="riskPercent" className="text-sm">
            Risk per Trade (%)
          </Label>
          <Input
            id="riskPercent"
            type="number"
            min={0.01}
            step="0.1"
            value={riskPercent}
            onChange={(e) => setRiskPercent(e.target.value)}
            placeholder="0.9"
          />
        </div>
        <div>
          <Label htmlFor="rrRatio" className="text-sm">
            RR Ratio (1:X)
          </Label>
          <Input
            id="rrRatio"
            type="number"
            min={0.1}
            step="0.1"
            value={rrRatio}
            onChange={(e) => setRrRatio(e.target.value)}
            placeholder="1"
          />
        </div>
        <div>
          <Label htmlFor="threshold" className="text-sm">
            Threshold (%)
          </Label>
          <Input
            id="threshold"
            type="number"
            min={1}
            max={100}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Preview */}
      <div className="p-3 bg-muted/20 rounded-lg text-sm border">
        <p className="font-medium mb-2">
          📊 Preview ({winningTrades}W / {losingTrades}L):
        </p>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Best Day:</span>{" "}
            <span className="font-mono">{preview.bestDay.toFixed(2)}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Total Profit:</span>{" "}
            <span className="font-mono">{preview.total.toFixed(2)}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Consistency:</span>{" "}
            <span
              className={`font-mono font-bold ${
                preview.consistency !== null && preview.consistency <= threshold
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {preview.consistency !== null
                ? `${preview.consistency.toFixed(1)}%`
                : "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Buttons Row */}
      <div className="flex flex-wrap gap-2">
        {/* Calculate from Stats */}
        <Button
          onClick={handleCalculateFromStats}
          disabled={isCalculating || !riskPercent || !rrRatio}
          className="flex-1 min-w-[200px]"
        >
          {isCalculating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังคำนวณ...
            </>
          ) : (
            <>
              <BarChart3 className="mr-2 h-4 w-4" />
              คำนวณ
            </>
          )}
        </Button>

        {/* Manual input dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Calculator className="mr-2 h-4 w-4" />
              กรอกเอง
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>กรอก Daily P/L (ถ้าต้องการ)</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">กรอกเอง</TabsTrigger>
                <TabsTrigger value="csv">Import CSV</TabsTrigger>
              </TabsList>

              <TabsContent value="manual" className="space-y-4 mt-4">
                <div className="max-h-[250px] overflow-y-auto space-y-2">
                  {manualEntries.map((entry, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label className="text-xs">วันที่</Label>
                        <Input
                          type="date"
                          value={entry.date}
                          onChange={(e) =>
                            updateManualEntry(index, "date", e.target.value)
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-xs">P/L ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={entry.pnl}
                          onChange={(e) =>
                            updateManualEntry(index, "pnl", e.target.value)
                          }
                          placeholder="100 หรือ -50"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeManualEntry(index)}
                        disabled={manualEntries.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={addManualEntry}>
                    <Plus className="h-4 w-4 mr-1" />
                    เพิ่มวัน
                  </Button>
                  <Button size="sm" onClick={calculateFromManual}>
                    <Calculator className="h-4 w-4 mr-1" />
                    คำนวณ
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="csv" className="space-y-4 mt-4">
                <Textarea
                  placeholder={`วันที่,P/L
2025-01-01,100
2025-01-02,200
2025-01-03,-50`}
                  rows={6}
                  value={bulkData}
                  onChange={(e) => setBulkData(e.target.value)}
                />
                <Button onClick={calculateFromBulk} disabled={!bulkData.trim()}>
                  <Upload className="h-4 w-4 mr-1" />
                  Import & คำนวณ
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Info - Compact */}
      <p className="text-xs text-muted-foreground">
        กำไรวันที่ดีที่สุดไม่ควรเกิน {threshold}% ของกำไรรวม (Prop Firm Rule)
      </p>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && result.consistencyPercent !== null && (
        <div
          className={`p-4 rounded-lg border ${
            result.passed
              ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  result.passed
                    ? "bg-green-100 dark:bg-green-900"
                    : "bg-red-100 dark:bg-red-900"
                }`}
              >
                {result.passed ? (
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <p
                  className={`font-bold text-lg ${
                    result.passed
                      ? "text-green-700 dark:text-green-300"
                      : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {result.passed ? "ผ่านเกณฑ์ ✓" : "ไม่ผ่านเกณฑ์ ✗"}
                </p>
                <p className="text-sm text-muted-foreground">
                  Profit Consistency
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className={`text-3xl font-bold ${
                  result.passed
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                {result.consistencyPercent.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">
                เกณฑ์: ≤{result.threshold}%
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-muted-foreground">กำไรรวม</p>
              <p className="font-medium">{result.totalProfit.toFixed(2)}%</p>
            </div>
            <div className="p-3 bg-background/50 rounded-lg">
              <p className="text-muted-foreground">กำไรวันที่ดีที่สุด</p>
              <p className="font-medium">{result.bestDayProfit.toFixed(2)}%</p>
            </div>
          </div>

          {/* Message */}
          <p className="mt-4 text-sm">{result.message}</p>

          {/* Method */}
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>วิธีคำนวณ: {getMethodLabel(result.method)}</span>
            {result.riskPercent && <span>Risk: {result.riskPercent}%</span>}
            {result.rrRatio && <span>RR: 1:{result.rrRatio}</span>}
          </div>
        </div>
      )}

      {result && result.consistencyPercent === null && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-700 dark:text-yellow-300 font-medium">
            ⚠️ {result.message}
          </p>
        </div>
      )}
    </div>
  );
}
