import type { 
  TradingSystem, 
  BacktestResult, 
  EquityPoint, 
  MonthlyReturn,
  Tag,
  SystemType,
  AssetClass 
} from "@prisma/client";

// Re-export Prisma types
export type { 
  TradingSystem, 
  BacktestResult, 
  EquityPoint, 
  MonthlyReturn,
  Tag,
  SystemType,
  AssetClass 
};

// Extended types with relations
export type TradingSystemWithBacktests = TradingSystem & {
  backtests: BacktestResult[];
};

export type BacktestResultWithRelations = BacktestResult & {
  tradingSystem: TradingSystem;
  equityCurve: EquityPoint[];
  monthlyReturns: MonthlyReturn[];
};

// Form types
export type CreateTradingSystemInput = {
  name: string;
  description?: string;
  type: SystemType;
  assetClass: AssetClass;
  timeframe?: string;
  entryRules?: string;
  exitRules?: string;
};

export type CreateBacktestInput = {
  tradingSystemId: string;
  name?: string;
  symbol: string;
  startDate: Date;
  endDate: Date;
  startingCapital: number;
  endingCapital: number;
  netProfit: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  maxDrawdown?: number;
  maxDrawdownPercent?: number;
  sharpeRatio?: number;
  profitFactor?: number;
  winRate?: number;
  notes?: string;
  dataSource?: string;
};

// Dashboard stats
export type DashboardStats = {
  totalSystems: number;
  totalBacktests: number;
  bestWinRate: number;
  avgSharpeRatio: number;
  totalNetProfit: number;
};

// Chart data types
export type EquityCurveData = {
  date: string;
  equity: number;
  drawdown?: number;
};

export type SystemPerformanceData = {
  systemName: string;
  netProfit: number;
  winRate: number;
  sharpeRatio: number;
  backtestCount: number;
};
