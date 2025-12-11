import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <>
      <Header title="Settings" />
      <div className="flex flex-1 flex-col gap-4 p-4 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Application Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Settings page coming soon. Future features:
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
              <li>Default currency</li>
              <li>Date format preferences</li>
              <li>Default starting capital</li>
              <li>Theme preferences</li>
              <li>Export/Import data</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              <strong>Backtest Tracker</strong> - Trading System Analysis Tool
            </p>
            <p className="text-sm text-muted-foreground">
              Record, analyze, and compare your trading system backtests to find
              the most effective strategies.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Built with Next.js, Prisma, and Supabase PostgreSQL
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
