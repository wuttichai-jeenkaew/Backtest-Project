"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createChart, ColorType, IChartApi, Time, AreaSeries, LineSeries } from "lightweight-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface EquityPoint {
  id?: string;
  date: string;
  equity: number;
  drawdown?: number | null;
}

interface EquityCurveChartProps {
  data: EquityPoint[];
  onAddPoints?: (points: Omit<EquityPoint, "id">[]) => Promise<void>;
  onDeletePoints?: () => Promise<void>;
}

export function EquityCurveChart({
  data,
  onAddPoints,
  onDeletePoints,
}: EquityCurveChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bulkData, setBulkData] = useState("");
  const [manualPoints, setManualPoints] = useState<{ date: string; equity: string }[]>([
    { date: "", equity: "" },
  ]);

  // Memoize chart data
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        time: point.date as Time,
        value: Number(point.equity),
      })),
    [data]
  );

  const drawdownData = useMemo(
    () =>
      data
        .filter((point) => point.drawdown !== null && point.drawdown !== undefined)
        .map((point) => ({
          time: point.date as Time,
          value: Number(point.drawdown) * -1,
        })),
    [data]
  );

  // Initialize chart
  const initChart = useCallback(() => {
    if (!chartContainerRef.current) return;

    // Clean up existing chart
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9ca3af",
      },
      grid: {
        vertLines: { color: "rgba(156, 163, 175, 0.1)" },
        horzLines: { color: "rgba(156, 163, 175, 0.1)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        borderVisible: false,
      },
    });

    chartRef.current = chart;

    // Create equity series (area chart)
    const equitySeries = chart.addSeries(AreaSeries, {
      lineColor: "#22c55e",
      topColor: "rgba(34, 197, 94, 0.4)",
      bottomColor: "rgba(34, 197, 94, 0.0)",
      lineWidth: 2,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `$${price.toLocaleString()}`,
      },
    });

    if (chartData.length > 0) {
      equitySeries.setData(chartData);
    }

    // Create drawdown series if data exists
    if (drawdownData.length > 0) {
      const drawdownSeries = chart.addSeries(LineSeries, {
        color: "#ef4444",
        lineWidth: 1,
        lineStyle: 2,
        priceScaleId: "drawdown",
        priceFormat: {
          type: "custom",
          formatter: (price: number) => `${price.toFixed(2)}%`,
        },
      });
      drawdownSeries.setData(drawdownData);

      chart.priceScale("drawdown").applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });
    }

    chart.timeScale().fitContent();

    return chart;
  }, [chartData, drawdownData]);

  useEffect(() => {
    const chart = initChart();

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chart) {
        chart.remove();
      }
    };
  }, [initChart]);

  const addManualPoint = () => {
    setManualPoints([...manualPoints, { date: "", equity: "" }]);
  };

  const removeManualPoint = (index: number) => {
    setManualPoints(manualPoints.filter((_, i) => i !== index));
  };

  const updateManualPoint = (index: number, field: "date" | "equity", value: string) => {
    const newPoints = [...manualPoints];
    newPoints[index][field] = value;
    setManualPoints(newPoints);
  };

  const handleAddManualPoints = async () => {
    if (!onAddPoints) return;

    const validPoints: Omit<EquityPoint, "id">[] = manualPoints
      .filter((p) => p.date && p.equity)
      .map((p) => ({
        date: p.date,
        equity: parseFloat(p.equity),
        drawdown: null,
      }));

    if (validPoints.length > 0) {
      await onAddPoints(validPoints);
      setManualPoints([{ date: "", equity: "" }]);
      setIsDialogOpen(false);
    }
  };

  const handleBulkImport = async () => {
    if (!onAddPoints || !bulkData.trim()) return;

    const lines = bulkData.trim().split("\n");
    const points: Omit<EquityPoint, "id">[] = [];

    for (const line of lines) {
      const parts = line.split(",").map((s) => s.trim());
      if (parts.length >= 2) {
        const dateStr = parts[0];
        const equity = parseFloat(parts[1]);
        const drawdown = parts[2] ? parseFloat(parts[2]) : null;

        // Validate date format (YYYY-MM-DD)
        if (dateStr && !isNaN(equity)) {
          points.push({ date: dateStr, equity, drawdown });
        }
      }
    }

    if (points.length > 0) {
      await onAddPoints(points);
      setBulkData("");
      setIsDialogOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Equity Curve</CardTitle>
        <div className="flex gap-2">
          {onAddPoints && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Data
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Equity Curve Data</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Manual Entry */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Manual Entry</h4>
                    {manualPoints.map((point, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label>Date</Label>
                          <Input
                            type="date"
                            value={point.date}
                            onChange={(e) => updateManualPoint(index, "date", e.target.value)}
                          />
                        </div>
                        <div className="flex-1">
                          <Label>Equity ($)</Label>
                          <Input
                            type="number"
                            value={point.equity}
                            onChange={(e) => updateManualPoint(index, "equity", e.target.value)}
                            placeholder="10000"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeManualPoint(index)}
                          disabled={manualPoints.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={addManualPoint}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Row
                      </Button>
                      <Button size="sm" onClick={handleAddManualPoints}>
                        Save Points
                      </Button>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  {/* Bulk Import */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Bulk Import (CSV)
                    </h4>
                    <Textarea
                      placeholder={`Paste CSV data:\nYYYY-MM-DD,equity,drawdown%\n2025-01-01,10000,0\n2025-01-15,10500,-2.5\n2025-02-01,11000,-1.0`}
                      rows={6}
                      value={bulkData}
                      onChange={(e) => setBulkData(e.target.value)}
                    />
                    <Button onClick={handleBulkImport} disabled={!bulkData.trim()}>
                      Import Data
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {data.length > 0 && onDeletePoints && (
            <Button variant="ghost" size="sm" onClick={onDeletePoints}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div ref={chartContainerRef} />
        ) : (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            <div className="text-center">
              <p>No equity curve data</p>
              <p className="text-sm">Add data points to visualize performance over time</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
