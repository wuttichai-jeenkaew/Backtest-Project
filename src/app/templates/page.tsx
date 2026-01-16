import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
  Copy,
} from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteTemplateButton } from "@/components/templates/delete-template-button";

async function getTemplates() {
  const templates = await prisma.backtestTemplate.findMany({
    include: {
      system: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { usageCount: "desc" },
  });

  return templates.map((t) => ({
    ...t,
    startingCapital: t.startingCapital ? Number(t.startingCapital) : null,
    commission: t.commission ? Number(t.commission) : null,
    slippage: t.slippage ? Number(t.slippage) : null,
  }));
}

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Backtest Templates
          </h1>
          <p className="text-muted-foreground">
            สร้าง Template เพื่อลดเวลาในการกรอกข้อมูล Backtest ซ้ำๆ
          </p>
        </div>
        <Link href="/templates/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            สร้าง Template
          </Button>
        </Link>
      </div>

      {/* Templates Grid */}
      {templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">ยังไม่มี Template</h3>
            <p className="text-sm text-muted-foreground mb-4">
              สร้าง Template เพื่อลดเวลาในการกรอกข้อมูล
            </p>
            <Link href="/templates/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                สร้าง Template แรก
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  {template.description && (
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <Link href={`/templates/${template.id}/edit`}>
                      <DropdownMenuItem>
                        <Pencil className="h-4 w-4 mr-2" />
                        แก้ไข
                      </DropdownMenuItem>
                    </Link>
                    <Link href={`/backtests/create?templateId=${template.id}`}>
                      <DropdownMenuItem>
                        <Copy className="h-4 w-4 mr-2" />
                        ใช้ Template นี้
                      </DropdownMenuItem>
                    </Link>
                    <DeleteTemplateButton
                      templateId={template.id}
                      templateName={template.name}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* System */}
                  {template.system && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        ระบบ:
                      </span>
                      <Badge variant="secondary">{template.system.name}</Badge>
                    </div>
                  )}

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {template.symbol && (
                      <div>
                        <span className="text-muted-foreground">Symbol: </span>
                        <span className="font-medium">{template.symbol}</span>
                      </div>
                    )}
                    {template.startingCapital && (
                      <div>
                        <span className="text-muted-foreground">Capital: </span>
                        <span className="font-medium">
                          ${template.startingCapital.toLocaleString()}
                        </span>
                      </div>
                    )}
                    {template.dataSource && (
                      <div>
                        <span className="text-muted-foreground">Source: </span>
                        <span className="font-medium">
                          {template.dataSource}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Usage count */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-xs text-muted-foreground">
                      ใช้งาน {template.usageCount} ครั้ง
                    </span>
                    <Link href={`/backtests/create?templateId=${template.id}`}>
                      <Button size="sm" variant="outline">
                        <Copy className="h-3 w-3 mr-1" />
                        ใช้ Template
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
