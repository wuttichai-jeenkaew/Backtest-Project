"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  CrosshairMode,
  LineStyle,
  CandlestickSeries,
  LineSeries,
} from "lightweight-charts";
import type { IChartApi, ISeriesApi, CandlestickData, Time } from "lightweight-charts";

interface DrawingLine {
  id: string;
  type: "trendline" | "horizontal";
  points: { time: Time; price: number }[];
  color: string;
}

interface LightweightChartProps {
  data?: CandlestickData<Time>[];
  height?: number;
  theme?: "light" | "dark";
  symbol?: string;
}

// Detect decimal places based on symbol/price
const getDecimalPlaces = (symbol?: string, data?: CandlestickData<Time>[]): number => {
  // Check symbol pattern for Forex
  if (symbol) {
    const upperSymbol = symbol.toUpperCase();
    // JPY pairs have 3 decimals
    if (upperSymbol.includes("JPY")) return 3;
    // Forex pairs typically have 5 decimals
    if (upperSymbol.includes("USD=X") || upperSymbol.includes("EUR") || 
        upperSymbol.includes("GBP") || upperSymbol.includes("AUD") ||
        upperSymbol.includes("CAD") || upperSymbol.includes("CHF") ||
        upperSymbol.includes("NZD")) return 5;
    // Gold (XAU) has 2 decimals
    if (upperSymbol.includes("XAU") || upperSymbol.includes("GC=F")) return 2;
    // Crypto with high prices (BTC) use 2 decimals
    if (upperSymbol.includes("BTC")) return 2;
    // Other crypto use more decimals
    if (upperSymbol.includes("USDT") || upperSymbol.includes("USD")) return 4;
  }
  
  // Auto-detect from price if no symbol match
  if (data && data.length > 0) {
    const samplePrice = data[0].close;
    if (samplePrice < 1) return 6;      // Very small prices (some altcoins)
    if (samplePrice < 10) return 4;     // Small prices
    if (samplePrice < 100) return 3;    // Medium prices
    if (samplePrice < 1000) return 2;   // Stocks, Gold
    return 2;                            // Large prices (BTC, indices)
  }
  
  return 2; // Default
};

// Sample data generator
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
  symbol,
}: LightweightChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [drawings, setDrawings] = useState<DrawingLine[]>([]);
  const [activeTool, setActiveTool] = useState<"none" | "trendline" | "horizontal">("none");
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawing, setCurrentDrawing] = useState<DrawingLine | null>(null);
  const [selectedColor, setSelectedColor] = useState("#2962FF");
  const drawingLinesRef = useRef<Map<string, ISeriesApi<"Line">>>(new Map());
  const chartDataRef = useRef<CandlestickData<Time>[]>([]);

  const colors = [
    "#2962FF", // Blue
    "#FF6D00", // Orange
    "#00C853", // Green
    "#D50000", // Red
    "#AA00FF", // Purple
    "#FFD600", // Yellow
    "#FFFFFF", // White
  ];

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
          labelBackgroundColor: isDark ? "#2962FF" : "#2962FF",
        },
        horzLine: {
          color: isDark ? "#758696" : "#9B9B9B",
          labelBackgroundColor: isDark ? "#2962FF" : "#2962FF",
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

    chartDataRef.current = chartData;
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
  }, [data, height, theme]);

  // Handle click for drawing
  const handleChartClick = useCallback(
    (param: { time?: Time; point?: { x: number; y: number } }) => {
      if (activeTool === "none" || !chartRef.current || !seriesRef.current) return;

      const chart = chartRef.current;
      const series = seriesRef.current;

      if (!param.time || !param.point) return;

      const price = series.coordinateToPrice(param.point.y);
      if (price === null) return;

      const point = { time: param.time, price };

      if (activeTool === "horizontal") {
        const newLine: DrawingLine = {
          id: `line-${Date.now()}`,
          type: "horizontal",
          points: [point, point],
          color: selectedColor,
        };

        const lineSeries = chart.addSeries(LineSeries, {
          color: selectedColor,
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          crosshairMarkerVisible: false,
          priceLineVisible: false,
          lastValueVisible: false,
        });

        const allData = chartDataRef.current;
        const lineData = allData.map((d) => ({
          time: d.time,
          value: price,
        }));
        lineSeries.setData(lineData);

        drawingLinesRef.current.set(newLine.id, lineSeries);
        setDrawings((prev) => [...prev, newLine]);
        setActiveTool("none");
      } else if (activeTool === "trendline") {
        if (!isDrawing) {
          setIsDrawing(true);
          setCurrentDrawing({
            id: `line-${Date.now()}`,
            type: "trendline",
            points: [point],
            color: selectedColor,
          });
        } else if (currentDrawing) {
          const completedLine: DrawingLine = {
            ...currentDrawing,
            points: [...currentDrawing.points, point],
          };

          const lineSeries = chart.addSeries(LineSeries, {
            color: selectedColor,
            lineWidth: 2,
            lineStyle: LineStyle.Solid,
            crosshairMarkerVisible: false,
            priceLineVisible: false,
            lastValueVisible: false,
          });

          const lineData = completedLine.points.map((p) => ({
            time: p.time,
            value: p.price,
          }));
          lineSeries.setData(lineData);

          drawingLinesRef.current.set(completedLine.id, lineSeries);
          setDrawings((prev) => [...prev, completedLine]);
          setCurrentDrawing(null);
          setIsDrawing(false);
          setActiveTool("none");
        }
      }
    },
    [activeTool, isDrawing, currentDrawing, selectedColor]
  );

  // Subscribe to chart clicks
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    chart.subscribeClick(handleChartClick);

    return () => {
      chart.unsubscribeClick(handleChartClick);
    };
  }, [handleChartClick]);

  // Clear all drawings
  const clearAllDrawings = () => {
    const chart = chartRef.current;
    if (!chart) return;

    drawingLinesRef.current.forEach((series) => {
      chart.removeSeries(series);
    });
    drawingLinesRef.current.clear();
    setDrawings([]);
    setCurrentDrawing(null);
    setIsDrawing(false);
  };

  // Delete last drawing
  const deleteLastDrawing = () => {
    const chart = chartRef.current;
    if (!chart || drawings.length === 0) return;

    const lastDrawing = drawings[drawings.length - 1];
    const series = drawingLinesRef.current.get(lastDrawing.id);
    if (series) {
      chart.removeSeries(series);
      drawingLinesRef.current.delete(lastDrawing.id);
    }
    setDrawings((prev) => prev.slice(0, -1));
  };

  // Cancel current drawing
  const cancelDrawing = () => {
    setCurrentDrawing(null);
    setIsDrawing(false);
    setActiveTool("none");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 bg-muted/50 border-b">
        {/* Drawing Tools */}
        <div className="flex items-center gap-1 border-r pr-2">
          <button
            onClick={() => setActiveTool(activeTool === "trendline" ? "none" : "trendline")}
            className={`p-2 rounded hover:bg-muted ${activeTool === "trendline" ? "bg-primary text-primary-foreground" : ""}`}
            title="Trendline (2 คลิก)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="20" x2="20" y2="4" />
            </svg>
          </button>
          <button
            onClick={() => setActiveTool(activeTool === "horizontal" ? "none" : "horizontal")}
            className={`p-2 rounded hover:bg-muted ${activeTool === "horizontal" ? "bg-primary text-primary-foreground" : ""}`}
            title="Horizontal Line (1 คลิก)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="12" x2="20" y2="12" />
            </svg>
          </button>
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1 border-r pr-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-6 h-6 rounded border-2 ${selectedColor === color ? "border-white" : "border-transparent"}`}
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={deleteLastDrawing}
            className="px-3 py-1.5 text-sm rounded hover:bg-muted"
            title="ลบเส้นล่าสุด"
          >
            ↩ Undo
          </button>
          <button
            onClick={clearAllDrawings}
            className="px-3 py-1.5 text-sm rounded hover:bg-destructive hover:text-destructive-foreground"
            title="ลบทั้งหมด"
          >
            🗑 Clear All
          </button>
        </div>

        {/* Status */}
        <div className="ml-auto text-sm text-muted-foreground">
          {isDrawing && activeTool === "trendline" && (
            <span className="text-yellow-500">
              📍 คลิกจุดที่ 2 เพื่อวาดเส้น หรือ{" "}
              <button onClick={cancelDrawing} className="underline">
                ยกเลิก
              </button>
            </span>
          )}
          {activeTool !== "none" && !isDrawing && (
            <span className="text-blue-500">
              🖱 คลิกบน chart เพื่อวาด{" "}
              {activeTool === "trendline" ? "Trendline" : "Horizontal Line"}
            </span>
          )}
          {activeTool === "none" && (
            <span>📊 เส้นที่วาด: {drawings.length}</span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div
        ref={containerRef}
        className="flex-1"
        style={{ cursor: activeTool !== "none" ? "crosshair" : "default" }}
      />
    </div>
  );
}
