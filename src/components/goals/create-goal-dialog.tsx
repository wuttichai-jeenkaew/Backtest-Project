"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createGoal } from "@/app/goals/actions"
import { useRouter } from "next/navigation"

const goalTypes = [
  { value: "WIN_RATE", label: "Win Rate (%)", placeholder: "60" },
  { value: "PROFIT_FACTOR", label: "Profit Factor", placeholder: "1.5" },
  { value: "TOTAL_TRADES", label: "Total Trades", placeholder: "100" },
  { value: "NET_PROFIT", label: "Net Profit ($)", placeholder: "5000" },
  { value: "MAX_DRAWDOWN", label: "Max Drawdown (%)", placeholder: "10" },
  { value: "MONTHLY_RETURN", label: "Monthly Return (%)", placeholder: "5" },
  { value: "CONSECUTIVE_WINS", label: "Consecutive Wins", placeholder: "5" },
  { value: "RISK_REWARD", label: "Risk/Reward Ratio", placeholder: "2" },
]

interface CreateGoalDialogProps {
  systems: { id: string; name: string }[]
}

export function CreateGoalDialog({ systems }: CreateGoalDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [goalType, setGoalType] = useState("")
  const [targetValue, setTargetValue] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [systemId, setSystemId] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !goalType || !targetValue || !startDate || !endDate) return

    setLoading(true)
    try {
      await createGoal({
        name,
        description: description || undefined,
        goalType: goalType as any,
        targetValue: parseFloat(targetValue),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        systemId: systemId === "all" ? undefined : systemId || undefined,
      })
      setOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      console.error("Failed to create goal:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setGoalType("")
    setTargetValue("")
    setStartDate("")
    setEndDate("")
    setSystemId("")
  }

  const selectedGoalType = goalTypes.find(g => g.value === goalType)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
            <DialogDescription>
              ตั้งเป้าหมายใหม่เพื่อติดตามความคืบหน้า
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Q1 2024 Win Rate Target"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="รายละเอียดเพิ่มเติม..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goalType">Goal Type *</Label>
                <Select value={goalType} onValueChange={setGoalType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {goalTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetValue">Target Value *</Label>
                <Input
                  id="targetValue"
                  type="number"
                  step="0.01"
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  placeholder={selectedGoalType?.placeholder || "0"}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="system">Link to System (Optional)</Label>
              <Select value={systemId} onValueChange={setSystemId}>
                <SelectTrigger>
                  <SelectValue placeholder="All systems" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All systems</SelectItem>
                  {systems.map((system) => (
                    <SelectItem key={system.id} value={system.id}>
                      {system.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
