import { redirect } from "next/navigation";

import { Header } from "@/components/layout/header";
import { SystemForm } from "@/components/forms/system-form";
import { createSystem } from "../actions";

export default function NewSystemPage() {
  async function handleCreate(formData: FormData) {
    "use server";
    await createSystem(formData);
    redirect("/systems");
  }

  return (
    <>
      <Header title="New Trading System" />
      <div className="flex flex-1 flex-col gap-4 p-4 max-w-3xl">
        <SystemForm action={handleCreate} submitLabel="Create System" />
      </div>
    </>
  );
}
