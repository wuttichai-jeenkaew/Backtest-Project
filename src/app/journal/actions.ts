"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export async function createJournalEntry(formData: FormData) {
  try {
    const systemId = formData.get("systemId") as string | null;
    const backtestId = formData.get("backtestId") as string | null;
    const symbol = formData.get("symbol") as string;
    const entryDate = new Date(formData.get("entryDate") as string);
    const direction = formData.get("direction") as string;

    // Validation
    if (!symbol || !symbol.trim()) throw new Error("Symbol is required");
    if (!direction) throw new Error("Direction is required");
    if (isNaN(entryDate.getTime())) throw new Error("Valid entry date is required");

    const entryPrice = parseFloat(formData.get("entryPrice") as string);
    const quantity = parseFloat(formData.get("quantity") as string);

    if (isNaN(entryPrice) || entryPrice <= 0) throw new Error("Entry price must be greater than 0");
    if (isNaN(quantity) || quantity <= 0) throw new Error("Quantity must be greater than 0");

    const exitDate = formData.get("exitDate")
      ? new Date(formData.get("exitDate") as string)
      : null;
    const exitPrice = formData.get("exitPrice")
      ? parseFloat(formData.get("exitPrice") as string)
      : null;
    const stopLoss = formData.get("stopLoss")
      ? parseFloat(formData.get("stopLoss") as string)
      : null;
    const takeProfit = formData.get("takeProfit")
      ? parseFloat(formData.get("takeProfit") as string)
      : null;
    const pnl = formData.get("pnl")
      ? parseFloat(formData.get("pnl") as string)
      : null;
    const pnlPercent = formData.get("pnlPercent")
      ? parseFloat(formData.get("pnlPercent") as string)
      : null;
    const rMultiple = formData.get("rMultiple")
      ? parseFloat(formData.get("rMultiple") as string)
      : null;

    const rating = formData.get("rating")
      ? parseInt(formData.get("rating") as string)
      : null;

    const emotionalState = formData.get("emotionalState") as string | null;
    const setup = formData.get("setup") as string | null;
    const entryReason = formData.get("entryReason") as string | null;
    const exitReason = formData.get("exitReason") as string | null;
    const lessons = formData.get("lessons") as string | null;
    const mistakes = formData.get("mistakes") as string | null;
    const tags = formData.get("tags") as string | null;
    const screenshots = formData.get("screenshots") as string | null;

    const entry = await prisma.tradeJournalEntry.create({
      data: {
        systemId: systemId || null,
        backtestId: backtestId || null,
        symbol,
        entryDate,
        direction,
        entryPrice,
        quantity,
        exitDate,
        exitPrice,
        stopLoss,
        takeProfit,
        pnl,
        pnlPercent,
        rMultiple,
        rating,
        emotionalState: emotionalState || null,
        setup: setup || null,
        entryReason: entryReason || null,
        exitReason: exitReason || null,
        lessons: lessons || null,
        mistakes: mistakes || null,
        tags: tags || null,
        screenshots: screenshots || null,
      },
    });

    revalidatePath("/journal");
    return entry.id;
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || "Failed to create journal entry");
  }
}

export async function updateJournalEntry(id: string, formData: FormData) {
  try {
    if (!id) throw new Error("Journal entry ID is required");

    const systemId = formData.get("systemId") as string | null;
    const backtestId = formData.get("backtestId") as string | null;
    const symbol = formData.get("symbol") as string;
    const entryDate = new Date(formData.get("entryDate") as string);
    const direction = formData.get("direction") as string;

    // Validation
    if (!symbol || !symbol.trim()) throw new Error("Symbol is required");
    if (!direction) throw new Error("Direction is required");
    if (isNaN(entryDate.getTime())) throw new Error("Valid entry date is required");

    const entryPrice = parseFloat(formData.get("entryPrice") as string);
    const quantity = parseFloat(formData.get("quantity") as string);

    if (isNaN(entryPrice) || entryPrice <= 0) throw new Error("Entry price must be greater than 0");
    if (isNaN(quantity) || quantity <= 0) throw new Error("Quantity must be greater than 0");

    const exitDate = formData.get("exitDate")
      ? new Date(formData.get("exitDate") as string)
      : null;
    const exitPrice = formData.get("exitPrice")
      ? parseFloat(formData.get("exitPrice") as string)
      : null;
    const stopLoss = formData.get("stopLoss")
      ? parseFloat(formData.get("stopLoss") as string)
      : null;
    const takeProfit = formData.get("takeProfit")
      ? parseFloat(formData.get("takeProfit") as string)
      : null;
    const pnl = formData.get("pnl")
      ? parseFloat(formData.get("pnl") as string)
      : null;
    const pnlPercent = formData.get("pnlPercent")
      ? parseFloat(formData.get("pnlPercent") as string)
      : null;
    const rMultiple = formData.get("rMultiple")
      ? parseFloat(formData.get("rMultiple") as string)
      : null;

    const rating = formData.get("rating")
      ? parseInt(formData.get("rating") as string)
      : null;

    const emotionalState = formData.get("emotionalState") as string | null;
    const setup = formData.get("setup") as string | null;
    const entryReason = formData.get("entryReason") as string | null;
    const exitReason = formData.get("exitReason") as string | null;
    const lessons = formData.get("lessons") as string | null;
    const mistakes = formData.get("mistakes") as string | null;
    const tags = formData.get("tags") as string | null;
    const screenshots = formData.get("screenshots") as string | null;

    await prisma.tradeJournalEntry.update({
      where: { id },
      data: {
        systemId: systemId || null,
        backtestId: backtestId || null,
        symbol,
        entryDate,
        direction,
        entryPrice,
        quantity,
        exitDate,
        exitPrice,
        stopLoss,
        takeProfit,
        pnl,
        pnlPercent,
        rMultiple,
        rating,
        emotionalState: emotionalState || null,
        setup: setup || null,
        entryReason: entryReason || null,
        exitReason: exitReason || null,
        lessons: lessons || null,
        mistakes: mistakes || null,
        tags: tags || null,
        screenshots: screenshots || null,
      },
    });

    revalidatePath("/journal");
    revalidatePath(`/journal/${id}`);
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || "Failed to update journal entry");
  }
}

export async function deleteJournalEntry(id: string) {
  try {
    if (!id) throw new Error("Journal entry ID is required");

    await prisma.tradeJournalEntry.delete({
      where: { id },
    });

    revalidatePath("/journal");
  } catch (error: unknown) {
    const err = error as { message?: string };
    throw new Error(err.message || "Failed to delete journal entry");
  }
}
