import { NextRequest, NextResponse } from "next/server";

// Binance API - ไม่ต้อง API Key
const BINANCE_API = "https://api.binance.com/api/v3";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get("symbol") || "BTCUSDT";
  const interval = searchParams.get("interval") || "1d";
  const limit = searchParams.get("limit") || "200";

  try {
    const response = await fetch(
      `${BINANCE_API}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      { next: { revalidate: 60 } } // Cache 1 minute
    );

    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform to candlestick format
    // Binance returns: [openTime, open, high, low, close, volume, closeTime, ...]
    const candles = data.map((item: (string | number)[]) => ({
      time: Math.floor(Number(item[0]) / 1000), // Convert to seconds
      open: parseFloat(item[1] as string),
      high: parseFloat(item[2] as string),
      low: parseFloat(item[3] as string),
      close: parseFloat(item[4] as string),
      volume: parseFloat(item[5] as string),
    }));

    return NextResponse.json({
      success: true,
      symbol,
      interval,
      data: candles,
    });
  } catch (error) {
    console.error("Binance API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch data from Binance" },
      { status: 500 }
    );
  }
}
