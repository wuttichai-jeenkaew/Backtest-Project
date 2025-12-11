"use client";

import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { duplicateBacktest } from "../actions";
import { useState } from "react";

interface DuplicateBacktestButtonProps {
  id: string;
}

export function DuplicateBacktestButton({ id }: DuplicateBacktestButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleDuplicate() {
    setIsLoading(true);
    try {
      const newId = await duplicateBacktest(id);
      router.push(`/backtests/${newId}`);
    } catch (error) {
      console.error("Failed to duplicate backtest:", error);
      alert("Failed to duplicate backtest");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleDuplicate} disabled={isLoading}>
      <Copy className="mr-2 h-4 w-4" />
      {isLoading ? "Duplicating..." : "Duplicate"}
    </Button>
  );
}
