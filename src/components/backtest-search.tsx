"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface TradingSystem {
  id: string;
  name: string;
}

interface BacktestSearchProps {
  systems: TradingSystem[];
}

export function BacktestSearch({ systems }: BacktestSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [systemId, setSystemId] = useState(searchParams.get("system") || "all");
  const [minWinRate, setMinWinRate] = useState(searchParams.get("minWinRate") || "");
  const [minPF, setMinPF] = useState(searchParams.get("minPF") || "");
  const [profitable, setProfitable] = useState(searchParams.get("profitable") || "all");

  // Count active filters
  const activeFilters = [
    systemId !== "all",
    minWinRate !== "",
    minPF !== "",
    profitable !== "all",
  ].filter(Boolean).length;

  const updateURL = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (systemId !== "all") params.set("system", systemId);
    if (minWinRate) params.set("minWinRate", minWinRate);
    if (minPF) params.set("minPF", minPF);
    if (profitable !== "all") params.set("profitable", profitable);

    const queryString = params.toString();
    router.push(`/backtests${queryString ? `?${queryString}` : ""}`);
  };

  const clearFilters = () => {
    setSearch("");
    setSystemId("all");
    setMinWinRate("");
    setMinPF("");
    setProfitable("all");
    router.push("/backtests");
  };

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      updateURL();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by symbol, system, or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            onClick={() => setSearch("")}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFilters > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFilters}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <h4 className="font-medium">Filter Backtests</h4>

            {/* System Filter */}
            <div className="space-y-2">
              <Label>Trading System</Label>
              <Select value={systemId} onValueChange={setSystemId}>
                <SelectTrigger>
                  <SelectValue placeholder="All Systems" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Systems</SelectItem>
                  {systems.map((system) => (
                    <SelectItem key={system.id} value={system.id}>
                      {system.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Profitable Filter */}
            <div className="space-y-2">
              <Label>Profitability</Label>
              <Select value={profitable} onValueChange={setProfitable}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="yes">Profitable Only</SelectItem>
                  <SelectItem value="no">Losing Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Min Win Rate */}
            <div className="space-y-2">
              <Label>Minimum Win Rate (%)</Label>
              <Input
                type="number"
                placeholder="e.g., 50"
                value={minWinRate}
                onChange={(e) => setMinWinRate(e.target.value)}
              />
            </div>

            {/* Min Profit Factor */}
            <div className="space-y-2">
              <Label>Minimum Profit Factor</Label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g., 1.5"
                value={minPF}
                onChange={(e) => setMinPF(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex-1"
              >
                Clear All
              </Button>
              <Button size="sm" onClick={updateURL} className="flex-1">
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
