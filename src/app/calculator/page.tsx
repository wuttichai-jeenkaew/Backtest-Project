"use client"

import { useState } from "react"
import { Calculator, DollarSign, Target, TrendingUp, Percent, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Pip values for common pairs (per standard lot)
const pipValues: Record<string, number> = {
  "EUR/USD": 10,
  "GBP/USD": 10,
  "USD/JPY": 9.09,
  "USD/CHF": 10.75,
  "AUD/USD": 10,
  "NZD/USD": 10,
  "USD/CAD": 7.58,
  "XAU/USD": 10,
  "BTC/USD": 1,
  "Custom": 10,
}

export default function CalculatorPage() {
  // Position Size Calculator State
  const [accountBalance, setAccountBalance] = useState<string>("10000")
  const [riskPercent, setRiskPercent] = useState<string>("1")
  const [entryPrice, setEntryPrice] = useState<string>("")
  const [stopLoss, setStopLoss] = useState<string>("")
  const [takeProfit, setTakeProfit] = useState<string>("")
  const [pair, setPair] = useState<string>("EUR/USD")
  const [customPipValue, setCustomPipValue] = useState<string>("10")

  // Kelly Criterion State
  const [winRate, setWinRate] = useState<string>("55")
  const [avgWin, setAvgWin] = useState<string>("100")
  const [avgLoss, setAvgLoss] = useState<string>("50")

  // Compound Calculator State
  const [startingCapital, setStartingCapital] = useState<string>("10000")
  const [monthlyReturn, setMonthlyReturn] = useState<string>("5")
  const [months, setMonths] = useState<string>("12")

  // Calculate Position Size
  const calculatePositionSize = () => {
    const balance = parseFloat(accountBalance) || 0
    const risk = parseFloat(riskPercent) || 0
    const entry = parseFloat(entryPrice) || 0
    const sl = parseFloat(stopLoss) || 0

    if (balance <= 0 || risk <= 0 || entry <= 0 || sl <= 0) return null

    const riskAmount = balance * (risk / 100)
    const stopLossPips = Math.abs(entry - sl) * 10000 // Convert to pips
    const pipValue = pair === "Custom" ? parseFloat(customPipValue) : pipValues[pair]
    
    const lotSize = riskAmount / (stopLossPips * pipValue)
    const positionSize = riskAmount / Math.abs(entry - sl)

    return {
      riskAmount: riskAmount.toFixed(2),
      stopLossPips: stopLossPips.toFixed(1),
      lotSize: lotSize.toFixed(2),
      positionSize: positionSize.toFixed(0),
      miniLots: (lotSize * 10).toFixed(1),
      microLots: (lotSize * 100).toFixed(0),
    }
  }

  // Calculate Risk/Reward Ratio
  const calculateRiskReward = () => {
    const entry = parseFloat(entryPrice) || 0
    const sl = parseFloat(stopLoss) || 0
    const tp = parseFloat(takeProfit) || 0

    if (entry <= 0 || sl <= 0 || tp <= 0) return null

    const risk = Math.abs(entry - sl)
    const reward = Math.abs(tp - entry)
    const ratio = reward / risk

    return {
      risk: risk.toFixed(5),
      reward: reward.toFixed(5),
      ratio: ratio.toFixed(2),
      percentToWin: ((1 / (1 + ratio)) * 100).toFixed(1),
    }
  }

  // Calculate Kelly Criterion
  const calculateKelly = () => {
    const wr = parseFloat(winRate) / 100 || 0
    const avgW = parseFloat(avgWin) || 0
    const avgL = parseFloat(avgLoss) || 0

    if (wr <= 0 || avgW <= 0 || avgL <= 0) return null

    const payoffRatio = avgW / avgL
    const kelly = wr - ((1 - wr) / payoffRatio)
    const halfKelly = kelly / 2
    const quarterKelly = kelly / 4

    return {
      kelly: (kelly * 100).toFixed(2),
      halfKelly: (halfKelly * 100).toFixed(2),
      quarterKelly: (quarterKelly * 100).toFixed(2),
      payoffRatio: payoffRatio.toFixed(2),
      expectancy: ((wr * avgW) - ((1 - wr) * avgL)).toFixed(2),
    }
  }

  // Calculate Compound Growth
  const calculateCompound = () => {
    const capital = parseFloat(startingCapital) || 0
    const returnRate = parseFloat(monthlyReturn) / 100 || 0
    const period = parseInt(months) || 0

    if (capital <= 0 || returnRate <= 0 || period <= 0) return null

    const finalCapital = capital * Math.pow(1 + returnRate, period)
    const totalProfit = finalCapital - capital
    const totalReturnPercent = ((finalCapital - capital) / capital) * 100

    // Generate monthly breakdown
    const breakdown = []
    let currentCapital = capital
    for (let i = 1; i <= Math.min(period, 24); i++) {
      currentCapital *= (1 + returnRate)
      breakdown.push({
        month: i,
        capital: currentCapital.toFixed(2),
        profit: (currentCapital - capital).toFixed(2),
      })
    }

    return {
      finalCapital: finalCapital.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      totalReturnPercent: totalReturnPercent.toFixed(1),
      breakdown,
    }
  }

  const positionResult = calculatePositionSize()
  const rrResult = calculateRiskReward()
  const kellyResult = calculateKelly()
  const compoundResult = calculateCompound()

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Risk Calculator
          </h1>
          <p className="text-muted-foreground mt-1">
            คำนวณ Position Size, Risk/Reward และ Kelly Criterion
          </p>
        </div>

        <Tabs defaultValue="position" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="position">Position Size</TabsTrigger>
            <TabsTrigger value="rr">Risk/Reward</TabsTrigger>
            <TabsTrigger value="kelly">Kelly Criterion</TabsTrigger>
            <TabsTrigger value="compound">Compound</TabsTrigger>
          </TabsList>

          {/* Position Size Calculator */}
          <TabsContent value="position" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Position Size Calculator
                  </CardTitle>
                  <CardDescription>
                    คำนวณขนาด Position ที่เหมาะสมตาม Risk Management
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="balance">Account Balance ($)</Label>
                      <Input
                        id="balance"
                        type="number"
                        value={accountBalance}
                        onChange={(e) => setAccountBalance(e.target.value)}
                        placeholder="10000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="risk" className="flex items-center gap-1">
                        Risk per Trade (%)
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>แนะนำ 1-2% ต่อเทรด</p>
                          </TooltipContent>
                        </Tooltip>
                      </Label>
                      <Input
                        id="risk"
                        type="number"
                        value={riskPercent}
                        onChange={(e) => setRiskPercent(e.target.value)}
                        placeholder="1"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pair">Currency Pair</Label>
                    <Select value={pair} onValueChange={setPair}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pair" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(pipValues).map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {pair === "Custom" && (
                    <div className="space-y-2">
                      <Label htmlFor="customPip">Custom Pip Value ($)</Label>
                      <Input
                        id="customPip"
                        type="number"
                        value={customPipValue}
                        onChange={(e) => setCustomPipValue(e.target.value)}
                        placeholder="10"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="entry">Entry Price</Label>
                      <Input
                        id="entry"
                        type="number"
                        value={entryPrice}
                        onChange={(e) => setEntryPrice(e.target.value)}
                        placeholder="1.1000"
                        step="0.0001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sl">Stop Loss</Label>
                      <Input
                        id="sl"
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        placeholder="1.0950"
                        step="0.0001"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ผลลัพธ์</CardTitle>
                  <CardDescription>
                    Position Size ที่แนะนำ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {positionResult ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Risk Amount</p>
                          <p className="text-2xl font-bold text-red-500">
                            ${positionResult.riskAmount}
                          </p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Stop Loss</p>
                          <p className="text-2xl font-bold">
                            {positionResult.stopLossPips} pips
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
                        <p className="text-sm text-muted-foreground">Recommended Lot Size</p>
                        <p className="text-3xl font-bold text-primary">
                          {positionResult.lotSize} Lots
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Mini Lots (0.1)</p>
                          <p className="text-xl font-bold">{positionResult.miniLots}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Micro Lots (0.01)</p>
                          <p className="text-xl font-bold">{positionResult.microLots}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Position Size (Units)</p>
                        <p className="text-xl font-bold">{positionResult.positionSize}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                      กรุณากรอกข้อมูลให้ครบ
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risk/Reward Calculator */}
          <TabsContent value="rr" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Risk/Reward Calculator
                  </CardTitle>
                  <CardDescription>
                    คำนวณอัตราส่วน Risk/Reward
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rr-entry">Entry Price</Label>
                    <Input
                      id="rr-entry"
                      type="number"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      placeholder="1.1000"
                      step="0.0001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rr-sl">Stop Loss</Label>
                    <Input
                      id="rr-sl"
                      type="number"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      placeholder="1.0950"
                      step="0.0001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rr-tp">Take Profit</Label>
                    <Input
                      id="rr-tp"
                      type="number"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      placeholder="1.1100"
                      step="0.0001"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ผลลัพธ์</CardTitle>
                  <CardDescription>
                    Risk/Reward Ratio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rrResult ? (
                    <div className="space-y-4">
                      <div className="p-6 bg-primary/10 rounded-lg border-2 border-primary text-center">
                        <p className="text-sm text-muted-foreground">Risk : Reward</p>
                        <p className="text-4xl font-bold text-primary">
                          1 : {rrResult.ratio}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-red-500/10 rounded-lg">
                          <p className="text-sm text-muted-foreground">Risk</p>
                          <p className="text-xl font-bold text-red-500">
                            {rrResult.risk}
                          </p>
                        </div>
                        <div className="p-4 bg-green-500/10 rounded-lg">
                          <p className="text-sm text-muted-foreground">Reward</p>
                          <p className="text-xl font-bold text-green-500">
                            {rrResult.reward}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Minimum Win Rate Required (Breakeven)
                        </p>
                        <p className="text-xl font-bold">{rrResult.percentToWin}%</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          ต้องชนะอย่างน้อย {rrResult.percentToWin}% ถึงจะไม่ขาดทุน
                        </p>
                      </div>

                      {parseFloat(rrResult.ratio) >= 2 ? (
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-lg text-sm">
                          ✅ R:R ดี (≥ 1:2)
                        </div>
                      ) : parseFloat(rrResult.ratio) >= 1 ? (
                        <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-lg text-sm">
                          ⚠️ R:R พอใช้ได้ (1:1 - 1:2)
                        </div>
                      ) : (
                        <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">
                          ❌ R:R ต่ำ (&lt; 1:1) ไม่แนะนำ
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                      กรุณากรอก Entry, SL และ TP
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Kelly Criterion Calculator */}
          <TabsContent value="kelly" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Percent className="h-5 w-5" />
                    Kelly Criterion Calculator
                  </CardTitle>
                  <CardDescription>
                    คำนวณ Optimal Position Size ตามสูตร Kelly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="winrate" className="flex items-center gap-1">
                      Win Rate (%)
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-3 w-3 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>อัตราการชนะจากประวัติการเทรด</p>
                        </TooltipContent>
                      </Tooltip>
                    </Label>
                    <Input
                      id="winrate"
                      type="number"
                      value={winRate}
                      onChange={(e) => setWinRate(e.target.value)}
                      placeholder="55"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avgwin">Average Win ($)</Label>
                    <Input
                      id="avgwin"
                      type="number"
                      value={avgWin}
                      onChange={(e) => setAvgWin(e.target.value)}
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avgloss">Average Loss ($)</Label>
                    <Input
                      id="avgloss"
                      type="number"
                      value={avgLoss}
                      onChange={(e) => setAvgLoss(e.target.value)}
                      placeholder="50"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ผลลัพธ์</CardTitle>
                  <CardDescription>
                    Optimal Bet Size ตาม Kelly Formula
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {kellyResult ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">Full Kelly</p>
                        <p className="text-2xl font-bold">
                          {parseFloat(kellyResult.kelly) > 0 ? kellyResult.kelly : "0"}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ⚠️ Full Kelly มีความเสี่ยงสูง ไม่แนะนำใช้ตรงๆ
                        </p>
                      </div>

                      <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary">
                        <p className="text-sm text-muted-foreground">Half Kelly (แนะนำ)</p>
                        <p className="text-3xl font-bold text-primary">
                          {parseFloat(kellyResult.halfKelly) > 0 ? kellyResult.halfKelly : "0"}%
                        </p>
                      </div>

                      <div className="p-4 bg-green-500/10 rounded-lg">
                        <p className="text-sm text-muted-foreground">Quarter Kelly (Conservative)</p>
                        <p className="text-xl font-bold text-green-500">
                          {parseFloat(kellyResult.quarterKelly) > 0 ? kellyResult.quarterKelly : "0"}%
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Payoff Ratio</p>
                          <p className="text-xl font-bold">{kellyResult.payoffRatio}</p>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">Expectancy</p>
                          <p className="text-xl font-bold">${kellyResult.expectancy}</p>
                        </div>
                      </div>

                      {parseFloat(kellyResult.kelly) <= 0 && (
                        <div className="p-3 bg-red-500/10 text-red-500 rounded-lg text-sm">
                          ❌ Kelly ติดลบ = ระบบไม่มีค่า Expectancy ที่ดี ไม่ควรเทรด
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                      กรุณากรอกข้อมูลให้ครบ
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compound Calculator */}
          <TabsContent value="compound" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Compound Growth Calculator
                  </CardTitle>
                  <CardDescription>
                    คำนวณการเติบโตแบบทบต้น
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="capital">Starting Capital ($)</Label>
                    <Input
                      id="capital"
                      type="number"
                      value={startingCapital}
                      onChange={(e) => setStartingCapital(e.target.value)}
                      placeholder="10000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monthly">Monthly Return (%)</Label>
                    <Input
                      id="monthly"
                      type="number"
                      value={monthlyReturn}
                      onChange={(e) => setMonthlyReturn(e.target.value)}
                      placeholder="5"
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="months">Number of Months</Label>
                    <Input
                      id="months"
                      type="number"
                      value={months}
                      onChange={(e) => setMonths(e.target.value)}
                      placeholder="12"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ผลลัพธ์</CardTitle>
                  <CardDescription>
                    Projected Growth
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {compoundResult ? (
                    <div className="space-y-4">
                      <div className="p-6 bg-primary/10 rounded-lg border-2 border-primary text-center">
                        <p className="text-sm text-muted-foreground">Final Capital</p>
                        <p className="text-3xl font-bold text-primary">
                          ${parseFloat(compoundResult.finalCapital).toLocaleString()}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-500/10 rounded-lg">
                          <p className="text-sm text-muted-foreground">Total Profit</p>
                          <p className="text-xl font-bold text-green-500">
                            +${parseFloat(compoundResult.totalProfit).toLocaleString()}
                          </p>
                        </div>
                        <div className="p-4 bg-green-500/10 rounded-lg">
                          <p className="text-sm text-muted-foreground">Total Return</p>
                          <p className="text-xl font-bold text-green-500">
                            +{compoundResult.totalReturnPercent}%
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Monthly Breakdown</p>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {compoundResult.breakdown.map((item) => (
                            <div
                              key={item.month}
                              className="flex justify-between text-sm p-2 bg-muted/50 rounded"
                            >
                              <span>Month {item.month}</span>
                              <span className="font-medium">
                                ${parseFloat(item.capital).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-48 text-muted-foreground">
                      กรุณากรอกข้อมูลให้ครบ
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  )
}
