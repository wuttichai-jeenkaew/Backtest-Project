"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Header } from "@/components/layout/header";
import { LightweightChart } from "@/components/charts/lightweight-chart";
import { useTheme } from "next-themes";
import { PenTool, Info, Search, Loader2 } from "lucide-react";
import type { CandlestickData, Time } from "lightweight-charts";

type DataSource = "binance" | "yahoo";

interface MarketData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

const POPULAR_SYMBOLS = {
  binance: [
    { symbol: "BTCUSDT", name: "Bitcoin" },
    { symbol: "ETHUSDT", name: "Ethereum" },
    { symbol: "SOLUSDT", name: "Solana" },
    { symbol: "BNBUSDT", name: "BNB" },
    { symbol: "XRPUSDT", name: "XRP" },
    { symbol: "ADAUSDT", name: "Cardano" },
    { symbol: "DOGEUSDT", name: "Dogecoin" },
  ],
  yahoo: [
    // Stocks
    { symbol: "AAPL", name: "Apple" },
    { symbol: "MSFT", name: "Microsoft" },
    { symbol: "GOOGL", name: "Google" },
    { symbol: "TSLA", name: "Tesla" },
    { symbol: "NVDA", name: "Nvidia" },
    // Forex
    { symbol: "EURUSD=X", name: "EUR/USD" },
    { symbol: "GBPUSD=X", name: "GBP/USD" },
    { symbol: "USDJPY=X", name: "USD/JPY" },
    { symbol: "XAUUSD=X", name: "XAU/USD" },
    // Commodities
    { symbol: "GC=F", name: "Gold" },
    { symbol: "CL=F", name: "Oil" },
  ],
};

const INTERVALS = {
  binance: [
    { value: "1h", label: "1H" },
    { value: "4h", label: "4H" },
    { value: "1d", label: "1D" },
    { value: "1w", label: "1W" },
  ],
  yahoo: [
    { value: "15m", label: "15m" },
    { value: "1h", label: "1H" },
    { value: "1d", label: "1D" },
    { value: "1wk", label: "1W" },
    { value: "1mo", label: "1M" },
  ],
};

export default function DrawingChartPage() {
  const { resolvedTheme } = useTheme();
  const [showHelp, setShowHelp] = useState(true);
  const [dataSource, setDataSource] = useState<DataSource>("binance");
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [customSymbol, setCustomSymbol] = useState("");
  const [interval, setInterval] = useState("1d");
  const [chartData, setChartData] = useState<CandlestickData<Time>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let url = "";
      if (dataSource === "binance") {
        url = `/api/market/binance?symbol=${symbol}&interval=${interval}&limit=200`;
      } else {
        url = `/api/market/yahoo?symbol=${symbol}&interval=${interval}&range=1y`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to fetch data");
      }

      // Convert to lightweight-charts format
      const formattedData: CandlestickData<Time>[] = result.data.map(
        (d: MarketData) => ({
          time: d.time as Time,
          open: d.open,
          high: d.high,
          low: d.low,
          close: d.close,
        })
      );

      setChartData(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [dataSource, symbol, interval]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSymbolChange = (newSymbol: string) => {
    setSymbol(newSymbol);
  };

  const handleDataSourceChange = (source: DataSource) => {
    setDataSource(source);
    // Reset to default symbol for new source
    if (source === "binance") {
      setSymbol("BTCUSDT");
      setInterval("1d");
    } else {
      setSymbol("AAPL");
      setInterval("1d");
    }
  };

  const handleCustomSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSymbol.trim()) {
      setSymbol(customSymbol.toUpperCase());
      setCustomSymbol("");
    }
  };

  return (
    <>
      <Header title="Drawing Chart" />
      <div className="flex flex-1 flex-col gap-4 p-4 h-[calc(100vh-60px)]">
        {/* Help Banner */}
        {showHelp && (
          <Card className="bg-blue-500/10 border-blue-500/30 shrink-0">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-500 mb-1">วิธีใช้เครื่องมือวาด</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>📏 <strong>Trendline:</strong> คลิก 2 จุดเพื่อวาดเส้นแนวโน้ม</li>
                      <li>➖ <strong>Horizontal Line:</strong> คลิก 1 จุดเพื่อวาดเส้นแนวนอน</li>
                      <li>🎨 <strong>สี:</strong> เลือกสีก่อนวาด</li>
                      <li>↩ <strong>Undo:</strong> ลบเส้นล่าสุด</li>
                    </ul>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelp(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {/* Data Source */}
          <Select value={dataSource} onValueChange={(v) => handleDataSourceChange(v as DataSource)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="binance">🪙 Binance</SelectItem>
              <SelectItem value="yahoo">📈 Yahoo</SelectItem>
            </SelectContent>
          </Select>

          {/* Custom Symbol */}
          <form onSubmit={handleCustomSymbolSubmit} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={dataSource === "binance" ? "เช่น BTCUSDT" : "เช่น AAPL, GC=F"}
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value)}
                className="pl-9 w-40"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">
              ค้นหา
            </Button>
          </form>

          {/* Interval */}
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INTERVALS[dataSource].map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Quick Symbols */}
          <div className="flex gap-1 flex-wrap">
            {POPULAR_SYMBOLS[dataSource].slice(0, 5).map((s) => (
              <Button
                key={s.symbol}
                variant={symbol === s.symbol ? "default" : "outline"}
                size="sm"
                onClick={() => handleSymbolChange(s.symbol)}
                className="text-xs"
              >
                {s.name}
              </Button>
            ))}
          </div>

          {/* Current Symbol */}
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PenTool className="h-4 w-4" />
            )}
            <span className="font-mono font-semibold">{symbol}</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Card className="bg-red-500/10 border-red-500/30 shrink-0">
            <CardContent className="p-3 text-sm text-red-500">
              ❌ {error}
            </CardContent>
          </Card>
        )}

        {/* Chart */}
        <Card className="flex-1 flex flex-col overflow-hidden">
          <CardHeader className="py-2 border-b shrink-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <PenTool className="h-5 w-5 text-primary" />
              {symbol}
              <span className="text-sm text-muted-foreground font-normal ml-2">
                ({dataSource === "binance" ? "Binance" : "Yahoo Finance"} - {interval})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 min-h-0">
            {chartData.length > 0 ? (
              <LightweightChart
                data={chartData}
                theme={resolvedTheme === "dark" ? "dark" : "light"}
                height={500}
                symbol={symbol}
              />
            ) : loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                ไม่มีข้อมูล
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
