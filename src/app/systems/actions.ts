"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { SystemType, AssetClass } from "@prisma/client";

export async function createSystem(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const type = formData.get("type") as SystemType;
    const assetClass = formData.get("assetClass") as AssetClass;
    const timeframe = formData.get("timeframe") as string | null;
    const entryRules = formData.get("entryRules") as string | null;
    const exitRules = formData.get("exitRules") as string | null;
    const riskPerTradeStr = formData.get("riskPerTrade") as string | null;
    const defaultRRStr = formData.get("defaultRR") as string | null;

    if (!name || !name.trim()) {
      throw new Error("System name is required");
    }

    const riskPerTrade = riskPerTradeStr ? parseFloat(riskPerTradeStr) : null;
    const defaultRR = defaultRRStr ? parseFloat(defaultRRStr) : null;

    await prisma.tradingSystem.create({
      data: {
        name: name.trim(),
        description: description || null,
        type,
        assetClass,
        timeframe: timeframe || null,
        entryRules: entryRules || null,
        exitRules: exitRules || null,
        riskPerTrade,
        defaultRR,
      },
    });

    revalidatePath("/systems");
    revalidatePath("/");
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === "P2002") {
      throw new Error("A system with this name already exists");
    }
    throw new Error(err.message || "Failed to create system");
  }
}

export async function updateSystem(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string | null;
    const type = formData.get("type") as SystemType;
    const assetClass = formData.get("assetClass") as AssetClass;
    const timeframe = formData.get("timeframe") as string | null;
    const entryRules = formData.get("entryRules") as string | null;
    const exitRules = formData.get("exitRules") as string | null;
    const riskPerTradeStr = formData.get("riskPerTrade") as string | null;
    const defaultRRStr = formData.get("defaultRR") as string | null;
    const isActive = formData.get("isActive") === "true";

    if (!name || !name.trim()) {
      throw new Error("System name is required");
    }

    const riskPerTrade = riskPerTradeStr ? parseFloat(riskPerTradeStr) : null;
    const defaultRR = defaultRRStr ? parseFloat(defaultRRStr) : null;

    await prisma.tradingSystem.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description || null,
        type,
        assetClass,
        timeframe: timeframe || null,
        entryRules: entryRules || null,
        exitRules: exitRules || null,
        riskPerTrade,
        defaultRR,
        isActive,
      },
    });

    revalidatePath("/systems");
    revalidatePath(`/systems/${id}`);
    revalidatePath("/");
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === "P2002") {
      throw new Error("A system with this name already exists");
    }
    throw new Error(err.message || "Failed to update system");
  }
}

export async function deleteSystem(id: string) {
  try {
    await prisma.tradingSystem.delete({
      where: { id },
    });

    revalidatePath("/systems");
    revalidatePath("/");
  } catch {
    throw new Error(
      "Failed to delete system. It may have associated backtests."
    );
  }
}

export async function duplicateSystem(id: string) {
  try {
    const original = await prisma.tradingSystem.findUnique({
      where: { id },
    });

    if (!original) {
      throw new Error("System not found");
    }

    // Create a copy with "(Copy)" appended to name
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...data
    } = original;

    // Find unique name
    let newName = `${original.name} (Copy)`;
    let counter = 1;
    while (
      await prisma.tradingSystem.findUnique({ where: { name: newName } })
    ) {
      counter++;
      newName = `${original.name} (Copy ${counter})`;
    }

    const newSystem = await prisma.tradingSystem.create({
      data: {
        ...data,
        name: newName,
      },
    });

    revalidatePath("/systems");
    revalidatePath("/");

    return newSystem.id;
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || "Failed to duplicate system");
  }
}
