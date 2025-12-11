"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/layout/header";
import { getCalendarData, getWeeklyPL, getMonthlyPL, getYearlySummary, DailyPL, WeeklyPL, MonthlyPL } from "./actions";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, addMonths, subMonths } from "date-fns";
import { th } from "date-fns/locale";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dailyData, setDailyData] = useState<DailyPL[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyPL[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyPL[]>([]);
  const [yearlySummary, setYearlySummary] = useState<{ year: number; profit: number; loss: number; netPL: number; trades: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [calendarResult, weeklyResult, monthlyResult, yearlyResult] = await Promise.all([
        getCalendarData(year, month),
        getWeeklyPL(year, month),
        getMonthlyPL(year),
        getYearlySummary(),
      ]);

      if (calendarResult.success && calendarResult.data) {
        setDailyData(calendarResult.data);
      }
      if (weeklyResult.success && weeklyResult.data) {
        setWeeklyData(weeklyResult.data);
      }
      if (monthlyResult.success && monthlyResult.data) {
        setMonthlyData(monthlyResult.data);
      }
      if (yearlyResult.success && yearlyResult.data) {
        setYearlySummary(yearlyResult.data);
      }
    } catch (error) {
      console.error("Failed to load calendar data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Pad start of calendar with empty days
  const startPadding = getDay(monthStart);
  const paddedDays = [...Array(startPadding === 0 ? 6 : startPadding - 1).fill(null), ...calendarDays];

  // Get daily P/L for a specific date
  const getDayPL = (date: Date): DailyPL | undefined => {
    const dateKey = format(date, "yyyy-MM-dd");
    return dailyData.find((d) => d.date === dateKey);
  };

  // Calculate summary for current month
  const monthSummary = {
    totalProfit: dailyData.reduce((sum, d) => sum + d.profit, 0),
    totalLoss: dailyData.reduce((sum, d) => sum + d.loss, 0),
    netPL: dailyData.reduce((sum, d) => sum + d.netPL, 0),
    totalTrades: dailyData.reduce((sum, d) => sum + d.trades, 0),
    tradingDays: dailyData.length,
    winningDays: dailyData.filter((d) => d.netPL > 0).length,
    losingDays: dailyData.filter((d) => d.netPL < 0).length,
  };

  return (
    <>
      <Header title="Trading Calendar" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" />
            <h2 className="text-2xl font-bold">
              {format(currentDate, "MMMM yyyy", { locale: th })}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday}>
              วันนี้
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net P/L</CardTitle>
              {monthSummary.netPL >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${monthSummary.netPL >= 0 ? "text-green-500" : "text-red-500"}`}>
                {monthSummary.netPL >= 0 ? "+" : ""}{monthSummary.netPL.toLocaleString()} $
              </div>
              <p className="text-xs text-muted-foreground">
                Profit: ${monthSummary.totalProfit.toLocaleString()} | Loss: ${monthSummary.totalLoss.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthSummary.totalTrades}</div>
              <p className="text-xs text-muted-foreground">
                {monthSummary.tradingDays} วันที่มีการเทรด
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Winning Days</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{monthSummary.winningDays}</div>
              <p className="text-xs text-muted-foreground">
                {monthSummary.tradingDays > 0 
                  ? ((monthSummary.winningDays / monthSummary.tradingDays) * 100).toFixed(1) 
                  : 0}% Win Rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Losing Days</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{monthSummary.losingDays}</div>
              <p className="text-xs text-muted-foreground">
                {monthSummary.tradingDays > 0 
                  ? ((monthSummary.losingDays / monthSummary.tradingDays) * 100).toFixed(1) 
                  : 0}% Loss Rate
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
          </TabsList>

          {/* Calendar View */}
          <TabsContent value="calendar" className="space-y-4">
            <Card>
              <CardContent className="p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-muted-foreground">กำลังโหลด...</div>
                  </div>
                ) : (
                  <>
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส.", "อา."].map((day) => (
                        <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {paddedDays.map((day, index) => {
                        if (!day) {
                          return <div key={`empty-${index}`} className="h-24 bg-muted/20 rounded-lg" />;
                        }

                        const dayPL = getDayPL(day);
                        const isCurrentDay = isToday(day);

                        return (
                          <div
                            key={day.toString()}
                            className={`h-24 p-2 rounded-lg border transition-colors ${
                              isCurrentDay 
                                ? "border-primary bg-primary/5" 
                                : "border-transparent hover:border-muted-foreground/20"
                            } ${
                              dayPL 
                                ? dayPL.netPL > 0 
                                  ? "bg-green-500/10" 
                                  : dayPL.netPL < 0 
                                    ? "bg-red-500/10" 
                                    : "bg-muted/20"
                                : "bg-muted/20"
                            }`}
                          >
                            <div className={`text-sm font-medium ${isCurrentDay ? "text-primary" : ""}`}>
                              {format(day, "d")}
                            </div>
                            {dayPL && (
                              <div className="mt-1">
                                <div className={`text-xs font-semibold ${
                                  dayPL.netPL > 0 ? "text-green-500" : dayPL.netPL < 0 ? "text-red-500" : ""
                                }`}>
                                  {dayPL.netPL > 0 ? "+" : ""}{dayPL.netPL.toFixed(0)}$
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {dayPL.trades} trades
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly View */}
          <TabsContent value="weekly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>สรุปรายสัปดาห์</CardTitle>
                <CardDescription>P/L แต่ละสัปดาห์ในเดือน {format(currentDate, "MMMM yyyy", { locale: th })}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-muted-foreground">กำลังโหลด...</div>
                  </div>
                ) : weeklyData.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    ไม่มีข้อมูลในเดือนนี้
                  </div>
                ) : (
                  <div className="space-y-3">
                    {weeklyData.map((week, index) => (
                      <div
                        key={week.weekStart}
                        className={`flex items-center justify-between p-4 rounded-lg ${
                          week.netPL > 0 ? "bg-green-500/10" : week.netPL < 0 ? "bg-red-500/10" : "bg-muted/20"
                        }`}
                      >
                        <div>
                          <div className="font-medium">สัปดาห์ที่ {index + 1}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(week.weekStart), "d MMM", { locale: th })} - {format(new Date(week.weekEnd), "d MMM", { locale: th })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            week.netPL > 0 ? "text-green-500" : week.netPL < 0 ? "text-red-500" : ""
                          }`}>
                            {week.netPL > 0 ? "+" : ""}{week.netPL.toLocaleString()}$
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {week.trades} trades | WR: {week.winRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monthly View */}
          <TabsContent value="monthly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>สรุปรายเดือน</CardTitle>
                <CardDescription>P/L แต่ละเดือนในปี {year}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-muted-foreground">กำลังโหลด...</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {monthlyData.map((m) => (
                      <div
                        key={m.month}
                        className={`p-4 rounded-lg text-center ${
                          m.netPL > 0 ? "bg-green-500/10" : m.netPL < 0 ? "bg-red-500/10" : "bg-muted/20"
                        }`}
                      >
                        <div className="text-sm font-medium">{m.month}</div>
                        <div className={`text-lg font-bold ${
                          m.netPL > 0 ? "text-green-500" : m.netPL < 0 ? "text-red-500" : ""
                        }`}>
                          {m.trades > 0 ? (
                            <>{m.netPL > 0 ? "+" : ""}{m.netPL.toLocaleString()}$</>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {m.trades > 0 ? `${m.trades} trades` : "ไม่มีข้อมูล"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Yearly View */}
          <TabsContent value="yearly" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>สรุปรายปี</CardTitle>
                <CardDescription>เปรียบเทียบผลงานแต่ละปี</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="text-muted-foreground">กำลังโหลด...</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {yearlySummary.map((y) => (
                      <div
                        key={y.year}
                        className={`flex items-center justify-between p-6 rounded-lg ${
                          y.netPL > 0 ? "bg-green-500/10" : y.netPL < 0 ? "bg-red-500/10" : "bg-muted/20"
                        }`}
                      >
                        <div>
                          <div className="text-2xl font-bold">{y.year}</div>
                          <div className="text-sm text-muted-foreground">
                            {y.trades} trades
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            y.netPL > 0 ? "text-green-500" : y.netPL < 0 ? "text-red-500" : ""
                          }`}>
                            {y.trades > 0 ? (
                              <>{y.netPL > 0 ? "+" : ""}{y.netPL.toLocaleString()}$</>
                            ) : (
                              <span className="text-muted-foreground">ไม่มีข้อมูล</span>
                            )}
                          </div>
                          {y.trades > 0 && (
                            <div className="text-sm text-muted-foreground">
                              Profit: ${y.profit.toLocaleString()} | Loss: ${y.loss.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
