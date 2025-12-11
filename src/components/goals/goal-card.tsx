"use client"

import { useState } from "react"
import { Trash2, MoreVertical, Pause, Play, Target, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteGoal, updateGoal } from "@/app/goals/actions"
import { useRouter } from "next/navigation"
import { format, differenceInDays } from "date-fns"

interface GoalCardProps {
  goal: {
    id: string
    name: string
    description: string | null
    goalType: string
    targetValue: number
    currentValue: number
    startDate: string
    endDate: string
    status: string
    systemId: string | null
  }
  typeLabel: string
  unit: string
}

export function GoalCard({ goal, typeLabel, unit }: GoalCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Calculate progress percentage
  const progressPercent = goal.targetValue > 0 
    ? Math.min(100, (goal.currentValue / goal.targetValue) * 100)
    : 0

  // Calculate days remaining
  const daysRemaining = differenceInDays(new Date(goal.endDate), new Date())
  const totalDays = differenceInDays(new Date(goal.endDate), new Date(goal.startDate))
  const daysProgress = totalDays > 0 
    ? Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100)
    : 100

  // Status badge color
  const statusColor = {
    IN_PROGRESS: "bg-blue-500",
    ACHIEVED: "bg-green-500",
    FAILED: "bg-red-500",
    PAUSED: "bg-gray-500",
  }[goal.status] || "bg-gray-500"

  const handleDelete = async () => {
    setLoading(true)
    try {
      await deleteGoal(goal.id)
      router.refresh()
    } catch (error) {
      console.error("Failed to delete goal:", error)
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
    }
  }

  const handleTogglePause = async () => {
    setLoading(true)
    try {
      const newStatus = goal.status === "PAUSED" ? "IN_PROGRESS" : "PAUSED"
      await updateGoal(goal.id, { status: newStatus as any })
      router.refresh()
    } catch (error) {
      console.error("Failed to update goal:", error)
    } finally {
      setLoading(false)
    }
  }

  // Format values based on goal type
  const formatValue = (value: number) => {
    if (goal.goalType === "NET_PROFIT" || goal.goalType === "MONTHLY_RETURN") {
      return `${unit}${value.toLocaleString()}`
    }
    return `${value.toFixed(goal.goalType === "PROFIT_FACTOR" || goal.goalType === "RISK_REWARD" ? 2 : 0)}${unit}`
  }

  return (
    <>
      <Card className={goal.status === "ACHIEVED" ? "border-green-500/50" : goal.status === "FAILED" ? "border-red-500/50" : ""}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-4 w-4" />
                {goal.name}
              </CardTitle>
              <CardDescription>{typeLabel}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${statusColor} text-white`}>
                {goal.status.replace("_", " ")}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {goal.status !== "ACHIEVED" && goal.status !== "FAILED" && (
                    <DropdownMenuItem onClick={handleTogglePause}>
                      {goal.status === "PAUSED" ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </>
                      ) : (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {goal.description && (
            <p className="text-sm text-muted-foreground">{goal.description}</p>
          )}

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-medium">
                {formatValue(goal.currentValue)} / {formatValue(goal.targetValue)}
              </span>
            </div>
            <Progress 
              value={progressPercent} 
              className={`h-2 ${progressPercent >= 100 ? "[&>div]:bg-green-500" : ""}`}
            />
            <p className="text-xs text-muted-foreground text-right">
              {progressPercent.toFixed(0)}% complete
            </p>
          </div>

          {/* Time Period */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Time Period
              </span>
              <span className={`font-medium ${daysRemaining < 0 ? "text-red-500" : daysRemaining <= 7 ? "text-yellow-500" : ""}`}>
                {daysRemaining > 0 ? `${daysRemaining} days left` : daysRemaining === 0 ? "Due today" : "Overdue"}
              </span>
            </div>
            <Progress value={daysProgress} className="h-1" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{format(new Date(goal.startDate), "MMM d, yyyy")}</span>
              <span>{format(new Date(goal.endDate), "MMM d, yyyy")}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{goal.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading} className="bg-red-500 hover:bg-red-600">
              {loading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
