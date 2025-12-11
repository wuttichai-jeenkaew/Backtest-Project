import Link from "next/link"
import { getTags } from "./actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tag, Layers } from "lucide-react"
import { CreateTagDialog } from "@/components/tags/create-tag-dialog"
import { TagCard } from "@/components/tags/tag-card"

export default async function TagsPage() {
  const tags = await getTags()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
          <p className="text-muted-foreground">
            จัดการ tags สำหรับจัดหมวดหมู่ระบบเทรด
          </p>
        </div>
        <CreateTagDialog />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags ทั้งหมด</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tags.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ระบบที่มี Tags</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tags.reduce((sum, tag) => sum + tag._count.systems, 0)}
            </div>
            <p className="text-xs text-muted-foreground">การเชื่อมโยงทั้งหมด</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tag ยอดนิยม</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {tags.length > 0 ? (
              <div className="flex items-center gap-2">
                <Badge 
                  style={{ backgroundColor: tags.sort((a, b) => b._count.systems - a._count.systems)[0]?.color || '#6366f1' }}
                  className="text-white"
                >
                  {tags.sort((a, b) => b._count.systems - a._count.systems)[0]?.name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  ({tags.sort((a, b) => b._count.systems - a._count.systems)[0]?._count.systems} ระบบ)
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">ยังไม่มี tags</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tags Grid */}
      {tags.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tags.map((tag) => (
            <TagCard key={tag.id} tag={tag} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">ยังไม่มี Tags</h3>
            <p className="text-sm text-muted-foreground mb-4">
              สร้าง tag แรกเพื่อจัดหมวดหมู่ระบบเทรด
            </p>
            <CreateTagDialog />
          </CardContent>
        </Card>
      )}

      {/* All Tags (Quick View) */}
      {tags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tags ทั้งหมด</CardTitle>
            <CardDescription>คลิกที่ tag เพื่อดูระบบที่เกี่ยวข้อง</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link key={tag.id} href={`/tags/${tag.id}`}>
                  <Badge 
                    style={{ backgroundColor: tag.color || '#6366f1' }}
                    className="text-white cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {tag.name}
                    <span className="ml-1 opacity-75">({tag._count.systems})</span>
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
