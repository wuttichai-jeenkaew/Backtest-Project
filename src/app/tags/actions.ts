"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getTags() {
  return await prisma.tag.findMany({
    include: {
      _count: {
        select: { systems: true }
      }
    },
    orderBy: { name: 'asc' }
  })
}

export async function getTag(id: string) {
  return await prisma.tag.findUnique({
    where: { id },
    include: {
      systems: {
        include: {
          system: true
        }
      }
    }
  })
}

export async function createTag(data: { name: string; color?: string }) {
  try {
    const tag = await prisma.tag.create({
      data: {
        name: data.name.trim(),
        color: data.color || '#6366f1'
      }
    })
    
    revalidatePath('/tags')
    revalidatePath('/systems')
    
    return { success: true, tag }
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'P2002') {
      return { success: false, error: 'Tag with this name already exists' }
    }
    return { success: false, error: 'Failed to create tag' }
  }
}

export async function updateTag(id: string, data: { name?: string; color?: string }) {
  try {
    const tag = await prisma.tag.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.color && { color: data.color })
      }
    })
    
    revalidatePath('/tags')
    revalidatePath('/systems')
    
    return { success: true, tag }
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'P2002') {
      return { success: false, error: 'Tag with this name already exists' }
    }
    return { success: false, error: 'Failed to update tag' }
  }
}

export async function deleteTag(id: string) {
  try {
    await prisma.tag.delete({
      where: { id }
    })
    
    revalidatePath('/tags')
    revalidatePath('/systems')
    
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete tag' }
  }
}

export async function addTagToSystem(systemId: string, tagId: string) {
  try {
    await prisma.systemTag.create({
      data: {
        systemId,
        tagId
      }
    })
    
    revalidatePath('/tags')
    revalidatePath('/systems')
    revalidatePath(`/systems/${systemId}`)
    
    return { success: true }
  } catch (error: unknown) {
    const err = error as { code?: string }
    if (err.code === 'P2002') {
      return { success: false, error: 'Tag already assigned to this system' }
    }
    return { success: false, error: 'Failed to add tag' }
  }
}

export async function removeTagFromSystem(systemId: string, tagId: string) {
  try {
    await prisma.systemTag.delete({
      where: {
        systemId_tagId: {
          systemId,
          tagId
        }
      }
    })
    
    revalidatePath('/tags')
    revalidatePath('/systems')
    revalidatePath(`/systems/${systemId}`)
    
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to remove tag' }
  }
}

export async function getSystemTags(systemId: string) {
  const systemTags = await prisma.systemTag.findMany({
    where: { systemId },
    include: {
      tag: true
    }
  })
  
  return systemTags.map(st => st.tag)
}

export async function getSystemsByTag(tagId: string) {
  const systemTags = await prisma.systemTag.findMany({
    where: { tagId },
    include: {
      system: {
        include: {
          _count: {
            select: { backtests: true }
          }
        }
      }
    }
  })
  
  return systemTags.map(st => st.system)
}
