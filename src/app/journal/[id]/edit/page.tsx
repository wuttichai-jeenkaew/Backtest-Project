import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { JournalForm } from "@/components/forms/journal-form";
import { updateJournalEntry } from "../../actions";
import { serializeSystems } from "@/lib/serialize";

interface Props {
  params: Promise<{ id: string }>;
}

// Helper to convert Decimal to number
function toNumber(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val;
  if (typeof val === "object" && "toNumber" in val) {
    return (val as { toNumber: () => number }).toNumber();
  }
  return Number(val);
}

export default async function EditJournalPage({ params }: Props) {
  const { id } = await params;

  const entry = await prisma.tradeJournalEntry.findUnique({
    where: { id },
  });

  if (!entry) {
    notFound();
  }

  const systems = await prisma.tradingSystem.findMany({
    orderBy: { name: "asc" },
  });

  // Serialize Decimal fields for Client Component
  const serializedSystems = serializeSystems(systems);

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateJournalEntry(id, formData);
    redirect(`/journal/${id}`);
  }

  const initialData = {
    systemId: entry.systemId,
    symbol: entry.symbol,
    entryDate: entry.entryDate,
    direction: entry.direction,
    entryPrice: toNumber(entry.entryPrice),
    exitDate: entry.exitDate,
    exitPrice: toNumber(entry.exitPrice),
    quantity: toNumber(entry.quantity),
    stopLoss: toNumber(entry.stopLoss),
    takeProfit: toNumber(entry.takeProfit),
    pnl: toNumber(entry.pnl),
    pnlPercent: toNumber(entry.pnlPercent),
    rMultiple: toNumber(entry.rMultiple),
    rating: entry.rating,
    emotionalState: entry.emotionalState,
    setup: entry.setup,
    entryReason: entry.entryReason,
    exitReason: entry.exitReason,
    lessons: entry.lessons,
    mistakes: entry.mistakes,
    tags: entry.tags,
    screenshots: entry.screenshots,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Edit Journal Entry</h1>
      <JournalForm
        action={handleUpdate}
        systems={serializedSystems}
        initialData={initialData}
        submitLabel="Update Entry"
      />
    </div>
  );
}
