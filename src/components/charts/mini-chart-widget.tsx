"use client";

import { useEffect, useRef, memo } from "react";

interface MiniChartWidgetProps {
  symbol?: string;
  theme?: "light" | "dark";
  width?: string | number;
  height?: number;
  dateRange?: "1D" | "1M" | "3M" | "12M" | "60M" | "ALL";
  colorTheme?: "light" | "dark";
  isTransparent?: boolean;
}

function MiniChartWidgetComponent({
  symbol = "OANDA:XAUUSD",
  theme = "dark",
  width = "100%",
  height = 220,
  dateRange = "1M",
  isTransparent = true,
}: MiniChartWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    
    if (container) {
      container.innerHTML = "";
    }

    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";

    if (container) {
      container.appendChild(widgetContainer);
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol: symbol,
      width: typeof width === "number" ? width : "100%",
      height: height,
      locale: "th_TH",
      dateRange: dateRange,
      colorTheme: theme,
      isTransparent: isTransparent,
      autosize: false,
      largeChartUrl: "",
    });

    if (container) {
      container.appendChild(script);
    }

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [symbol, theme, width, height, dateRange, isTransparent]);

  return (
    <div
      className="tradingview-widget-container"
      ref={containerRef}
      style={{ height: `${height}px`, width: typeof width === "number" ? `${width}px` : width }}
    />
  );
}

export const MiniChartWidget = memo(MiniChartWidgetComponent);
