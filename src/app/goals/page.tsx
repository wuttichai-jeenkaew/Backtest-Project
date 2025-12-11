import { prisma } from "@/lib/prisma"
import { Target } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { CreateGoalDialog } from "@/components/goals/create-goal-dialog"
import { GoalCard } from "@/components/goals/goal-card"
import { RefreshGoalsButton } from "@/components/goals/refresh-goals-button"

export const dynamic = "force-dynamic"

// Goal type labels in Thai
const goalTypeLabels: Record<string, string> = {
  WIN_RATE: "Win Rate",
  PROFIT_FACTOR: "Profit Factor",
  TOTAL_TRADES: "จำนวน Trades",
  NET_PROFIT: "Net Profit",
  MAX_DRAWDOWN: "Max Drawdown",
  MONTHLY_RETURN: "Monthly Return",
  CONSECUTIVE_WINS: "Consecutive Wins",
  RISK_REWARD: "Risk/Reward Ratio",
}

// Goal type units
const goalTypeUnits: Record<string, string> = {
  WIN_RATE: "%",
  PROFIT_FACTOR: "",
  TOTAL_TRADES: " trades",
  NET_PROFIT: "$",
  MAX_DRAWDOWN: "%",
  MONTHLY_RETURN: "%",
  CONSECUTIVE_WINS: " wins",
  RISK_REWARD: "",
}

// Helper function to serialize goal for client component
function serializeGoal(goal: any) {
  return {
    id: goal.id,
    name: goal.name,
    description: goal.description,
    goalType: goal.goalType,
    targetValue: Number(goal.targetValue),
    currentValue: Number(goal.currentValue),
    startDate: goal.startDate.toISOString(),
    endDate: goal.endDate.toISOString(),
    status: goal.status,
    systemId: goal.systemId,
  }
}

export default async function GoalsPage() {
  const goals = await prisma.performanceGoal.findMany({
    orderBy: [
      { status: "asc" },
      { endDate: "asc" },
    ],
  })
  
  const systems = await prisma.tradingSystem.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })
  
  // Serialize goals for client components
  const serializedGoals = goals.map(serializeGoal)
  
  // Group goals by status
  const inProgressGoals = serializedGoals.filter(g => g.status === "IN_PROGRESS")
  const achievedGoals = serializedGoals.filter(g => g.status === "ACHIEVED")
  const failedGoals = serializedGoals.filter(g => g.status === "FAILED")
  const pausedGoals = serializedGoals.filter(g => g.status === "PAUSED")
  
  // Calculate stats
  const totalGoals = goals.length
  const completionRate = totalGoals > 0 
    ? ((achievedGoals.length / totalGoals) * 100).toFixed(0) 
    : "0"
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8" />
            Performance Goals
          </h1>
          <p className="text-muted-foreground mt-1">
            ตั้งเป้าหมายและติดตามความคืบหน้า
          </p>
        </div>
        <div className="flex gap-2">
          <RefreshGoalsButton />
          <CreateGoalDialog systems={systems} />
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Goals</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalGoals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>In Progress</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-500">{inProgressGoals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Achieved</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{achievedGoals.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completion Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{completionRate}%</p>
          </CardContent>
        </Card>
      </div>
      
      {/* In Progress Goals */}
      {inProgressGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-blue-500"></span>
            In Progress ({inProgressGoals.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inProgressGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                typeLabel={goalTypeLabels[goal.goalType] || goal.goalType}
                unit={goalTypeUnits[goal.goalType] || ""}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Achieved Goals */}
      {achievedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500"></span>
            Achieved ({achievedGoals.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                typeLabel={goalTypeLabels[goal.goalType] || goal.goalType}
                unit={goalTypeUnits[goal.goalType] || ""}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Failed Goals */}
      {failedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500"></span>
            Failed ({failedGoals.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {failedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                typeLabel={goalTypeLabels[goal.goalType] || goal.goalType}
                unit={goalTypeUnits[goal.goalType] || ""}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Paused Goals */}
      {pausedGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-gray-500"></span>
            Paused ({pausedGoals.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pausedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                typeLabel={goalTypeLabels[goal.goalType] || goal.goalType}
                unit={goalTypeUnits[goal.goalType] || ""}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {goals.length === 0 && (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <Target className="h-16 w-16 mx-auto text-muted-foreground" />
            <div>
              <h3 className="text-lg font-semibold">ยังไม่มีเป้าหมาย</h3>
              <p className="text-muted-foreground">
                สร้างเป้าหมายแรกเพื่อติดตามความคืบหน้าในการเทรด
              </p>
            </div>
            <CreateGoalDialog systems={systems} />
          </div>
        </Card>
      )}
    </div>
  )
}
