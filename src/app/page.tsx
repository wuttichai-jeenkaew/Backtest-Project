import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Target,
  Award,
  Clock,
  ArrowUpRight,
  BookOpen,
  LineChart,
  FlaskConical,
  Layers
} from "lucide-react"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { TopPerformersChart } from "@/components/dashboard/top-performers-chart"

interface SystemStats {
  id: string
  name: string
  avgWinRate: number
  avgProfitFactor: number
  totalTrades: number
  backtestCount: number
}

interface RecentActivityItem {
  type: 'backtest' | 'journal'
  title: string
  description: string
  date: Date
  systemName: string
  link: string
  icon: 'backtest' | 'journal'
  status: 'positive' | 'negative' | 'neutral'
}

async function getDashboardData() {
  const [systems, backtests, journalEntries] = await Promise.all([
    prisma.tradingSystem.findMany({
      include: {
        _count: {
          select: { backtests: true }
        },
        backtests: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    }),
    prisma.backtestResult.findMany({
      include: {
        tradingSystem: true
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.tradeJournalEntry.findMany({
      include: {
        system: true
      },
      orderBy: { entryDate: 'desc' },
      take: 10
    })
  ])

  // Calculate overall statistics
  const totalSystems = systems.length
  const totalBacktests = backtests.length
  const totalJournalEntries = journalEntries.length
  
  // Average win rate across all backtests
  const avgWinRate = backtests.length > 0
    ? backtests.reduce((sum, b) => sum + Number(b.winRate || 0), 0) / backtests.length
    : 0
  
  // Average profit factor
  const avgProfitFactor = backtests.length > 0
    ? backtests.reduce((sum, b) => sum + Number(b.profitFactor || 0), 0) / backtests.length
    : 0

  // Best performing system by win rate
  const systemStats: SystemStats[] = systems.map((system) => {
    const systemBacktests = backtests.filter((b) => b.tradingSystemId === system.id)
    if (systemBacktests.length === 0) {
      return { 
        id: system.id,
        name: system.name,
        avgWinRate: 0, 
        avgProfitFactor: 0, 
        totalTrades: 0, 
        backtestCount: 0 
      }
    }
    
    const avgWinRate = systemBacktests.reduce((sum, b) => sum + Number(b.winRate || 0), 0) / systemBacktests.length
    const avgProfitFactor = systemBacktests.reduce((sum, b) => sum + Number(b.profitFactor || 0), 0) / systemBacktests.length
    const totalTrades = systemBacktests.reduce((sum, b) => sum + b.totalTrades, 0)
    
    return { 
      id: system.id,
      name: system.name,
      avgWinRate, 
      avgProfitFactor, 
      totalTrades, 
      backtestCount: systemBacktests.length 
    }
  }).sort((a, b) => b.avgWinRate - a.avgWinRate)

  // Top 5 performers
  const topPerformers = systemStats.filter((s) => s.backtestCount > 0).slice(0, 5)

  // Recent backtests
  const recentBacktests = backtests.slice(0, 5)

  // Monthly performance data for chart
  const monthlyData = getMonthlyPerformance(backtests)

  // Recent activity (combined)
  const recentActivity = getRecentActivity(backtests, journalEntries)

  return {
    totalSystems,
    totalBacktests,
    totalJournalEntries,
    avgWinRate,
    avgProfitFactor,
    topPerformers,
    recentBacktests,
    monthlyData,
    systemStats,
    recentActivity
  }
}

function getMonthlyPerformance(backtests: Awaited<ReturnType<typeof prisma.backtestResult.findMany>>) {
  const months: Record<string, { month: string, winRate: number, profitFactor: number, count: number }> = {}
  
  backtests.forEach(backtest => {
    const date = new Date(backtest.createdAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const monthName = date.toLocaleDateString('th-TH', { month: 'short', year: '2-digit' })
    
    if (!months[monthKey]) {
      months[monthKey] = { month: monthName, winRate: 0, profitFactor: 0, count: 0 }
    }
    
    months[monthKey].winRate += Number(backtest.winRate || 0)
    months[monthKey].profitFactor += Number(backtest.profitFactor || 0)
    months[monthKey].count++
  })

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([, data]) => ({
      month: data.month,
      winRate: data.winRate / data.count,
      profitFactor: data.profitFactor / data.count
    }))
}

type BacktestWithSystem = Awaited<ReturnType<typeof prisma.backtestResult.findMany>>[number] & {
  tradingSystem: { name: string }
}

type JournalWithSystem = Awaited<ReturnType<typeof prisma.tradeJournalEntry.findMany>>[number] & {
  system: { name: string } | null
}

function getRecentActivity(
  backtests: BacktestWithSystem[], 
  journalEntries: JournalWithSystem[]
): RecentActivityItem[] {
  const activities: RecentActivityItem[] = []

  // Add recent backtests
  backtests.slice(0, 5).forEach(backtest => {
    const winRate = Number(backtest.winRate || 0)
    const profitFactor = Number(backtest.profitFactor || 0)
    
    activities.push({
      type: 'backtest',
      title: `Backtest: ${backtest.name || backtest.symbol}`,
      description: `Win Rate: ${winRate.toFixed(1)}% | PF: ${profitFactor.toFixed(2)}`,
      date: new Date(backtest.createdAt),
      systemName: backtest.tradingSystem.name,
      link: `/backtests/${backtest.id}`,
      icon: 'backtest',
      status: winRate >= 50 ? 'positive' : 'negative'
    })
  })

  // Add recent journal entries
  journalEntries.forEach(entry => {
    const pnl = Number(entry.pnl || 0)
    
    activities.push({
      type: 'journal',
      title: `Journal: ${entry.direction} ${entry.symbol}`,
      description: `P&L: ${pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}`,
      date: new Date(entry.entryDate),
      systemName: entry.system?.name || 'Unknown',
      link: `/journal/${entry.id}`,
      icon: 'journal',
      status: pnl >= 0 ? 'positive' : 'negative'
    })
  })

  // Sort by date and take top 10
  return activities.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 10)
}

export default async function Home() {
  const data = await getDashboardData()

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            ภาพรวมระบบเทรดและผลการ Backtest
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/systems/new">
            <Button>
              <Layers className="mr-2 h-4 w-4" />
              สร้างระบบใหม่
            </Button>
          </Link>
          <Link href="/backtests/new">
            <Button variant="outline">
              <FlaskConical className="mr-2 h-4 w-4" />
              เพิ่ม Backtest
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ระบบทั้งหมด</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSystems}</div>
            <p className="text-xs text-muted-foreground">
              Trading Systems
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Backtests</CardTitle>
            <FlaskConical className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalBacktests}</div>
            <p className="text-xs text-muted-foreground">
              การทดสอบทั้งหมด
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalJournalEntries}</div>
            <p className="text-xs text-muted-foreground">
              บันทึกการเทรด
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgWinRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              เฉลี่ยทุกระบบ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Profit Factor</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgProfitFactor.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              เฉลี่ยทุกระบบ
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers & Performance Chart */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
            <CardDescription>ระบบที่มีผลงานดีที่สุด (เรียงตาม Win Rate)</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topPerformers.length > 0 ? (
              <TopPerformersChart data={data.topPerformers} />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                ยังไม่มีข้อมูล Backtest
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-500" />
              Performance Trend
            </CardTitle>
            <CardDescription>แนวโน้มผลงานรายเดือน</CardDescription>
          </CardHeader>
          <CardContent>
            {data.monthlyData.length > 0 ? (
              <PerformanceChart data={data.monthlyData} />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                ยังไม่มีข้อมูลเพียงพอสำหรับแสดงกราฟ
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Performance Summary & Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* System Performance Summary */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              System Performance Summary
            </CardTitle>
            <CardDescription>สรุปผลงานแต่ละระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.systemStats.slice(0, 6).map((system) => (
                <Link
                  key={system.id}
                  href={`/systems/${system.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{system.name}</h4>
                        {system.avgWinRate >= 55 && (
                          <Badge variant="default" className="bg-green-500">
                            <TrendingUp className="mr-1 h-3 w-3" />
                            High WR
                          </Badge>
                        )}
                        {system.avgProfitFactor >= 1.5 && (
                          <Badge variant="default" className="bg-blue-500">
                            <Award className="mr-1 h-3 w-3" />
                            High PF
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {system.backtestCount} backtests | {system.totalTrades} trades
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <p className="text-sm text-muted-foreground">Win Rate</p>
                        <p className={`font-medium ${system.avgWinRate >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                          {system.avgWinRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Profit Factor</p>
                        <p className={`font-medium ${system.avgProfitFactor >= 1 ? 'text-green-500' : 'text-red-500'}`}>
                          {system.avgProfitFactor.toFixed(2)}
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
              {data.systemStats.length === 0 && (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  ยังไม่มีระบบเทรด
                </div>
              )}
            </div>
            {data.systemStats.length > 6 && (
              <div className="mt-4 text-center">
                <Link href="/systems">
                  <Button variant="outline" size="sm">
                    ดูทั้งหมด ({data.systemStats.length} ระบบ)
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>กิจกรรมล่าสุด</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.map((activity, index) => (
                <Link
                  key={`${activity.type}-${index}`}
                  href={activity.link}
                  className="block"
                >
                  <div className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                    <div className={`mt-1 rounded-full p-1.5 ${
                      activity.icon === 'backtest' 
                        ? 'bg-blue-100 dark:bg-blue-900' 
                        : 'bg-purple-100 dark:bg-purple-900'
                    }`}>
                      {activity.icon === 'backtest' ? (
                        <FlaskConical className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <BookOpen className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{activity.systemName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium ${
                          activity.status === 'positive' 
                            ? 'text-green-500' 
                            : activity.status === 'negative' 
                              ? 'text-red-500' 
                              : 'text-muted-foreground'
                        }`}>
                          {activity.status === 'positive' && <TrendingUp className="inline mr-1 h-3 w-3" />}
                          {activity.status === 'negative' && <TrendingDown className="inline mr-1 h-3 w-3" />}
                          {activity.description}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.date.toLocaleDateString('th-TH', { 
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {data.recentActivity.length === 0 && (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  ยังไม่มีกิจกรรม
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Backtests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                Recent Backtests
              </CardTitle>
              <CardDescription>การทดสอบล่าสุด</CardDescription>
            </div>
            <Link href="/backtests">
              <Button variant="outline" size="sm">ดูทั้งหมด</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">ชื่อ</th>
                  <th className="pb-3 font-medium">ระบบ</th>
                  <th className="pb-3 font-medium text-right">Total Trades</th>
                  <th className="pb-3 font-medium text-right">Win Rate</th>
                  <th className="pb-3 font-medium text-right">Profit Factor</th>
                  <th className="pb-3 font-medium text-right">Max DD</th>
                  <th className="pb-3 font-medium text-right">วันที่</th>
                </tr>
              </thead>
              <tbody>
                {data.recentBacktests.map((backtest) => {
                  const winRate = Number(backtest.winRate || 0)
                  const profitFactor = Number(backtest.profitFactor || 0)
                  const maxDrawdown = Number(backtest.maxDrawdown || 0)
                  
                  return (
                    <tr key={backtest.id} className="border-b last:border-0">
                      <td className="py-3">
                        <Link 
                          href={`/backtests/${backtest.id}`}
                          className="font-medium hover:underline"
                        >
                          {backtest.name || backtest.symbol}
                        </Link>
                      </td>
                      <td className="py-3">
                        <Badge variant="outline">{backtest.tradingSystem.name}</Badge>
                      </td>
                      <td className="py-3 text-right">{backtest.totalTrades}</td>
                      <td className="py-3 text-right">
                        <span className={winRate >= 50 ? 'text-green-500' : 'text-red-500'}>
                          {winRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <span className={profitFactor >= 1 ? 'text-green-500' : 'text-red-500'}>
                          {profitFactor.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 text-right text-red-500">
                        {maxDrawdown.toFixed(1)}%
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {new Date(backtest.createdAt).toLocaleDateString('th-TH')}
                      </td>
                    </tr>
                  )
                })}
                {data.recentBacktests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      ยังไม่มี Backtest
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/systems">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
                <Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium">Trading Systems</h3>
                <p className="text-sm text-muted-foreground">จัดการระบบเทรด</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/backtests">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <FlaskConical className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-medium">Backtests</h3>
                <p className="text-sm text-muted-foreground">ดูผล Backtest</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/journal">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900">
                <BookOpen className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium">Trade Journal</h3>
                <p className="text-sm text-muted-foreground">บันทึกการเทรด</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/compare">
          <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-medium">Compare</h3>
                <p className="text-sm text-muted-foreground">เปรียบเทียบผลงาน</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
