import { redirect } from "next/navigation";
import Link from "next/link";

import { Header } from "@/components/layout/header";
import { BacktestForm } from "@/components/forms/backtest-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import { createBacktest } from "../actions";
import { Plus } from "lucide-react";

interface NewBacktestPageProps {
  searchParams: Promise<{ systemId?: string }>;
}

async function getSystems() {
  return prisma.tradingSystem.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export default async function NewBacktestPage({ searchParams }: NewBacktestPageProps) {
  const { systemId } = await searchParams;
  const systems = await getSystems();

  async function handleCreate(formData: FormData) {
    "use server";
    const backtestId = await createBacktest(formData);
    redirect(`/backtests/${backtestId}`);
  }

  if (systems.length === 0) {
    return (
      <>
        <Header title="New Backtest" />
        <div className="flex flex-1 flex-col gap-4 p-4 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>No Trading Systems</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                You need to create a trading system before recording backtests.
              </p>
              <Button asChild>
                <Link href="/systems/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create System
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Record New Backtest" />
      <div className="flex flex-1 flex-col gap-4 p-4 max-w-3xl">
        <BacktestForm
          action={handleCreate}
          systems={systems}
          defaultSystemId={systemId}
          submitLabel="Save Backtest"
        />
      </div>
    </>
  );
}
