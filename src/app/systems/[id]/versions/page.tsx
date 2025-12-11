"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, GitBranch, Calendar, TrendingUp, TrendingDown, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSystemVersions, deleteSystemVersion } from "@/app/versions/actions";
import { CreateVersionDialog } from "@/components/versions/create-version-dialog";
import { EditVersionDialog } from "@/components/versions/edit-version-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface SystemVersion {
  id: string;
  versionNumber: string;
  changelog: string | null;
  winRate: number | null;
  profitFactor: number | null;
  maxDrawdown: number | null;
  totalTrades: number | null;
  netProfit: number | null;
  isActive: boolean;
  createdAt: Date;
}

interface System {
  id: string;
  name: string;
  versions: SystemVersion[];
}

export default function SystemVersionsPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = use(params);
  const [system, setSystem] = useState<System | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editVersion, setEditVersion] = useState<SystemVersion | null>(null);

  const loadVersions = async () => {
    try {
      const result = await getSystemVersions(resolvedParams.id);
      if (result.success && result.data) {
        setSystem(result.data as unknown as System);
      }
    } catch (error) {
      console.error("Failed to load versions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.id]);

  const handleDelete = async (versionId: string) => {
    try {
      const result = await deleteSystemVersion(versionId);
      if (result.success) {
        loadVersions();
      } else {
        alert(result.error || "ไม่สามารถลบ Version ได้");
      }
    } catch (error) {
      console.error("Failed to delete version:", error);
      alert("ไม่สามารถลบ Version ได้");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">กำลังโหลด...</div>
        </div>
      </div>
    );
  }

  if (!system) {
    return (
      <div className="flex-1 p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">ไม่พบระบบนี้</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/systems/${resolvedParams.id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <GitBranch className="h-8 w-8" />
              Version History
            </h1>
            <p className="text-muted-foreground">
              {system.name}
            </p>
          </div>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          สร้าง Version ใหม่
        </Button>
      </div>

      {/* Version Timeline */}
      {system.versions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">ยังไม่มี Version</h3>
            <p className="text-sm text-muted-foreground mb-4">
              เริ่มสร้าง version แรกเพื่อติดตามการพัฒนาของระบบ
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              สร้าง Version แรก
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {system.versions.map((version, index) => (
            <Card key={version.id} className={version.isActive ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${version.isActive ? "bg-green-500" : "bg-muted"}`} />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        v{version.versionNumber}
                        {version.isActive && (
                          <Badge variant="default" className="text-xs">
                            Active
                          </Badge>
                        )}
                        {index === 0 && (
                          <Badge variant="secondary" className="text-xs">
                            Latest
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(version.createdAt).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditVersion(version)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>ยืนยันการลบ</AlertDialogTitle>
                          <AlertDialogDescription>
                            คุณต้องการลบ Version {version.versionNumber} หรือไม่? 
                            การกระทำนี้ไม่สามารถย้อนกลับได้
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(version.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            ลบ
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Changelog */}
                {version.changelog && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm whitespace-pre-wrap">{version.changelog}</p>
                  </div>
                )}

                {/* Stats Grid */}
                {(version.winRate !== null || version.profitFactor !== null || 
                  version.maxDrawdown !== null || version.totalTrades !== null || 
                  version.netProfit !== null) && (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {version.winRate !== null && (
                      <div className="text-center p-2 bg-muted/30 rounded-lg">
                        <div className="text-xs text-muted-foreground">Win Rate</div>
                        <div className="text-lg font-semibold">{version.winRate.toFixed(1)}%</div>
                      </div>
                    )}
                    {version.profitFactor !== null && (
                      <div className="text-center p-2 bg-muted/30 rounded-lg">
                        <div className="text-xs text-muted-foreground">Profit Factor</div>
                        <div className="text-lg font-semibold">{version.profitFactor.toFixed(2)}</div>
                      </div>
                    )}
                    {version.maxDrawdown !== null && (
                      <div className="text-center p-2 bg-muted/30 rounded-lg">
                        <div className="text-xs text-muted-foreground">Max DD</div>
                        <div className="text-lg font-semibold text-red-500">
                          -{version.maxDrawdown.toFixed(1)}%
                        </div>
                      </div>
                    )}
                    {version.totalTrades !== null && (
                      <div className="text-center p-2 bg-muted/30 rounded-lg">
                        <div className="text-xs text-muted-foreground">Trades</div>
                        <div className="text-lg font-semibold">{version.totalTrades}</div>
                      </div>
                    )}
                    {version.netProfit !== null && (
                      <div className="text-center p-2 bg-muted/30 rounded-lg">
                        <div className="text-xs text-muted-foreground">Net Profit</div>
                        <div className={`text-lg font-semibold flex items-center justify-center gap-1 ${
                          version.netProfit >= 0 ? "text-green-500" : "text-red-500"
                        }`}>
                          {version.netProfit >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          ${Math.abs(version.netProfit).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateVersionDialog
        systemId={resolvedParams.id}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadVersions}
      />

      {editVersion && (
        <EditVersionDialog
          version={editVersion}
          open={!!editVersion}
          onOpenChange={(open: boolean) => !open && setEditVersion(null)}
          onSuccess={loadVersions}
        />
      )}
    </div>
  );
}
