import Link from "next/link"
import { notFound } from "next/navigation"
import { getTag, getSystemsByTag } from "../actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Layers, FlaskConical, Tag } from "lucide-react"

interface TagDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function TagDetailPage({ params }: TagDetailPageProps) {
  const { id } = await params
  const [tag, systems] = await Promise.all([
    getTag(id),
    getSystemsByTag(id)
  ])

  if (!tag) {
    notFound()
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/tags">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Badge 
            style={{ backgroundColor: tag.color || '#6366f1' }}
            className="text-white text-lg px-4 py-1"
          >
            {tag.name}
          </Badge>
          <span className="text-muted-foreground">
            ({systems.length} ระบบ)
          </span>
        </div>
      </div>

      {/* Systems with this tag */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            ระบบที่ใช้ Tag นี้
          </CardTitle>
          <CardDescription>
            รายการระบบเทรดที่ได้รับ tag &quot;{tag.name}&quot;
          </CardDescription>
        </CardHeader>
        <CardContent>
          {systems.length > 0 ? (
            <div className="space-y-4">
              {systems.map((system) => (
                <Link
                  key={system.id}
                  href={`/systems/${system.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50">
                    <div className="flex-1">
                      <h4 className="font-medium">{system.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {system.description || 'ไม่มีคำอธิบาย'}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FlaskConical className="h-3 w-3" />
                          {system._count.backtests} backtests
                        </span>
                        <Badge variant="outline">{system.type}</Badge>
                        <Badge variant="outline">{system.assetClass}</Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Tag className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">ยังไม่มีระบบที่ใช้ Tag นี้</h3>
              <p className="text-sm text-muted-foreground mb-4">
                ไปที่หน้าระบบเทรดเพื่อเพิ่ม tag ให้กับระบบ
              </p>
              <Link href="/systems">
                <Button variant="outline">
                  <Layers className="mr-2 h-4 w-4" />
                  ดูระบบทั้งหมด
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
