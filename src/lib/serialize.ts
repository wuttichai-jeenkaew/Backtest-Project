import { Decimal } from "@prisma/client/runtime/library";

/**
 * Convert Prisma Decimal to number for Client Component serialization
 */
export function toNumber(value: Decimal | number | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  return typeof value === "number" ? value : Number(value);
}

/**
 * Serialize a backtest result for passing to Client Components
 * Converts all Decimal fields to numbers
 */
export function serializeBacktest<T extends Record<string, unknown>>(backtest: T): T {
  const serialized: Record<string, unknown> = { ...backtest };
  
  // List of Decimal fields that need conversion
  const decimalFields = [
    "startingCapital",
    "endingCapital",
    "netProfit",
    "netProfitPercent",
    "grossProfit",
    "grossLoss",
    "maxDrawdown",
    "maxDrawdownPercent",
    "sharpeRatio",
    "riskRewardRatio",
    "winRate",
    "profitFactor",
    "averageWin",
    "averageLoss",
    "averageTrade",
    "largestWin",
    "largestLoss",
    "expectancy",
    "averageHoldTime",
    "tradesPerDay",
    "commission",
    "slippage",
    "equity",
  ];

  for (const field of decimalFields) {
    if (field in serialized && serialized[field] !== null && serialized[field] !== undefined) {
      serialized[field] = Number(serialized[field]);
    }
  }

  return serialized as T;
}

/**
 * Serialize an array of backtest results
 */
export function serializeBacktests<T extends Record<string, unknown>>(backtests: T[]): T[] {
  return backtests.map(serializeBacktest);
}
