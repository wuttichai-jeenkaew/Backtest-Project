import { NextRequest, NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

// Create Yahoo Finance instance
const yahooFinance = new YahooFinance();

interface YahooQuote {
  date: Date;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

interface YahooChartResult {
  quotes: YahooQuote[];
  meta?: {
    shortName?: string;
    currency?: string;
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol") || "AAPL";
  const interval = (searchParams.get("interval") || "1d") as "1m" | "5m" | "15m" | "30m" | "1h" | "1d" | "1wk" | "1mo";
  const range = searchParams.get("range") || getDefaultRange(interval);

  try {
    const result = await yahooFinance.chart(symbol, {
      period1: getStartDate(range, interval),
      interval: interval,
    }) as unknown as YahooChartResult;

    if (!result.quotes || result.quotes.length === 0) {
      throw new Error("No data returned");
    }

    // Transform to candlestick format
    const candles = result.quotes
      .filter((q: YahooQuote) => q.open && q.high && q.low && q.close)
      .map((q: YahooQuote) => ({
        time: Math.floor(new Date(q.date).getTime() / 1000),
        open: q.open!,
        high: q.high!,
        low: q.low!,
        close: q.close!,
        volume: q.volume || 0,
      }));

    return NextResponse.json({
      success: true,
      symbol,
      interval,
      name: result.meta?.shortName || symbol,
      currency: result.meta?.currency || "USD",
      data: candles,
    });
  } catch (error) {
    console.error("Yahoo Finance error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data from Yahoo Finance" },
      { status: 500 }
    );
  }
}

// Get default range based on interval (Yahoo has limits)
function getDefaultRange(interval: string): string {
  switch (interval) {
    case "1m":
      return "5d"; // 1m only allows 7 days
    case "5m":
    case "15m":
    case "30m":
      return "60d"; // These allow 60 days
    case "1h":
      return "6m"; // 1h allows 730 days
    default:
      return "1y";
  }
}

function getStartDate(range: string, interval: string): Date {
  const now = new Date();
  
  // Override range for small intervals due to Yahoo limits
  if (["1m", "5m", "15m", "30m"].includes(interval)) {
    return new Date(now.setDate(now.getDate() - 60));
  }
  if (interval === "1h") {
    return new Date(now.setMonth(now.getMonth() - 6));
  }
  
  switch (range) {
    case "5d":
      return new Date(now.setDate(now.getDate() - 5));
    case "1m":
      return new Date(now.setMonth(now.getMonth() - 1));
    case "3m":
      return new Date(now.setMonth(now.getMonth() - 3));
    case "6m":
      return new Date(now.setMonth(now.getMonth() - 6));
    case "60d":
      return new Date(now.setDate(now.getDate() - 60));
    case "1y":
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case "2y":
      return new Date(now.setFullYear(now.getFullYear() - 2));
    case "5y":
      return new Date(now.setFullYear(now.getFullYear() - 5));
    default:
      return new Date(now.setFullYear(now.getFullYear() - 1));
  }
}
