"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { createTemplate, updateTemplate } from "@/app/templates/actions"

interface System {
  id: string
  name: string
}

interface TemplateFormProps {
  systems: System[]
  template?: {
    id: string
    name: string
    description: string | null
    symbol: string | null
    startingCapital: number | null
    dataSource: string | null
    commission: number | null
    slippage: number | null
    systemId: string | null
  }
}

export function TemplateForm({ systems, template }: TemplateFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    symbol: template?.symbol || "",
    startingCapital: template?.startingCapital?.toString() || "",
    dataSource: template?.dataSource || "",
    commission: template?.commission?.toString() || "",
    slippage: template?.slippage?.toString() || "",
    systemId: template?.systemId || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const data = {
      name: formData.name,
      description: formData.description || undefined,
      symbol: formData.symbol || undefined,
      startingCapital: formData.startingCapital ? parseFloat(formData.startingCapital) : undefined,
      dataSource: formData.dataSource || undefined,
      commission: formData.commission ? parseFloat(formData.commission) : undefined,
      slippage: formData.slippage ? parseFloat(formData.slippage) : undefined,
      systemId: formData.systemId || undefined
    }

    const result = template
      ? await updateTemplate(template.id, data)
      : await createTemplate(data)

    setIsSubmitting(false)

    if (result.success) {
      router.push("/templates")
      router.refresh()
    } else {
      setError(result.error || "เกิดข้อผิดพลาด")
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/templates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {template ? "แก้ไข Template" : "สร้าง Template ใหม่"}
          </h1>
          <p className="text-muted-foreground">
            {template ? "แก้ไขค่า default สำหรับ Template นี้" : "สร้าง Template เพื่อใช้เป็นค่าเริ่มต้นสำหรับ Backtest"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>ข้อมูล Template</CardTitle>
            <CardDescription>
              กำหนดค่า default ที่จะถูก pre-fill เมื่อสร้าง Backtest ใหม่
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
                {error}
              </div>
            )}

            {/* Name & Description */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">ชื่อ Template *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น Default Forex, BTC Scalping"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="systemId">Trading System</Label>
                <Select
                  value={formData.systemId}
                  onValueChange={(value) => setFormData({ ...formData, systemId: value === "none" ? "" : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกระบบ (ไม่บังคับ)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">ไม่ระบุ</SelectItem>
                    {systems.map((system) => (
                      <SelectItem key={system.id} value={system.id}>
                        {system.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">คำอธิบาย</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="อธิบายว่า Template นี้เหมาะกับ Backtest แบบไหน"
                rows={2}
              />
            </div>

            {/* Trading Settings */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="symbol">Symbol</Label>
                <Input
                  id="symbol"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  placeholder="เช่น EURUSD, BTCUSDT"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startingCapital">Starting Capital ($)</Label>
                <Input
                  id="startingCapital"
                  type="number"
                  step="0.01"
                  value={formData.startingCapital}
                  onChange={(e) => setFormData({ ...formData, startingCapital: e.target.value })}
                  placeholder="10000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataSource">Data Source</Label>
                <Input
                  id="dataSource"
                  value={formData.dataSource}
                  onChange={(e) => setFormData({ ...formData, dataSource: e.target.value })}
                  placeholder="เช่น TradingView, MetaTrader"
                />
              </div>
            </div>

            {/* Costs */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="commission">Commission ($)</Label>
                <Input
                  id="commission"
                  type="number"
                  step="0.01"
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slippage">Slippage ($)</Label>
                <Input
                  id="slippage"
                  type="number"
                  step="0.01"
                  value={formData.slippage}
                  onChange={(e) => setFormData({ ...formData, slippage: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4 pt-4">
              <Link href="/templates">
                <Button type="button" variant="outline">
                  ยกเลิก
                </Button>
              </Link>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "กำลังบันทึก..." : template ? "บันทึกการแก้ไข" : "สร้าง Template"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
