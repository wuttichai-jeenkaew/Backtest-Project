"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, BarChart3 } from "lucide-react"

interface StatsChartsProps {
  monthlyData: Array<{
    month: string
    count: number
    avgWinRate: number
    avgProfitFactor: number
  }>
  winRateDistribution: Array<{
    range: string
    count: number
  }>
  profitFactorDistribution: Array<{
    range: string
    count: number
  }>
  systemPerformance: Array<{
    id: string
    name: string
    avgWinRate: number
    avgProfitFactor: number
  } | null>
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6']

export function StatsCharts({
  monthlyData,
  winRateDistribution,
  profitFactorDistribution,
  systemPerformance
}: StatsChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Monthly Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Monthly Performance Trend
          </CardTitle>
          <CardDescription>แนวโน้มผลงานรายเดือน</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <p>Backtests: {payload[0]?.payload?.count}</p>
                            <p className="text-green-500">
                              Win Rate: {Number(payload[0]?.value).toFixed(1)}%
                            </p>
                            <p className="text-blue-500">
                              Profit Factor: {Number(payload[1]?.value).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgWinRate"
                  name="Win Rate %"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgProfitFactor"
                  name="Profit Factor"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              ไม่มีข้อมูลเพียงพอ
            </div>
          )}
        </CardContent>
      </Card>

      {/* Win Rate Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            Win Rate Distribution
          </CardTitle>
          <CardDescription>การกระจายของ Win Rate</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={winRateDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg">
                        <p className="font-medium">Win Rate: {label}%</p>
                        <p className="text-sm">{payload[0]?.value} backtests</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {winRateDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Profit Factor Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-500" />
            Profit Factor Distribution
          </CardTitle>
          <CardDescription>การกระจายของ Profit Factor</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitFactorDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-lg">
                        <p className="font-medium">PF: {label}</p>
                        <p className="text-sm">{payload[0]?.value} backtests</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {profitFactorDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* System Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            System Win Rate Comparison
          </CardTitle>
          <CardDescription>เปรียบเทียบ Win Rate แต่ละระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          {systemPerformance.filter(Boolean).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={systemPerformance.filter(Boolean).slice(0, 10)}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120} 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => v.length > 15 ? v.substring(0, 15) + '...' : v}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <div className="mt-2 space-y-1 text-sm">
                            <p className="text-green-500">
                              Win Rate: {data.avgWinRate.toFixed(1)}%
                            </p>
                            <p className="text-blue-500">
                              Profit Factor: {data.avgProfitFactor.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="avgWinRate" radius={[0, 4, 4, 0]}>
                  {systemPerformance.filter(Boolean).map((system, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={(system?.avgWinRate || 0) >= 50 ? '#22c55e' : '#ef4444'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              ไม่มีข้อมูลระบบ
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
