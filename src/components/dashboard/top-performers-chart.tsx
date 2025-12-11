"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from "recharts"

interface TopPerformer {
  id: string
  name: string
  avgWinRate: number
  avgProfitFactor: number
  backtestCount: number
}

interface TopPerformersChartProps {
  data: TopPerformer[]
}

export function TopPerformersChart({ data }: TopPerformersChartProps) {
  const chartData = data.map(system => ({
    name: system.name.length > 15 ? system.name.substring(0, 15) + '...' : system.name,
    fullName: system.name,
    winRate: system.avgWinRate,
    profitFactor: system.avgProfitFactor,
    backtestCount: system.backtestCount
  }))

  const getBarColor = (winRate: number) => {
    if (winRate >= 60) return "#22c55e" // green
    if (winRate >= 50) return "#3b82f6" // blue
    if (winRate >= 40) return "#f59e0b" // amber
    return "#ef4444" // red
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
        <XAxis 
          type="number" 
          domain={[0, 100]} 
          tickFormatter={(value) => `${value}%`}
        />
        <YAxis 
          type="category" 
          dataKey="name" 
          width={120}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload
              return (
                <div className="rounded-lg border bg-background p-3 shadow-lg">
                  <p className="font-medium">{data.fullName}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p>
                      Win Rate:{" "}
                      <span className={data.winRate >= 50 ? "text-green-500" : "text-red-500"}>
                        {data.winRate.toFixed(1)}%
                      </span>
                    </p>
                    <p>
                      Profit Factor:{" "}
                      <span className={data.profitFactor >= 1 ? "text-green-500" : "text-red-500"}>
                        {data.profitFactor.toFixed(2)}
                      </span>
                    </p>
                    <p className="text-muted-foreground">
                      {data.backtestCount} backtests
                    </p>
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Bar dataKey="winRate" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.winRate)} />
          ))}
          <LabelList 
            dataKey="winRate" 
            position="right" 
            formatter={(value) => `${Number(value).toFixed(1)}%`}
            className="text-xs fill-foreground"
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
