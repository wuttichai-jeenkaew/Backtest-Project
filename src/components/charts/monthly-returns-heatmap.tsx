"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MonthlyReturn {
  id?: string;
  year: number;
  month: number;
  returnPercent: number;
  trades?: number | null;
}

interface MonthlyReturnsHeatmapProps {
  data: MonthlyReturn[];
  onAddReturns?: (returns: Omit<MonthlyReturn, "id">[]) => Promise<void>;
  onDeleteReturns?: () => Promise<void>;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function MonthlyReturnsHeatmap({
  data,
  onAddReturns,
  onDeleteReturns,
}: MonthlyReturnsHeatmapProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthlyInputs, setMonthlyInputs] = useState<{ [key: number]: { return: string; trades: string } }>(
    Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, { return: "", trades: "" }]))
  );

  // Group data by year
  const dataByYear: { [year: number]: { [month: number]: MonthlyReturn } } = {};
  data.forEach((item) => {
    if (!dataByYear[item.year]) {
      dataByYear[item.year] = {};
    }
    dataByYear[item.year][item.month] = item;
  });

  const years = Object.keys(dataByYear)
    .map(Number)
    .sort((a, b) => b - a);

  // Calculate yearly totals
  const yearlyTotals: { [year: number]: number } = {};
  years.forEach((year) => {
    const yearData = dataByYear[year];
    let total = 0;
    Object.values(yearData).forEach((m) => {
      // Compound returns: (1 + r1) * (1 + r2) - 1
      total = (1 + total / 100) * (1 + Number(m.returnPercent) / 100) - 1;
      total *= 100;
    });
    yearlyTotals[year] = total;
  });

  // Color scale for returns
  const getColor = (value: number): string => {
    if (value >= 10) return "bg-green-600 text-white";
    if (value >= 5) return "bg-green-500 text-white";
    if (value >= 2) return "bg-green-400 text-white";
    if (value > 0) return "bg-green-300 text-green-900";
    if (value === 0) return "bg-gray-200 dark:bg-gray-700";
    if (value > -2) return "bg-red-300 text-red-900";
    if (value > -5) return "bg-red-400 text-white";
    if (value > -10) return "bg-red-500 text-white";
    return "bg-red-600 text-white";
  };

  const handleAddReturns = async () => {
    if (!onAddReturns) return;

    const returns: Omit<MonthlyReturn, "id">[] = [];
    for (let month = 1; month <= 12; month++) {
      const input = monthlyInputs[month];
      if (input.return) {
        returns.push({
          year: selectedYear,
          month,
          returnPercent: parseFloat(input.return),
          trades: input.trades ? parseInt(input.trades) : null,
        });
      }
    }

    if (returns.length > 0) {
      await onAddReturns(returns);
      setMonthlyInputs(
        Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, { return: "", trades: "" }]))
      );
      setIsDialogOpen(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Monthly Returns</CardTitle>
        <div className="flex gap-2">
          {onAddReturns && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Data
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Monthly Returns</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      className="w-32"
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {MONTHS.map((month, index) => (
                      <div key={month} className="space-y-1">
                        <Label className="text-xs">{month}</Label>
                        <div className="flex gap-1">
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="%"
                            value={monthlyInputs[index + 1]?.return || ""}
                            onChange={(e) =>
                              setMonthlyInputs({
                                ...monthlyInputs,
                                [index + 1]: { ...monthlyInputs[index + 1], return: e.target.value },
                              })
                            }
                            className="w-20 text-sm"
                          />
                          <Input
                            type="number"
                            placeholder="#"
                            value={monthlyInputs[index + 1]?.trades || ""}
                            onChange={(e) =>
                              setMonthlyInputs({
                                ...monthlyInputs,
                                [index + 1]: { ...monthlyInputs[index + 1], trades: e.target.value },
                              })
                            }
                            className="w-14 text-sm"
                            title="Number of trades"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleAddReturns}>Save Monthly Returns</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          {data.length > 0 && onDeleteReturns && (
            <Button variant="ghost" size="sm" onClick={onDeleteReturns}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <TooltipProvider>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2 font-medium">Year</th>
                    {MONTHS.map((month) => (
                      <th key={month} className="text-center p-2 font-medium w-16">
                        {month}
                      </th>
                    ))}
                    <th className="text-center p-2 font-medium w-20">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {years.map((year) => (
                    <tr key={year}>
                      <td className="p-2 font-medium">{year}</td>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                        const monthData = dataByYear[year]?.[month];
                        if (!monthData) {
                          return (
                            <td key={month} className="p-1">
                              <div className="h-10 w-full bg-gray-100 dark:bg-gray-800 rounded" />
                            </td>
                          );
                        }
                        const value = Number(monthData.returnPercent);
                        return (
                          <td key={month} className="p-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`h-10 w-full rounded flex items-center justify-center text-xs font-medium cursor-default ${getColor(value)}`}
                                >
                                  {value >= 0 ? "+" : ""}
                                  {value.toFixed(1)}%
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {MONTHS[month - 1]} {year}
                                </p>
                                <p className="font-medium">
                                  Return: {value >= 0 ? "+" : ""}
                                  {value.toFixed(2)}%
                                </p>
                                {monthData.trades && <p>Trades: {monthData.trades}</p>}
                              </TooltipContent>
                            </Tooltip>
                          </td>
                        );
                      })}
                      <td className="p-1">
                        <div
                          className={`h-10 w-full rounded flex items-center justify-center text-xs font-bold ${getColor(yearlyTotals[year])}`}
                        >
                          {yearlyTotals[year] >= 0 ? "+" : ""}
                          {yearlyTotals[year].toFixed(1)}%
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TooltipProvider>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg">
            <div className="text-center">
              <p>No monthly returns data</p>
              <p className="text-sm">Add monthly performance data to see the heatmap</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
