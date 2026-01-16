import { prisma } from "@/lib/prisma";
import { JournalForm } from "@/components/forms/journal-form";
import { createJournalEntry } from "../actions";
import { redirect } from "next/navigation";
import { serializeSystems } from "@/lib/serialize";

export default async function NewJournalPage() {
  const systems = await prisma.tradingSystem.findMany({
    orderBy: { name: "asc" },
  });

  // Serialize Decimal fields for Client Component
  const serializedSystems = serializeSystems(systems);

  async function handleCreate(formData: FormData) {
    "use server";
    await createJournalEntry(formData);
    redirect("/journal");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">New Journal Entry</h1>
      <JournalForm
        action={handleCreate}
        systems={serializedSystems}
        submitLabel="Create Entry"
      />
    </div>
  );
}
