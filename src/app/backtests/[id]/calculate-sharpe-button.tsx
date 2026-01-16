"use client";

import { useState, useEffect } from "react";
import { Calculator, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateSharpeRatioAction } from "../actions";

interface CalculateSharpeButtonProps {
  backtestId: string;
  currentValue: number | null;
  hasMonthlyReturns: boolean;
  hasEquityCurve: boolean;
  hasDrawdownData: boolean;
}

export function CalculateSharpeButton({
  backtestId,
  currentValue,
  hasMonthlyReturns,
  hasEquityCurve,
  hasDrawdownData,
}: CalculateSharpeButtonProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<{
    sharpeRatio: number;
    method: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasAutoCalculated, setHasAutoCalculated] = useState(false);

  const canCalculate = hasMonthlyReturns || hasEquityCurve || hasDrawdownData;

  const handleCalculate = async () => {
    setIsCalculating(true);
    setError(null);
    setResult(null);

    try {
      const calculated = await calculateSharpeRatioAction(backtestId);
      setResult(calculated);
    } catch (err) {
      const e = err as { message?: string };
      setError(e.message || "Failed to calculate");
    } finally {
      setIsCalculating(false);
    }
  };

  // Auto-calculate on mount if no current value and can calculate
  useEffect(() => {
    if (canCalculate && currentValue === null && !hasAutoCalculated) {
      setHasAutoCalculated(true);
      handleCalculate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCalculate, currentValue, hasAutoCalculated]);

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "monthly_returns":
        return "Monthly Returns";
      case "equity_curve":
        return "Equity Curve";
      case "simplified":
        return "Estimated (Simplified)";
      default:
        return method;
    }
  };

  if (!canCalculate) {
    return (
      <div className="text-sm text-muted-foreground">
        <p>เพิ่ม Monthly Returns หรือ Equity Curve เพื่อคำนวณ Sharpe Ratio</p>
      </div>
    );
  }

  // If we have a current value and haven't recalculated, just show recalculate button
  if (currentValue !== null && !result && !isCalculating) {
    return (
      <div className="space-y-2">
        <Button
          onClick={handleCalculate}
          disabled={isCalculating}
          variant="outline"
          size="sm"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          คำนวณใหม่
        </Button>
        <div className="text-xs text-muted-foreground">
          {hasMonthlyReturns && <span className="mr-2">✓ Monthly Returns</span>}
          {hasEquityCurve && <span className="mr-2">✓ Equity Curve</span>}
          {hasDrawdownData && <span>✓ Drawdown Data</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {isCalculating && (
        <div className="flex items-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          กำลังคำนวณอัตโนมัติ...
        </div>
      )}

      {result && (
        <div className="text-sm p-3 bg-green-50 dark:bg-green-950 rounded-md border border-green-200 dark:border-green-800">
          <p className="font-medium text-green-700 dark:text-green-300">
            ✓ คำนวณสำเร็จ
          </p>
          <p className="text-green-600 dark:text-green-400">
            Sharpe Ratio: <strong>{result.sharpeRatio.toFixed(2)}</strong>
          </p>
          <p className="text-xs text-green-500 dark:text-green-500">
            วิธีคำนวณ: {getMethodLabel(result.method)}
          </p>
        </div>
      )}

      {error && (
        <div className="text-sm p-3 bg-red-50 dark:bg-red-950 rounded-md border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {(result || error) && (
        <Button
          onClick={handleCalculate}
          disabled={isCalculating}
          variant="outline"
          size="sm"
        >
          {isCalculating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              กำลังคำนวณ...
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-4 w-4" />
              คำนวณใหม่
            </>
          )}
        </Button>
      )}

      <div className="text-xs text-muted-foreground">
        {hasMonthlyReturns && <span className="mr-2">✓ Monthly Returns</span>}
        {hasEquityCurve && <span className="mr-2">✓ Equity Curve</span>}
        {hasDrawdownData && <span>✓ Drawdown Data</span>}
      </div>
    </div>
  );
}
