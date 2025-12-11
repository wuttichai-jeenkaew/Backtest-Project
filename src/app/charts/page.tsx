"use client";

import { TradingViewWidget } from "@/components/charts/tradingview-widget";
import { Header } from "@/components/layout/header";
import { useTheme } from "next-themes";

export default function ChartsPage() {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <Header title="TradingView Charts" />
      <div className="p-4 h-[calc(100vh-60px)]">
        {/* Main Chart - Full Screen */}
        <div className="border-2 rounded-lg overflow-hidden h-full">
          <TradingViewWidget
            symbol="OANDA:XAUUSD"
            interval="D"
            theme={resolvedTheme === "dark" ? "dark" : "light"}
            height="100%"
            allowSymbolChange={true}
            showToolbar={true}
          />
        </div>
      </div>
    </>
  );
}
