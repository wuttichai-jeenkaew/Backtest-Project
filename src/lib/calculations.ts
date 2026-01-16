/**
 * Trading Calculations Utility Functions
 * =======================================
 * Functions for calculating various trading metrics
 */

interface EquityPoint {
  date: Date;
  equity: number | { toNumber(): number };
}

interface MonthlyReturn {
  year: number;
  month: number;
  returnPercent: number | { toNumber(): number };
}

/**
 * Calculate Sharpe Ratio from monthly returns
 *
 * Formula: (Mean Return - Risk-Free Rate) / Standard Deviation of Returns
 *
 * @param monthlyReturns - Array of monthly return data
 * @param riskFreeRateAnnual - Annual risk-free rate (default: 0.02 = 2%)
 * @returns Sharpe Ratio (annualized)
 */
export function calculateSharpeRatioFromMonthlyReturns(
  monthlyReturns: MonthlyReturn[],
  riskFreeRateAnnual: number = 0.02
): number | null {
  if (!monthlyReturns || monthlyReturns.length < 2) {
    return null;
  }

  // Extract returns as numbers
  const returns = monthlyReturns.map((r) => {
    const val = r.returnPercent;
    return typeof val === "number" ? val : val.toNumber();
  });

  // Calculate mean return
  const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;

  // Calculate standard deviation
  const squaredDiffs = returns.map((r) => Math.pow(r - meanReturn, 2));
  const variance =
    squaredDiffs.reduce((sum, sq) => sum + sq, 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return null; // Cannot calculate if no volatility
  }

  // Monthly risk-free rate
  const monthlyRiskFreeRate = (riskFreeRateAnnual / 12) * 100; // Convert to percentage points

  // Calculate monthly Sharpe Ratio and annualize
  const monthlySharpe = (meanReturn - monthlyRiskFreeRate) / stdDev;
  const annualizedSharpe = monthlySharpe * Math.sqrt(12);

  return annualizedSharpe;
}

/**
 * Calculate Sharpe Ratio from equity curve
 *
 * @param equityCurve - Array of equity points (must have at least 2 points)
 * @param riskFreeRateAnnual - Annual risk-free rate (default: 0.02 = 2%)
 * @returns Sharpe Ratio (annualized)
 */
export function calculateSharpeRatioFromEquityCurve(
  equityCurve: EquityPoint[],
  riskFreeRateAnnual: number = 0.02
): number | null {
  if (!equityCurve || equityCurve.length < 2) {
    return null;
  }

  // Sort by date
  const sorted = [...equityCurve].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate daily returns
  const dailyReturns: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prevEquityRaw = sorted[i - 1].equity;
    const currEquityRaw = sorted[i].equity;
    const prevEquity =
      typeof prevEquityRaw === "number"
        ? prevEquityRaw
        : prevEquityRaw.toNumber();
    const currEquity =
      typeof currEquityRaw === "number"
        ? currEquityRaw
        : currEquityRaw.toNumber();

    if (prevEquity > 0) {
      const dailyReturn = ((currEquity - prevEquity) / prevEquity) * 100;
      dailyReturns.push(dailyReturn);
    }
  }

  if (dailyReturns.length < 2) {
    return null;
  }

  // Calculate mean daily return
  const meanReturn =
    dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;

  // Calculate standard deviation
  const squaredDiffs = dailyReturns.map((r) => Math.pow(r - meanReturn, 2));
  const variance =
    squaredDiffs.reduce((sum, sq) => sum + sq, 0) / (dailyReturns.length - 1);
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) {
    return null;
  }

  // Daily risk-free rate
  const dailyRiskFreeRate = (riskFreeRateAnnual / 252) * 100; // 252 trading days

  // Calculate daily Sharpe and annualize
  const dailySharpe = (meanReturn - dailyRiskFreeRate) / stdDev;
  const annualizedSharpe = dailySharpe * Math.sqrt(252);

  return annualizedSharpe;
}

/**
 * Calculate a simplified Sharpe Ratio from total return and period
 * This is less accurate but can be used when detailed data is not available
 *
 * @param totalReturnPercent - Total return in percentage
 * @param periodDays - Number of days in the backtest period
 * @param maxDrawdownPercent - Maximum drawdown percentage (used as proxy for volatility)
 * @param riskFreeRateAnnual - Annual risk-free rate (default: 0.02 = 2%)
 * @returns Approximate Sharpe Ratio
 */
export function calculateSimplifiedSharpeRatio(
  totalReturnPercent: number,
  periodDays: number,
  maxDrawdownPercent: number,
  riskFreeRateAnnual: number = 0.02
): number | null {
  if (periodDays <= 0 || maxDrawdownPercent === 0) {
    return null;
  }

  // Annualize the return
  const annualizedReturn = (totalReturnPercent / periodDays) * 365;

  // Risk-free rate as percentage
  const riskFreeRatePercent = riskFreeRateAnnual * 100;

  // Use max drawdown as a proxy for volatility
  // This is a rough approximation - actual Sharpe Ratio requires return distribution data
  const estimatedVolatility = Math.abs(maxDrawdownPercent) * 2; // Rule of thumb

  if (estimatedVolatility === 0) {
    return null;
  }

  const sharpeRatio =
    (annualizedReturn - riskFreeRatePercent) / estimatedVolatility;

  return sharpeRatio;
}

/**
 * Get the best available Sharpe Ratio calculation based on available data
 */
export function calculateBestSharpeRatio(
  monthlyReturns: MonthlyReturn[] | null | undefined,
  equityCurve: EquityPoint[] | null | undefined,
  totalReturnPercent?: number,
  periodDays?: number,
  maxDrawdownPercent?: number
): { sharpeRatio: number | null; method: string } {
  // Priority 1: Monthly Returns (most accurate for typical backtest data)
  if (monthlyReturns && monthlyReturns.length >= 3) {
    const sharpe = calculateSharpeRatioFromMonthlyReturns(monthlyReturns);
    if (sharpe !== null) {
      return { sharpeRatio: sharpe, method: "monthly_returns" };
    }
  }

  // Priority 2: Equity Curve
  if (equityCurve && equityCurve.length >= 10) {
    const sharpe = calculateSharpeRatioFromEquityCurve(equityCurve);
    if (sharpe !== null) {
      return { sharpeRatio: sharpe, method: "equity_curve" };
    }
  }

  // Priority 3: Simplified calculation (least accurate)
  if (
    totalReturnPercent !== undefined &&
    periodDays !== undefined &&
    maxDrawdownPercent !== undefined &&
    maxDrawdownPercent !== 0
  ) {
    const sharpe = calculateSimplifiedSharpeRatio(
      totalReturnPercent,
      periodDays,
      maxDrawdownPercent!
    );
    if (sharpe !== null) {
      return { sharpeRatio: sharpe, method: "simplified" };
    }
  }

  return { sharpeRatio: null, method: "none" };
}

// ============================================
// PROFIT CONSISTENCY CALCULATIONS
// ============================================

interface DailyPnL {
  date: Date | string;
  pnl: number | { toNumber(): number };
}

/**
 * Calculate Profit Consistency from daily P/L data
 *
 * The Profit Consistency Rule:
 * The profit of the best trading day should NOT exceed a certain percentage (typically 20%) of total profit.
 *
 * Formula: (Best Day Profit / Total Profit) × 100
 *
 * @param dailyPnL - Array of daily P/L data
 * @param threshold - The maximum allowed percentage (default: 20%)
 * @returns Object with consistency percentage, pass/fail status, and details
 */
export function calculateProfitConsistency(
  dailyPnL: DailyPnL[],
  threshold: number = 20
): {
  consistencyPercent: number | null;
  passed: boolean;
  bestDayProfit: number;
  bestDayDate: string | null;
  totalProfit: number;
  profitableDays: number;
  losingDays: number;
  threshold: number;
  message: string;
} {
  if (!dailyPnL || dailyPnL.length === 0) {
    return {
      consistencyPercent: null,
      passed: false,
      bestDayProfit: 0,
      bestDayDate: null,
      totalProfit: 0,
      profitableDays: 0,
      losingDays: 0,
      threshold,
      message: "ไม่มีข้อมูล Daily P/L",
    };
  }

  // Convert to numbers and track dates
  const dailyData = dailyPnL.map((d) => {
    const pnl = typeof d.pnl === "number" ? d.pnl : d.pnl.toNumber();
    const date =
      typeof d.date === "string" ? d.date : d.date.toISOString().split("T")[0];
    return { date, pnl };
  });

  // Calculate total profit (sum of all P/L)
  const totalProfit = dailyData.reduce((sum, d) => sum + d.pnl, 0);

  // Find best day (highest profit)
  let bestDay = dailyData[0];
  for (const day of dailyData) {
    if (day.pnl > bestDay.pnl) {
      bestDay = day;
    }
  }

  // Count profitable and losing days
  const profitableDays = dailyData.filter((d) => d.pnl > 0).length;
  const losingDays = dailyData.filter((d) => d.pnl < 0).length;

  // If total profit is 0 or negative, consistency cannot be calculated meaningfully
  if (totalProfit <= 0) {
    return {
      consistencyPercent: null,
      passed: false,
      bestDayProfit: bestDay.pnl,
      bestDayDate: bestDay.date,
      totalProfit,
      profitableDays,
      losingDays,
      threshold,
      message:
        totalProfit === 0
          ? "กำไรรวมเป็น 0 - ไม่สามารถคำนวณได้"
          : "กำไรรวมติดลบ - ไม่ผ่านเกณฑ์",
    };
  }

  // If best day is not profitable, consistency is perfect (0%)
  if (bestDay.pnl <= 0) {
    return {
      consistencyPercent: 0,
      passed: true,
      bestDayProfit: bestDay.pnl,
      bestDayDate: bestDay.date,
      totalProfit,
      profitableDays,
      losingDays,
      threshold,
      message: "✓ ผ่านเกณฑ์ - ไม่มีวันที่กำไรโดดเด่น",
    };
  }

  // Calculate consistency percentage
  const consistencyPercent = (bestDay.pnl / totalProfit) * 100;
  const passed = consistencyPercent <= threshold;

  let message: string;
  if (passed) {
    message = `✓ ผ่านเกณฑ์ ${threshold}% (${consistencyPercent.toFixed(1)}%)`;
  } else {
    const neededProfit = bestDay.pnl / (threshold / 100) - totalProfit;
    message = `✗ ไม่ผ่านเกณฑ์ ${threshold}% - ต้องทำกำไรเพิ่มอีก $${neededProfit.toFixed(
      0
    )} เพื่อผ่าน`;
  }

  return {
    consistencyPercent,
    passed,
    bestDayProfit: bestDay.pnl,
    bestDayDate: bestDay.date,
    totalProfit,
    profitableDays,
    losingDays,
    threshold,
    message,
  };
}

/**
 * Calculate Profit Consistency from Equity Curve
 * Derives daily P/L from consecutive equity points
 *
 * @param equityCurve - Array of equity points
 * @param threshold - The maximum allowed percentage (default: 20%)
 * @returns Profit consistency result
 */
export function calculateProfitConsistencyFromEquityCurve(
  equityCurve: EquityPoint[],
  threshold: number = 20
): ReturnType<typeof calculateProfitConsistency> {
  if (!equityCurve || equityCurve.length < 2) {
    return {
      consistencyPercent: null,
      passed: false,
      bestDayProfit: 0,
      bestDayDate: null,
      totalProfit: 0,
      profitableDays: 0,
      losingDays: 0,
      threshold,
      message: "ต้องมีข้อมูล Equity Curve อย่างน้อย 2 จุด",
    };
  }

  // Sort by date
  const sorted = [...equityCurve].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate daily P/L from equity changes
  const dailyPnL: DailyPnL[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prevEquityRaw = sorted[i - 1].equity;
    const currEquityRaw = sorted[i].equity;
    const prevEquity =
      typeof prevEquityRaw === "number"
        ? prevEquityRaw
        : prevEquityRaw.toNumber();
    const currEquity =
      typeof currEquityRaw === "number"
        ? currEquityRaw
        : currEquityRaw.toNumber();

    const date = sorted[i].date;
    const pnl = currEquity - prevEquity;

    dailyPnL.push({ date, pnl });
  }

  return calculateProfitConsistency(dailyPnL, threshold);
}

/**
 * Get the best available Profit Consistency calculation
 */
export function calculateBestProfitConsistency(
  equityCurve: EquityPoint[] | null | undefined,
  dailyPnL: DailyPnL[] | null | undefined,
  threshold: number = 20
): { result: ReturnType<typeof calculateProfitConsistency>; method: string } {
  // Priority 1: Direct daily P/L data (most accurate)
  if (dailyPnL && dailyPnL.length >= 2) {
    const result = calculateProfitConsistency(dailyPnL, threshold);
    if (result.consistencyPercent !== null) {
      return { result, method: "daily_pnl" };
    }
  }

  // Priority 2: Derive from equity curve
  if (equityCurve && equityCurve.length >= 2) {
    const result = calculateProfitConsistencyFromEquityCurve(
      equityCurve,
      threshold
    );
    if (result.consistencyPercent !== null) {
      return { result, method: "equity_curve" };
    }
  }

  return {
    result: {
      consistencyPercent: null,
      passed: false,
      bestDayProfit: 0,
      bestDayDate: null,
      totalProfit: 0,
      profitableDays: 0,
      losingDays: 0,
      threshold,
      message: "ไม่มีข้อมูลเพียงพอสำหรับคำนวณ",
    },
    method: "none",
  };
}
