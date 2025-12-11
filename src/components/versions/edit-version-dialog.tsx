"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateSystemVersion } from "@/app/versions/actions";

const versionSchema = z.object({
  versionNumber: z.string().min(1, "กรุณาระบุหมายเลข Version"),
  changelog: z.string().optional(),
  winRate: z.string().optional(),
  profitFactor: z.string().optional(),
  maxDrawdown: z.string().optional(),
  totalTrades: z.string().optional(),
  netProfit: z.string().optional(),
  isActive: z.boolean(),
});

type VersionFormValues = z.infer<typeof versionSchema>;

interface SystemVersion {
  id: string;
  versionNumber: string;
  changelog: string | null;
  winRate: number | null;
  profitFactor: number | null;
  maxDrawdown: number | null;
  totalTrades: number | null;
  netProfit: number | null;
  isActive: boolean;
}

interface EditVersionDialogProps {
  version: SystemVersion;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditVersionDialog({
  version,
  open,
  onOpenChange,
  onSuccess,
}: EditVersionDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<VersionFormValues>({
    resolver: zodResolver(versionSchema),
    defaultValues: {
      versionNumber: version.versionNumber,
      changelog: version.changelog || "",
      winRate: version.winRate?.toString() || "",
      profitFactor: version.profitFactor?.toString() || "",
      maxDrawdown: version.maxDrawdown?.toString() || "",
      totalTrades: version.totalTrades?.toString() || "",
      netProfit: version.netProfit?.toString() || "",
      isActive: version.isActive,
    },
  });

  useEffect(() => {
    form.reset({
      versionNumber: version.versionNumber,
      changelog: version.changelog || "",
      winRate: version.winRate?.toString() || "",
      profitFactor: version.profitFactor?.toString() || "",
      maxDrawdown: version.maxDrawdown?.toString() || "",
      totalTrades: version.totalTrades?.toString() || "",
      netProfit: version.netProfit?.toString() || "",
      isActive: version.isActive,
    });
  }, [version, form]);

  const onSubmit = async (data: VersionFormValues) => {
    setIsLoading(true);
    try {
      const result = await updateSystemVersion(version.id, {
        versionNumber: data.versionNumber,
        changelog: data.changelog || null,
        winRate: data.winRate ? parseFloat(data.winRate) : null,
        profitFactor: data.profitFactor ? parseFloat(data.profitFactor) : null,
        maxDrawdown: data.maxDrawdown ? parseFloat(data.maxDrawdown) : null,
        totalTrades: data.totalTrades ? parseInt(data.totalTrades) : null,
        netProfit: data.netProfit ? parseFloat(data.netProfit) : null,
        isActive: data.isActive,
      });

      if (result.success) {
        onOpenChange(false);
        onSuccess();
      } else {
        alert(result.error || "ไม่สามารถอัพเดท Version ได้");
      }
    } catch (error) {
      console.error("Failed to update version:", error);
      alert("ไม่สามารถอัพเดท Version ได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>แก้ไข Version</DialogTitle>
          <DialogDescription>
            แก้ไขรายละเอียดและ metrics ของ version
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="versionNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>หมายเลข Version *</FormLabel>
                    <FormControl>
                      <Input placeholder="1.0.0" {...field} />
                    </FormControl>
                    <FormDescription>
                      เช่น 1.0.0, 2.1, v3
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Active Version</FormLabel>
                      <FormDescription>
                        Version ที่ใช้งานอยู่ปัจจุบัน
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="changelog"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Changelog</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="รายละเอียดการเปลี่ยนแปลง..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    บันทึกการเปลี่ยนแปลงจาก version ก่อนหน้า
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-3">Performance Metrics (ไม่บังคับ)</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="winRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Win Rate (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="65.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profitFactor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profit Factor</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="1.85" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxDrawdown"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Drawdown (%)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="15.2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalTrades"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Trades</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="150" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="netProfit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Net Profit ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="5000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                ยกเลิก
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "กำลังบันทึก..." : "บันทึก"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
