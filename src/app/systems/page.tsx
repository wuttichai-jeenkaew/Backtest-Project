import Link from "next/link";
import { Plus } from "lucide-react";

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
import { formatDistanceToNow } from "date-fns";

async function getSystems() {
  return prisma.tradingSystem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { backtests: true },
      },
      backtests: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          netProfit: true,
          winRate: true,
        },
      },
    },
  });
}

export default async function SystemsPage() {
  const systems = await getSystems();

  return (
    <>
      <Header title="Trading Systems" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Manage your trading systems and strategies
          </p>
          <Button asChild>
            <Link href="/systems/new">
              <Plus className="mr-2 h-4 w-4" />
              New System
            </Link>
          </Button>
        </div>

        {systems.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Asset Class</TableHead>
                    <TableHead>Timeframe</TableHead>
                    <TableHead className="text-center">Backtests</TableHead>
                    <TableHead className="text-right">Last P/L</TableHead>
                    <TableHead className="text-right">Last Win Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systems.map((system) => {
                    const lastBacktest = system.backtests[0];
                    return (
                      <TableRow key={system.id}>
                        <TableCell className="font-medium">
                          <Link
                            href={`/systems/${system.id}`}
                            className="hover:underline"
                          >
                            {system.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {system.type.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{system.assetClass}</TableCell>
                        <TableCell>{system.timeframe || "-"}</TableCell>
                        <TableCell className="text-center">
                          {system._count.backtests}
                        </TableCell>
                        <TableCell
                          className={`text-right ${
                            lastBacktest
                              ? Number(lastBacktest.netProfit) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                              : ""
                          }`}
                        >
                          {lastBacktest
                            ? `$${Number(lastBacktest.netProfit).toLocaleString()}`
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {lastBacktest?.winRate
                            ? `${Number(lastBacktest.winRate).toFixed(1)}%`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={system.isActive ? "default" : "outline"}
                          >
                            {system.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Systems Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Create your first trading system to start recording backtests.
              </p>
              <Button asChild>
                <Link href="/systems/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create System
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
