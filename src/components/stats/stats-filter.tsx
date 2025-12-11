"use client"

import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface System {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
  color: string | null
}

interface StatsFilterProps {
  systems: System[]
  tags: Tag[]
  onFilterChange: (filters: { systemId: string | null; tagId: string | null }) => void
}

export function StatsFilter({ systems, tags, onFilterChange }: StatsFilterProps) {
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    onFilterChange({ systemId: selectedSystem, tagId: selectedTag })
  }, [selectedSystem, selectedTag, onFilterChange])

  const clearFilters = () => {
    setSelectedSystem(null)
    setSelectedTag(null)
  }

  const hasFilters = selectedSystem || selectedTag

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">กรองตาม:</span>
      </div>
      
      <Select
        value={selectedSystem || "all"}
        onValueChange={(value) => setSelectedSystem(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="เลือกระบบ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทุกระบบ</SelectItem>
          {systems.map((system) => (
            <SelectItem key={system.id} value={system.id}>
              {system.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedTag || "all"}
        onValueChange={(value) => setSelectedTag(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="เลือก Tag" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">ทุก Tag</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color || '#888888' }}
                />
                {tag.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="h-4 w-4 mr-1" />
          ล้างตัวกรอง
        </Button>
      )}

      {hasFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">กำลังดู:</span>
          {selectedSystem && (
            <Badge variant="secondary">
              {systems.find(s => s.id === selectedSystem)?.name}
            </Badge>
          )}
          {selectedTag && (
            <Badge 
              style={{ 
                backgroundColor: (tags.find(t => t.id === selectedTag)?.color || '#888888') + '20',
                color: tags.find(t => t.id === selectedTag)?.color || '#888888',
                borderColor: tags.find(t => t.id === selectedTag)?.color || '#888888'
              }}
              className="border"
            >
              {tags.find(t => t.id === selectedTag)?.name}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
