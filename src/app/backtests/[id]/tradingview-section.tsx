"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TradingViewWidget } from "@/components/charts/tradingview-widget";
import { LineChart, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "next-themes";

interface TradingViewSectionProps {
  symbol: string;
  timeframe?: string | null;
}

// Map common symbols to TradingView format
function mapSymbolToTradingView(symbol: string): string {
  const symbolMap: Record<string, string> = {
    // Forex pairs
    "XAUUSD": "OANDA:XAUUSD",
    "EURUSD": "OANDA:EURUSD",
    "GBPUSD": "OANDA:GBPUSD",
    "USDJPY": "OANDA:USDJPY",
    "AUDUSD": "OANDA:AUDUSD",
    "USDCAD": "OANDA:USDCAD",
    "USDCHF": "OANDA:USDCHF",
    "NZDUSD": "OANDA:NZDUSD",
    "EURJPY": "OANDA:EURJPY",
    "GBPJPY": "OANDA:GBPJPY",
    // Indices
    "NAS100": "OANDA:NAS100USD",
    "NASDAQ": "NASDAQ:NDX",
    "US30": "OANDA:US30USD",
    "DOW": "DJ:DJI",
    "SPX500": "OANDA:SPX500USD",
    "SPX": "SP:SPX",
    "S&P500": "SP:SPX",
    // Crypto
    "BTCUSD": "COINBASE:BTCUSD",
    "ETHUSD": "COINBASE:ETHUSD",
    "BTCUSDT": "BINANCE:BTCUSDT",
    "ETHUSDT": "BINANCE:ETHUSDT",
    // Stocks
    "AAPL": "NASDAQ:AAPL",
    "MSFT": "NASDAQ:MSFT",
    "GOOGL": "NASDAQ:GOOGL",
    "AMZN": "NASDAQ:AMZN",
    "TSLA": "NASDAQ:TSLA",
    "NVDA": "NASDAQ:NVDA",
    "META": "NASDAQ:META",
  };

  const upperSymbol = symbol.toUpperCase().replace(/\s+/g, "");
  
  // Check direct mapping
  if (symbolMap[upperSymbol]) {
    return symbolMap[upperSymbol];
  }

  // If already has exchange prefix, return as is
  if (symbol.includes(":")) {
    return symbol.toUpperCase();
  }

  // Default: try OANDA for forex-like symbols
  if (upperSymbol.length === 6 && /^[A-Z]+$/.test(upperSymbol)) {
    return `OANDA:${upperSymbol}`;
  }

  // Default: try NASDAQ for stock-like symbols
  return `NASDAQ:${upperSymbol}`;
}

// Map timeframe to TradingView interval
function mapTimeframeToInterval(timeframe?: string | null): string {
  if (!timeframe) return "D";
  
  const tfMap: Record<string, string> = {
    "M1": "1",
    "M5": "5",
    "M15": "15",
    "M30": "30",
    "H1": "60",
    "H4": "240",
    "D1": "D",
    "W1": "W",
    "MN": "M",
    "1m": "1",
    "5m": "5",
    "15m": "15",
    "30m": "30",
    "1h": "60",
    "4h": "240",
    "1d": "D",
    "1w": "W",
    "1M": "M",
  };

  return tfMap[timeframe] || "D";
}

export function TradingViewSection({ symbol, timeframe }: TradingViewSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [interval, setInterval] = useState(mapTimeframeToInterval(timeframe));
  const { resolvedTheme } = useTheme();
  
  const tradingViewSymbol = mapSymbolToTradingView(symbol);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <LineChart className="h-5 w-5" />
          TradingView Chart
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1m</SelectItem>
              <SelectItem value="5">5m</SelectItem>
              <SelectItem value="15">15m</SelectItem>
              <SelectItem value="30">30m</SelectItem>
              <SelectItem value="60">1H</SelectItem>
              <SelectItem value="240">4H</SelectItem>
              <SelectItem value="D">1D</SelectItem>
              <SelectItem value="W">1W</SelectItem>
              <SelectItem value="M">1M</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent>
          <div className="text-sm text-muted-foreground mb-2">
            Symbol: {tradingViewSymbol}
          </div>
          <TradingViewWidget
            symbol={tradingViewSymbol}
            interval={interval}
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            height={500}
          />
        </CardContent>
      )}
    </Card>
  );
}
