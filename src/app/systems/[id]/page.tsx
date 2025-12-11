import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Plus, Tag, GitBranch } from "lucide-react";

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
import { DeleteSystemButton } from "./delete-button";
import { DuplicateSystemButton } from "./duplicate-button";
import { SystemTagManager } from "@/components/tags/system-tag-manager";

interface SystemDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getSystem(id: string) {
  return prisma.tradingSystem.findUnique({
    where: { id },
    include: {
      backtests: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { equityCurve: true, monthlyReturns: true },
          },
        },
      },
    },
  });
}

export default async function SystemDetailPage({ params }: SystemDetailPageProps) {
  const { id } = await params;
  const system = await getSystem(id);

  if (!system) {
    notFound();
  }

  // Calculate aggregate stats
  const totalBacktests = system.backtests.length;
  const totalNetProfit = system.backtests.reduce(
    (sum, bt) => sum + Number(bt.netProfit),
    0
  );
  const avgWinRate =
    totalBacktests > 0
      ? system.backtests.reduce((sum, bt) => sum + Number(bt.winRate || 0), 0) /
        totalBacktests
      : 0;
  const avgProfitFactor =
    totalBacktests > 0
      ? system.backtests.reduce((sum, bt) => sum + Number(bt.profitFactor || 0), 0) /
        totalBacktests
      : 0;

  return (
    <>
      <Header title={system.name} />
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Button asChild>
            <Link href={`/backtests/new?systemId=${system.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              New Backtest
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/systems/${system.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/systems/${system.id}/versions`}>
              <GitBranch className="mr-2 h-4 w-4" />
              Versions
            </Link>
          </Button>
          <DuplicateSystemButton id={system.id} />
          <DeleteSystemButton id={system.id} name={system.name} />
        </div>

        {/* System Info */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>System Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <Badge variant="secondary">{system.type.replace("_", " ")}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Asset Class</span>
                <span>{system.assetClass}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Timeframe</span>
                <span>{system.timeframe || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={system.isActive ? "default" : "outline"}>
                  {system.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tags</span>
                </div>
                <SystemTagManager systemId={system.id} />
              </div>
              {system.description && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{system.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Backtests</span>
                <span className="font-medium">{totalBacktests}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Net Profit</span>
                <span
                  className={`font-medium ${
                    totalNetProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  ${totalNetProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Win Rate</span>
                <span className="font-medium">{avgWinRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg Profit Factor</span>
                <span className="font-medium">{avgProfitFactor.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trading Rules */}
        {(system.entryRules || system.exitRules) && (
          <Card>
            <CardHeader>
              <CardTitle>Trading Rules</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {system.entryRules && (
                <div>
                  <p className="text-sm font-medium mb-2">Entry Rules</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {system.entryRules}
                  </p>
                </div>
              )}
              {system.exitRules && (
                <div>
                  <p className="text-sm font-medium mb-2">Exit Rules</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {system.exitRules}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Backtests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Backtests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {system.backtests.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Net P/L</TableHead>
                    <TableHead className="text-right">Win Rate</TableHead>
                    <TableHead className="text-right">Profit Factor</TableHead>
                    <TableHead className="text-right">Trades</TableHead>
                    <TableHead className="text-right">Max DD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {system.backtests.map((backtest) => (
                    <TableRow key={backtest.id}>
                      <TableCell>
                        <Link
                          href={`/backtests/${backtest.id}`}
                          className="font-medium hover:underline"
                        >
                          <Badge variant="outline">{backtest.symbol}</Badge>
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(backtest.startDate, "MMM d, yyyy")} -{" "}
                        {format(backtest.endDate, "MMM d, yyyy")}
                      </TableCell>
                      <TableCell
                        className={`text-right ${
                          Number(backtest.netProfit) >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ${Number(backtest.netProfit).toLocaleString()}
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                No backtests yet.{" "}
                <Link
                  href={`/backtests/new?systemId=${system.id}`}
                  className="underline"
                >
                  Add one
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
