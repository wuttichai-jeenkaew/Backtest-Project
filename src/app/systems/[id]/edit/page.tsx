import { notFound, redirect } from "next/navigation";

import { Header } from "@/components/layout/header";
import { SystemForm } from "@/components/forms/system-form";
import prisma from "@/lib/prisma";
import { updateSystem } from "../../actions";
import { serializeSystem } from "@/lib/serialize";

interface EditSystemPageProps {
  params: Promise<{ id: string }>;
}

async function getSystem(id: string) {
  return prisma.tradingSystem.findUnique({
    where: { id },
  });
}

export default async function EditSystemPage({ params }: EditSystemPageProps) {
  const { id } = await params;
  const system = await getSystem(id);

  if (!system) {
    notFound();
  }

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateSystem(id, formData);
    redirect(`/systems/${id}`);
  }

  // Serialize Decimal fields for Client Component
  const serializedSystem = serializeSystem(system);

  return (
    <>
      <Header title={`Edit: ${system.name}`} />
      <div className="flex flex-1 flex-col gap-4 p-4 max-w-3xl">
        <SystemForm
          action={handleUpdate}
          initialData={serializedSystem}
          submitLabel="Update System"
        />
      </div>
    </>
  );
}
