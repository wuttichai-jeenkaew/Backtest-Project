import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { BacktestSearch } from "@/components/backtest-search";

interface SearchParams {
  search?: string;
  system?: string;
  minWinRate?: string;
  minPF?: string;
  profitable?: string;
}

async function getBacktests(params: SearchParams) {
  // Build where clause based on filters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (params.system && params.system !== "all") {
    where.tradingSystemId = params.system;
  }

  if (params.profitable === "yes") {
    where.netProfit = { gt: 0 };
  } else if (params.profitable === "no") {
    where.netProfit = { lt: 0 };
  }

  if (params.minWinRate) {
    where.winRate = { gte: parseFloat(params.minWinRate) };
  }

  if (params.minPF) {
    where.profitFactor = { gte: parseFloat(params.minPF) };
  }

  // Search filter (symbol, name, or system name)
  if (params.search) {
    where.OR = [
      { symbol: { contains: params.search, mode: "insensitive" } },
      { name: { contains: params.search, mode: "insensitive" } },
      {
        tradingSystem: {
          name: { contains: params.search, mode: "insensitive" },
        },
      },
    ];
  }

  return prisma.backtestResult.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      tradingSystem: true,
    },
  });
}

async function getSystems() {
  return prisma.tradingSystem.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
}

interface BacktestsPageProps {
  searchParams: Promise<SearchParams>;
}

export default async function BacktestsPage({
  searchParams,
}: BacktestsPageProps) {
  const params = await searchParams;
  const [backtests, systems] = await Promise.all([
    getBacktests(params),
    getSystems(),
  ]);

  const hasFilters =
    params.search ||
    params.system ||
    params.minWinRate ||
    params.minPF ||
    params.profitable;

  return (
    <>
      <Header title="Backtests" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-muted-foreground">
            {hasFilters
              ? `Showing ${backtests.length} filtered results`
              : `All recorded backtest results (${backtests.length})`}
          </p>
          <Button asChild>
            <Link href="/backtests/create">
              <Plus className="mr-2 h-4 w-4" />
              New Backtest
            </Link>
          </Button>
        </div>

        {/* Search & Filter */}
        <BacktestSearch systems={systems} />

        {backtests.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Backtest</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Net P/L</TableHead>
                    <TableHead className="text-right">Return %</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                    <TableHead className="text-right">PF</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                    <TableHead className="text-right">DD %</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backtests.map((backtest) => (
                    <TableRow key={backtest.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/backtests/${backtest.id}`}
                          className="hover:underline text-primary"
                        >
                          {backtest.name || `${backtest.symbol} Backtest`}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{backtest.symbol}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        <Link
                          href={`/systems/${backtest.tradingSystemId}`}
                          className="hover:underline"
                        >
                          {backtest.tradingSystem.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(backtest.startDate, "MMM d, yy")} -{" "}
                        {format(backtest.endDate, "MMM d, yy")}
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          Number(backtest.netProfit) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ${Number(backtest.netProfit).toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          Number(backtest.netProfitPercent) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {backtest.netProfitPercent
                          ? `${Number(backtest.netProfitPercent).toFixed(1)}%`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {backtest.winRate
                          ? `${Number(backtest.winRate).toFixed(1)}%`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {backtest.profitFactor
                          ? Number(backtest.profitFactor).toFixed(2)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {backtest.totalTrades}
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        {backtest.maxDrawdownPercent
                          ? `${Number(backtest.maxDrawdownPercent).toFixed(1)}%`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8"
                          >
                            <Link href={`/backtests/${backtest.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Backtests Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Record your first backtest to start tracking performance.
              </p>
              <Button asChild>
                <Link href="/backtests/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Record Backtest
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
