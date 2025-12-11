"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Plus, X } from "lucide-react"
import { getTags, addTagToSystem, removeTagFromSystem, getSystemTags } from "@/app/tags/actions"

interface Tag {
  id: string
  name: string
  color: string | null
}

interface SystemTagManagerProps {
  systemId: string
}

export function SystemTagManager({ systemId }: SystemTagManagerProps) {
  const router = useRouter()
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [assignedTags, setAssignedTags] = useState<Tag[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadTags = useCallback(async () => {
    const [tags, systemTags] = await Promise.all([
      getTags(),
      getSystemTags(systemId)
    ])
    setAllTags(tags)
    setAssignedTags(systemTags)
  }, [systemId])

  useEffect(() => {
    let mounted = true
    const fetchTags = async () => {
      const [tags, systemTags] = await Promise.all([
        getTags(),
        getSystemTags(systemId)
      ])
      if (mounted) {
        setAllTags(tags)
        setAssignedTags(systemTags)
      }
    }
    fetchTags()
    return () => { mounted = false }
  }, [systemId])

  const handleAddTag = async (tagId: string) => {
    setLoading(true)
    await addTagToSystem(systemId, tagId)
    await loadTags()
    router.refresh()
    setLoading(false)
  }

  const handleRemoveTag = async (tagId: string) => {
    setLoading(true)
    await removeTagFromSystem(systemId, tagId)
    await loadTags()
    router.refresh()
    setLoading(false)
  }

  const availableTags = allTags.filter(
    tag => !assignedTags.some(at => at.id === tag.id)
  )

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Assigned Tags */}
      {assignedTags.map((tag) => (
        <Badge 
          key={tag.id}
          style={{ backgroundColor: tag.color || '#6366f1' }}
          className="text-white flex items-center gap-1 pr-1"
        >
          {tag.name}
          <button
            onClick={() => handleRemoveTag(tag.id)}
            className="ml-1 rounded-full p-0.5 hover:bg-white/20 transition-colors"
            disabled={loading}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}

      {/* Add Tag Button */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 px-2">
            <Plus className="h-3 w-3 mr-1" />
            Add Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-2" align="start">
          {availableTags.length > 0 ? (
            <div className="space-y-1">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => {
                    handleAddTag(tag.id)
                    setOpen(false)
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted transition-colors text-sm"
                  disabled={loading}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color || '#6366f1' }}
                  />
                  {tag.name}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              {allTags.length === 0 
                ? 'ยังไม่มี tags' 
                : 'เพิ่ม tags ทั้งหมดแล้ว'}
            </p>
          )}
        </PopoverContent>
      </Popover>
    </div>
  )
}
