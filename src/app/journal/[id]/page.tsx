import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, ArrowLeft, Trash2 } from "lucide-react";
import { deleteJournalEntry } from "../actions";
import { redirect } from "next/navigation";
import { format } from "date-fns";

interface Props {
  params: Promise<{ id: string }>;
}

// Helper to format numbers
function toNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val;
  if (typeof val === "object" && "toNumber" in val) {
    return (val as { toNumber: () => number }).toNumber();
  }
  return Number(val);
}

export default async function JournalDetailPage({ params }: Props) {
  const { id } = await params;

  const entry = await prisma.tradeJournalEntry.findUnique({
    where: { id },
    include: {
      system: true,
    },
  });

  if (!entry) {
    notFound();
  }

  async function handleDelete() {
    "use server";
    await deleteJournalEntry(id);
    redirect("/journal");
  }

  const emotionEmoji: Record<string, string> = {
    Calm: "😊",
    Confident: "💪",
    Neutral: "😐",
    Anxious: "😰",
    FOMO: "🤑",
    Fear: "😨",
    Greedy: "💰",
    Frustrated: "😤",
    Revenge: "😡",
    FRUSTRATED: "😤",
  };

  const marketEmoji: Record<string, string> = {
    TRENDING_UP: "📈",
    TRENDING_DOWN: "📉",
    RANGING: "↔️",
    VOLATILE: "⚡",
    LOW_VOLATILITY: "😴",
  };

  const pl = toNumber(entry.pnl);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/journal">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{entry.symbol}</h1>
              <Badge variant={entry.direction === "LONG" ? "default" : "destructive"}>
                {entry.direction === "LONG" ? "🟢" : "🔴"} {entry.direction}
              </Badge>
              {pl !== null && (
                <Badge variant={pl >= 0 ? "default" : "destructive"}>
                  {pl >= 0 ? "+" : ""}{pl.toFixed(2)}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {format(entry.entryDate, "EEEE, MMMM d, yyyy")}
              {entry.exitDate && ` - ${format(entry.exitDate, "MMMM d, yyyy")}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href={`/journal/${id}/edit`}>
            <Button>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <form action={handleDelete}>
            <Button variant="destructive" type="submit">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Trade Info */}
        <Card>
          <CardHeader>
            <CardTitle>Trade Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entry.system && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">System</span>
                <span className="font-medium">{entry.system.name}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Entry Price</span>
              <span className="font-medium">{toNumber(entry.entryPrice)}</span>
            </div>
            {toNumber(entry.exitPrice) && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Exit Price</span>
                <span className="font-medium">{toNumber(entry.exitPrice)}</span>
              </div>
            )}
            {toNumber(entry.stopLoss) && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stop Loss</span>
                <span className="font-medium">{toNumber(entry.stopLoss)}</span>
              </div>
            )}
            {toNumber(entry.takeProfit) && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Take Profit</span>
                <span className="font-medium">{toNumber(entry.takeProfit)}</span>
              </div>
            )}
            {toNumber(entry.quantity) && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity</span>
                <span className="font-medium">{toNumber(entry.quantity)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Ratings & Psychology */}
        <Card>
          <CardHeader>
            <CardTitle>Ratings & Psychology</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {entry.rating && (
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Trade Quality</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={star <= entry.rating! ? "text-yellow-500" : "text-gray-300"}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            )}
            {entry.emotionalState && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emotional State</span>
                <span className="font-medium">
                  {emotionEmoji[entry.emotionalState] || ""} {entry.emotionalState}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trade Analysis */}
        {(entry.setup || entry.entryReason || entry.exitReason) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Trade Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entry.setup && (
                <div>
                  <h4 className="font-medium mb-1">Setup / Pattern</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{entry.setup}</p>
                </div>
              )}
              {entry.entryReason && (
                <div>
                  <h4 className="font-medium mb-1">Entry Reason</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{entry.entryReason}</p>
                </div>
              )}
              {entry.exitReason && (
                <div>
                  <h4 className="font-medium mb-1">Exit Reason</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{entry.exitReason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Reflection */}
        {(entry.mistakes || entry.lessons) && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Reflection & Learning</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {entry.mistakes && (
                <div>
                  <h4 className="font-medium mb-1 text-red-600 dark:text-red-400">Mistakes Made</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{entry.mistakes}</p>
                </div>
              )}
              {entry.lessons && (
                <div>
                  <h4 className="font-medium mb-1 text-green-600 dark:text-green-400">Lessons Learned</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap">{entry.lessons}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tags */}
        {entry.tags && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {entry.tags.split(",").map((tag: string, i: number) => (
                  <Badge key={i} variant="outline">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
