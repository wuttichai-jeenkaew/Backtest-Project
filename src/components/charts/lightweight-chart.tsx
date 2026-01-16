"use client";

import { useEffect, useRef } from "react";
import {
  createChart,
  CrosshairMode,
  CandlestickSeries,
} from "lightweight-charts";
import type {
  IChartApi,
  ISeriesApi,
  CandlestickData,
  Time,
} from "lightweight-charts";

interface LightweightChartProps {
  data?: CandlestickData<Time>[];
  height?: number;
  theme?: "light" | "dark";
  symbol?: string;
}

// Get decimal places based on symbol
const getDecimalPlaces = (
  symbol?: string,
  data?: CandlestickData<Time>[]
): number => {
  if (symbol) {
    const upperSymbol = symbol.toUpperCase();
    if (upperSymbol.includes("JPY")) return 3;
    if (
      upperSymbol.includes("USD=X") ||
      upperSymbol.includes("EUR") ||
      upperSymbol.includes("GBP") ||
      upperSymbol.includes("AUD") ||
      upperSymbol.includes("CAD") ||
      upperSymbol.includes("CHF") ||
      upperSymbol.includes("NZD")
    )
      return 5;
    if (upperSymbol.includes("XAU") || upperSymbol.includes("GC=F")) return 2;
    if (upperSymbol.includes("BTC")) return 2;
    if (upperSymbol.includes("USDT") || upperSymbol.includes("USD")) return 4;
  }

  if (data && data.length > 0) {
    const samplePrice = data[0].close;
    if (samplePrice < 1) return 6;
    if (samplePrice < 10) return 4;
    if (samplePrice < 100) return 3;
    if (samplePrice < 1000) return 2;
    return 2;
  }

  return 2;
};

// Generate sample data
const generateSampleData = (): CandlestickData<Time>[] => {
  const data: CandlestickData<Time>[] = [];
  let basePrice = 2000;
  const startDate = new Date("2024-01-01");

  for (let i = 0; i < 200; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);

    const volatility = Math.random() * 50;
    const open = basePrice + (Math.random() - 0.5) * volatility;
    const close = open + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * 20;
    const low = Math.min(open, close) - Math.random() * 20;

    data.push({
      time: date.toISOString().split("T")[0] as Time,
      open,
      high,
      low,
      close,
    });

    basePrice = close;
  }

  return data;
};

export function LightweightChart({
  data,
  height = 500,
  theme = "dark",
  symbol = "UNKNOWN",
}: LightweightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return;

    const isDark = theme === "dark";
    const chartData = data || generateSampleData();
    const decimalPlaces = getDecimalPlaces(symbol, chartData);

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: height,
      layout: {
        background: { color: isDark ? "#1a1a1a" : "#ffffff" },
        textColor: isDark ? "#d1d4dc" : "#191919",
      },
      grid: {
        vertLines: { color: isDark ? "#2B2B43" : "#e1e1e1" },
        horzLines: { color: isDark ? "#2B2B43" : "#e1e1e1" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: isDark ? "#758696" : "#9B9B9B",
          labelBackgroundColor: "#2962FF",
        },
        horzLine: {
          color: isDark ? "#758696" : "#9B9B9B",
          labelBackgroundColor: "#2962FF",
        },
      },
      rightPriceScale: {
        borderColor: isDark ? "#2B2B43" : "#e1e1e1",
      },
      timeScale: {
        borderColor: isDark ? "#2B2B43" : "#e1e1e1",
        timeVisible: true,
      },
      localization: {
        priceFormatter: (price: number) => price.toFixed(decimalPlaces),
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
      priceFormat: {
        type: "price",
        precision: decimalPlaces,
        minMove: 1 / Math.pow(10, decimalPlaces),
      },
    });

    candlestickSeries.setData(chartData);

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [data, height, theme, symbol]);

  return (
    <div className="flex flex-col h-full">
      {/* Chart */}
      <div
        ref={containerRef}
        className="flex-1 relative"
        style={{ minHeight: height }}
      />
    </div>
  );
}
