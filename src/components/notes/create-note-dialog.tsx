"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
import { Plus, StickyNote, Lightbulb, AlertTriangle, Trophy, Wrench, BookOpen } from "lucide-react"
import { createNote } from "@/app/notes/actions"

const noteTypes = [
  { value: "GENERAL", label: "ทั่วไป", icon: StickyNote },
  { value: "LESSON", label: "บทเรียน", icon: BookOpen },
  { value: "IDEA", label: "ไอเดีย", icon: Lightbulb },
  { value: "IMPROVEMENT", label: "ปรับปรุง", icon: Wrench },
  { value: "WARNING", label: "คำเตือน", icon: AlertTriangle },
  { value: "MILESTONE", label: "Milestone", icon: Trophy },
]

const colors = [
  { value: "", label: "ไม่มีสี" },
  { value: "#ef4444", label: "แดง" },
  { value: "#f97316", label: "ส้ม" },
  { value: "#eab308", label: "เหลือง" },
  { value: "#22c55e", label: "เขียว" },
  { value: "#3b82f6", label: "น้ำเงิน" },
  { value: "#8b5cf6", label: "ม่วง" },
]

interface CreateNoteDialogProps {
  systems: Array<{ id: string; name: string }>
  backtests: Array<{ 
    id: string
    name: string | null
    symbol: string
    tradingSystem: { name: string }
  }>
  defaultSystemId?: string
  defaultBacktestId?: string
}

export function CreateNoteDialog({ 
  systems, 
  backtests, 
  defaultSystemId, 
  defaultBacktestId 
}: CreateNoteDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    noteType: "GENERAL",
    systemId: defaultSystemId || "",
    backtestId: defaultBacktestId || "",
    color: "",
    isPinned: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const result = await createNote({
      title: formData.title || undefined,
      content: formData.content,
      noteType: formData.noteType as "GENERAL" | "LESSON" | "IDEA" | "IMPROVEMENT" | "WARNING" | "MILESTONE",
      systemId: formData.systemId || undefined,
      backtestId: formData.backtestId || undefined,
      color: formData.color || undefined,
      isPinned: formData.isPinned
    })

    setIsSubmitting(false)

    if (result.success) {
      setOpen(false)
      setFormData({
        title: "",
        content: "",
        noteType: "GENERAL",
        systemId: defaultSystemId || "",
        backtestId: defaultBacktestId || "",
        color: "",
        isPinned: false
      })
      router.refresh()
    } else {
      setError(result.error || "เกิดข้อผิดพลาด")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          สร้าง Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>สร้าง Note ใหม่</DialogTitle>
            <DialogDescription>
              บันทึก Lessons, Ideas หรือข้อคิดที่ได้จากการเทรด
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
                {error}
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">หัวข้อ (ไม่บังคับ)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="หัวข้อของ Note"
              />
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">เนื้อหา *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="เขียนสิ่งที่ต้องการบันทึก..."
                rows={4}
                required
              />
            </div>

            {/* Type and Color */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ประเภท</Label>
                <Select
                  value={formData.noteType}
                  onValueChange={(value) => setFormData({ ...formData, noteType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {noteTypes.map((type) => {
                      const Icon = type.icon
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>สี</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสี" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.value || "none"} value={color.value || "none"}>
                        <div className="flex items-center gap-2">
                          {color.value && (
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: color.value }}
                            />
                          )}
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* System and Backtest */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>เชื่อมกับระบบ</Label>
                <Select
                  value={formData.systemId}
                  onValueChange={(value) => setFormData({ ...formData, systemId: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกระบบ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่เชื่อม</SelectItem>
                    {systems.map((system) => (
                      <SelectItem key={system.id} value={system.id}>
                        {system.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>เชื่อมกับ Backtest</Label>
                <Select
                  value={formData.backtestId}
                  onValueChange={(value) => setFormData({ ...formData, backtestId: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือก Backtest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่เชื่อม</SelectItem>
                    {backtests.map((bt) => (
                      <SelectItem key={bt.id} value={bt.id}>
                        {bt.name || bt.symbol} ({bt.tradingSystem.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : "สร้าง Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
