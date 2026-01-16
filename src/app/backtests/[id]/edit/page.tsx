import { notFound, redirect } from "next/navigation";

import { Header } from "@/components/layout/header";
import { BacktestForm } from "@/components/forms/backtest-form";
import prisma from "@/lib/prisma";
import { updateBacktest } from "../../actions";
import { serializeSystems } from "@/lib/serialize";

interface EditBacktestPageProps {
  params: Promise<{ id: string }>;
}

async function getBacktest(id: string) {
  return prisma.backtestResult.findUnique({
    where: { id },
    include: {
      tradingSystem: true,
    },
  });
}

async function getSystems() {
  return prisma.tradingSystem.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

export default async function EditBacktestPage({
  params,
}: EditBacktestPageProps) {
  const { id } = await params;
  const [backtest, systems] = await Promise.all([
    getBacktest(id),
    getSystems(),
  ]);

  if (!backtest) {
    notFound();
  }

  // Serialize Decimal fields for Client Component
  const serializedSystems = serializeSystems(systems);

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateBacktest(id, formData);
    redirect(`/backtests/${id}`);
  }

  return (
    <>
      <Header
        title={`Edit: ${backtest.tradingSystem.name} - ${backtest.symbol}`}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 max-w-3xl">
        <BacktestForm
          action={handleUpdate}
          systems={serializedSystems}
          initialData={{
            tradingSystemId: backtest.tradingSystemId,
            name: backtest.name,
            symbol: backtest.symbol,
            startDate: backtest.startDate,
            endDate: backtest.endDate,
            startingCapital: Number(backtest.startingCapital),
            endingCapital: Number(backtest.endingCapital),
            totalTrades: backtest.totalTrades,
            winningTrades: backtest.winningTrades,
            losingTrades: backtest.losingTrades,
            grossProfit: backtest.grossProfit
              ? Number(backtest.grossProfit)
              : null,
            grossLoss: backtest.grossLoss ? Number(backtest.grossLoss) : null,
            maxDrawdown: backtest.maxDrawdown
              ? Number(backtest.maxDrawdown)
              : null,
            maxDrawdownPercent: backtest.maxDrawdownPercent
              ? Number(backtest.maxDrawdownPercent)
              : null,
            sharpeRatio: backtest.sharpeRatio
              ? Number(backtest.sharpeRatio)
              : null,
            averageWin: backtest.averageWin
              ? Number(backtest.averageWin)
              : null,
            averageLoss: backtest.averageLoss
              ? Number(backtest.averageLoss)
              : null,
            largestWin: backtest.largestWin
              ? Number(backtest.largestWin)
              : null,
            largestLoss: backtest.largestLoss
              ? Number(backtest.largestLoss)
              : null,
            maxConsecutiveWins: backtest.maxConsecutiveWins,
            maxConsecutiveLosses: backtest.maxConsecutiveLosses,
            notes: backtest.notes,
            dataSource: backtest.dataSource,
          }}
          submitLabel="Update Backtest"
        />
      </div>
    </>
  );
}
