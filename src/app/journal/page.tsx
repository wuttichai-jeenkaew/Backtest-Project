import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { format } from "date-fns";

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

async function getJournalEntries() {
  return prisma.tradeJournalEntry.findMany({
    orderBy: { entryDate: "desc" },
    include: {
      system: true,
      backtest: {
        select: {
          symbol: true,
        },
      },
    },
  });
}

export default async function JournalPage() {
  const entries = await getJournalEntries();

  const getMoodEmoji = (mood: string | null) => {
    switch (mood) {
      case "CONFIDENT": return "😊";
      case "NEUTRAL": return "😐";
      case "ANXIOUS": return "😰";
      case "FEARFUL": return "😨";
      case "GREEDY": return "🤑";
      case "FRUSTRATED": return "😤";
      default: return "📝";
    }
  };

  const getSetupRatingColor = (rating: number | null) => {
    if (!rating) return "";
    if (rating >= 4) return "text-green-600";
    if (rating >= 3) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <>
      <Header title="Trade Journal" />
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Document your trades, emotions, and lessons learned
          </p>
          <Button asChild>
            <Link href="/journal/new">
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Link>
          </Button>
        </div>

        {entries.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>System</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead className="text-right">P/L</TableHead>
                    <TableHead className="text-center">Rating</TableHead>
                    <TableHead className="text-center">Mood</TableHead>
                    <TableHead>Lessons</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        <Link
                          href={`/journal/${entry.id}`}
                          className="hover:underline"
                        >
                          {format(entry.entryDate, "MMM d, yyyy")}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {entry.system?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {entry.symbol}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={entry.direction === "LONG" ? "default" : "secondary"}
                        >
                          {entry.direction}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={`text-right font-medium ${
                          entry.pnl
                            ? Number(entry.pnl) >= 0
                              ? "text-green-600"
                              : "text-red-600"
                            : ""
                        }`}
                      >
                        {entry.pnl
                          ? `$${Number(entry.pnl).toLocaleString()}`
                          : "-"}
                      </TableCell>
                      <TableCell className={`text-center ${getSetupRatingColor(entry.rating)}`}>
                        {entry.rating ? `${entry.rating}/5` : "-"}
                      </TableCell>
                      <TableCell className="text-center text-xl">
                        {getMoodEmoji(entry.emotionalState)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {entry.lessons || "-"}
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
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Start Your Trade Journal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Document your trades, track your emotions, and learn from your experiences.
                A trade journal helps you identify patterns and improve your trading psychology.
              </p>
              <Button asChild>
                <Link href="/journal/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Entry
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
