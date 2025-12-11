"use client";

import { useEffect, useRef, memo } from "react";

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: "light" | "dark";
  width?: string | number;
  height?: number | string;
  interval?: string;
  timezone?: string;
  allowSymbolChange?: boolean;
  showToolbar?: boolean;
}

function TradingViewWidgetComponent({
  symbol = "OANDA:XAUUSD",
  theme = "dark",
  width = "100%",
  height = 500,
  interval = "D",
  timezone = "Asia/Bangkok",
  allowSymbolChange = true,
  showToolbar = true,
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  const heightStyle = typeof height === "number" ? `${height}px` : height;
  const widthStyle = typeof width === "number" ? `${width}px` : width;

  useEffect(() => {
    const container = containerRef.current;
    
    // Clean up previous widget
    if (container) {
      container.innerHTML = "";
    }

    // Create container div for widget
    const widgetContainer = document.createElement("div");
    widgetContainer.className = "tradingview-widget-container__widget";
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";

    if (container) {
      container.appendChild(widgetContainer);
    }

    // Create script element
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: symbol,
      interval: interval,
      timezone: timezone,
      theme: theme,
      style: "1",
      locale: "th_TH",
      allow_symbol_change: allowSymbolChange,
      hide_top_toolbar: !showToolbar,
      hide_legend: false,
      save_image: true,
      calendar: false,
      support_host: "https://www.tradingview.com",
    });

    if (container) {
      container.appendChild(script);
    }

    scriptRef.current = script;

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [symbol, theme, width, height, interval, timezone, allowSymbolChange, showToolbar]);

  return (
    <div
      className="tradingview-widget-container"
      ref={containerRef}
      style={{ height: heightStyle, width: widthStyle, minHeight: typeof height === "number" ? `${height}px` : undefined }}
    />
  );
}

export const TradingViewWidget = memo(TradingViewWidgetComponent);
