"use client";

import { Copy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { duplicateSystem } from "../actions";

interface DuplicateSystemButtonProps {
  id: string;
}

export function DuplicateSystemButton({ id }: DuplicateSystemButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDuplicate = async () => {
    setIsLoading(true);
    try {
      const newId = await duplicateSystem(id);
      router.push(`/systems/${newId}`);
    } catch (error) {
      console.error("Failed to duplicate system:", error);
      alert("Failed to duplicate system");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleDuplicate}
      disabled={isLoading}
    >
      <Copy className="mr-2 h-4 w-4" />
      {isLoading ? "Duplicating..." : "Duplicate"}
    </Button>
  );
}
