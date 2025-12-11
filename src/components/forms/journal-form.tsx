"use client";

import { useRouter } from "next/navigation";
import { TradingSystem } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JournalFormProps {
  action: (formData: FormData) => Promise<void>;
  systems: TradingSystem[];
  initialData?: {
    systemId?: string | null;
    symbol: string;
    entryDate: Date;
    direction: string;
    entryPrice?: number | null;
    exitDate?: Date | null;
    exitPrice?: number | null;
    quantity?: number | null;
    stopLoss?: number | null;
    takeProfit?: number | null;
    pnl?: number | null;
    pnlPercent?: number | null;
    rMultiple?: number | null;
    rating?: number | null;
    emotionalState?: string | null;
    setup?: string | null;
    entryReason?: string | null;
    exitReason?: string | null;
    lessons?: string | null;
    mistakes?: string | null;
    tags?: string | null;
    screenshots?: string | null;
  };
  submitLabel: string;
}

export function JournalForm({
  action,
  systems,
  initialData,
  submitLabel,
}: JournalFormProps) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  return (
    <form action={action} className="space-y-6">
      {/* Basic Trade Info */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="systemId">Trading System</Label>
              <Select
                name="systemId"
                defaultValue={initialData?.systemId || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select system (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {systems.map((system) => (
                    <SelectItem key={system.id} value={system.id}>
                      {system.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entryDate">Entry Date *</Label>
              <Input
                id="entryDate"
                name="entryDate"
                type="date"
                required
                defaultValue={initialData ? formatDate(initialData.entryDate) : formatDate(new Date())}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input
                id="symbol"
                name="symbol"
                required
                placeholder="e.g., EUR/USD, AAPL"
                defaultValue={initialData?.symbol}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="direction">Direction *</Label>
              <Select
                name="direction"
                defaultValue={initialData?.direction || "LONG"}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LONG">🟢 Long</SelectItem>
                  <SelectItem value="SHORT">🔴 Short</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitDate">Exit Date</Label>
              <Input
                id="exitDate"
                name="exitDate"
                type="date"
                defaultValue={initialData?.exitDate ? formatDate(initialData.exitDate) : ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price & Position */}
      <Card>
        <CardHeader>
          <CardTitle>Price & Position</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="entryPrice">Entry Price *</Label>
              <Input
                id="entryPrice"
                name="entryPrice"
                type="number"
                step="any"
                required
                placeholder="Entry price"
                defaultValue={initialData?.entryPrice ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitPrice">Exit Price</Label>
              <Input
                id="exitPrice"
                name="exitPrice"
                type="number"
                step="any"
                placeholder="Exit price"
                defaultValue={initialData?.exitPrice ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="any"
                required
                placeholder="Position size"
                defaultValue={initialData?.quantity ?? "1"}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stopLoss">Stop Loss</Label>
              <Input
                id="stopLoss"
                name="stopLoss"
                type="number"
                step="any"
                placeholder="Stop loss price"
                defaultValue={initialData?.stopLoss ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="takeProfit">Take Profit</Label>
              <Input
                id="takeProfit"
                name="takeProfit"
                type="number"
                step="any"
                placeholder="Take profit price"
                defaultValue={initialData?.takeProfit ?? ""}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="pnl">P&L ($)</Label>
              <Input
                id="pnl"
                name="pnl"
                type="number"
                step="0.01"
                placeholder="Final P/L in $"
                defaultValue={initialData?.pnl ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pnlPercent">P&L (%)</Label>
              <Input
                id="pnlPercent"
                name="pnlPercent"
                type="number"
                step="0.01"
                placeholder="P/L percentage"
                defaultValue={initialData?.pnlPercent ?? ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rMultiple">R-Multiple</Label>
              <Input
                id="rMultiple"
                name="rMultiple"
                type="number"
                step="0.01"
                placeholder="Risk/Reward achieved"
                defaultValue={initialData?.rMultiple ?? ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ratings & Psychology */}
      <Card>
        <CardHeader>
          <CardTitle>Rating & Psychology</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rating">Trade Quality (1-5)</Label>
              <Select
                name="rating"
                defaultValue={initialData?.rating?.toString()}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rate this trade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Poor</SelectItem>
                  <SelectItem value="2">2 - Below Average</SelectItem>
                  <SelectItem value="3">3 - Average</SelectItem>
                  <SelectItem value="4">4 - Good</SelectItem>
                  <SelectItem value="5">5 - Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emotionalState">Emotional State</Label>
              <Select
                name="emotionalState"
                defaultValue={initialData?.emotionalState || undefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How did you feel?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Calm">😊 Calm</SelectItem>
                  <SelectItem value="Confident">💪 Confident</SelectItem>
                  <SelectItem value="Neutral">😐 Neutral</SelectItem>
                  <SelectItem value="Anxious">😰 Anxious</SelectItem>
                  <SelectItem value="FOMO">🤑 FOMO</SelectItem>
                  <SelectItem value="Fear">😨 Fear</SelectItem>
                  <SelectItem value="Greedy">💰 Greedy</SelectItem>
                  <SelectItem value="Frustrated">😤 Frustrated</SelectItem>
                  <SelectItem value="Revenge">😡 Revenge Trading</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trade Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Trade Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="setup">Setup / Pattern</Label>
            <Textarea
              id="setup"
              name="setup"
              placeholder="Describe the setup you identified (e.g., breakout, pullback, support/resistance)"
              rows={2}
              defaultValue={initialData?.setup || ""}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="entryReason">Entry Reason</Label>
              <Textarea
                id="entryReason"
                name="entryReason"
                placeholder="Why did you enter this trade?"
                rows={2}
                defaultValue={initialData?.entryReason || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="exitReason">Exit Reason</Label>
              <Textarea
                id="exitReason"
                name="exitReason"
                placeholder="Why did you exit?"
                rows={2}
                defaultValue={initialData?.exitReason || ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reflection */}
      <Card>
        <CardHeader>
          <CardTitle>Reflection & Learning</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mistakes">Mistakes Made</Label>
            <Textarea
              id="mistakes"
              name="mistakes"
              placeholder="What mistakes did you make?"
              rows={2}
              defaultValue={initialData?.mistakes || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lessons">Lessons Learned</Label>
            <Textarea
              id="lessons"
              name="lessons"
              placeholder="What did you learn from this trade?"
              rows={2}
              defaultValue={initialData?.lessons || ""}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                placeholder="Comma-separated tags (e.g., breakout, scalp)"
                defaultValue={initialData?.tags || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenshots">Screenshots (URLs)</Label>
              <Input
                id="screenshots"
                name="screenshots"
                placeholder="Comma-separated URLs to screenshots"
                defaultValue={initialData?.screenshots || ""}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
