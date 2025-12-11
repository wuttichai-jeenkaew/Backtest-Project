"use client";

import { useRouter } from "next/navigation";
import { SystemType, AssetClass } from "@prisma/client";

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

interface SystemFormProps {
  action: (formData: FormData) => Promise<void>;
  initialData?: {
    name: string;
    description?: string | null;
    type: SystemType;
    assetClass: AssetClass;
    timeframe?: string | null;
    entryRules?: string | null;
    exitRules?: string | null;
    isActive?: boolean;
  };
  submitLabel: string;
}

const systemTypes: { value: SystemType; label: string }[] = [
  { value: "MANUAL", label: "Manual" },
  { value: "SEMI_AUTO", label: "Semi-Automated" },
  { value: "FULLY_AUTO", label: "Fully Automated" },
  { value: "INDICATOR_BASED", label: "Indicator Based" },
  { value: "PRICE_ACTION", label: "Price Action" },
];

const assetClasses: { value: AssetClass; label: string }[] = [
  { value: "FOREX", label: "Forex" },
  { value: "STOCKS", label: "Stocks" },
  { value: "CRYPTO", label: "Crypto" },
  { value: "FUTURES", label: "Futures" },
  { value: "OPTIONS", label: "Options" },
  { value: "INDICES", label: "Indices" },
  { value: "COMMODITIES", label: "Commodities" },
  { value: "MULTI_ASSET", label: "Multi-Asset" },
];

const timeframes = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN"];

export function SystemForm({ action, initialData, submitLabel }: SystemFormProps) {
  const router = useRouter();

  return (
    <form action={action} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">System Name *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="e.g., Momentum Breakout Strategy"
              defaultValue={initialData?.name}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your trading system..."
              rows={3}
              defaultValue={initialData?.description || ""}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="type">System Type *</Label>
              <Select name="type" defaultValue={initialData?.type || "MANUAL"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {systemTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetClass">Asset Class *</Label>
              <Select name="assetClass" defaultValue={initialData?.assetClass || "FOREX"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset class" />
                </SelectTrigger>
                <SelectContent>
                  {assetClasses.map((asset) => (
                    <SelectItem key={asset.value} value={asset.value}>
                      {asset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select name="timeframe" defaultValue={initialData?.timeframe || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  {timeframes.map((tf) => (
                    <SelectItem key={tf} value={tf}>
                      {tf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trading Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="entryRules">Entry Rules</Label>
            <Textarea
              id="entryRules"
              name="entryRules"
              placeholder="Describe your entry conditions..."
              rows={4}
              defaultValue={initialData?.entryRules || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exitRules">Exit Rules</Label>
            <Textarea
              id="exitRules"
              name="exitRules"
              placeholder="Describe your exit conditions..."
              rows={4}
              defaultValue={initialData?.exitRules || ""}
            />
          </div>
        </CardContent>
      </Card>

      {initialData && (
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="isActive">System Status</Label>
              <Select name="isActive" defaultValue={initialData.isActive ? "true" : "false"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
