"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  GitCompare,
  FlaskConical,
  TrendingUp,
  BookOpen,
  Tag,
  BarChart3,
  Calculator,
  Target,
  FileText,
  StickyNote,
  CalendarDays,
  LineChart,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Trading Systems",
    url: "/systems",
    icon: TrendingUp,
  },
  {
    title: "Backtests",
    url: "/backtests",
    icon: FlaskConical,
  },
  {
    title: "Charts",
    url: "/charts",
    icon: LineChart,
  },
  {
    title: "Trade Journal",
    url: "/journal",
    icon: BookOpen,
  },
  {
    title: "Calendar",
    url: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Tags",
    url: "/tags",
    icon: Tag,
  },
  {
    title: "Statistics",
    url: "/statistics",
    icon: BarChart3,
  },
  {
    title: "Calculator",
    url: "/calculator",
    icon: Calculator,
  },
  {
    title: "Goals",
    url: "/goals",
    icon: Target,
  },
  {
    title: "Templates",
    url: "/templates",
    icon: FileText,
  },
  {
    title: "Notes",
    url: "/notes",
    icon: StickyNote,
  },
];

const compareSubItems = [
  { title: "Backtests", url: "/compare" },
  { title: "Systems", url: "/compare/systems" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Backtest Tracker</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      pathname === item.url ||
                      (item.url !== "/" && pathname.startsWith(item.url))
                    }
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {/* Compare with submenu */}
              <Collapsible
                asChild
                defaultOpen={pathname.startsWith("/compare")}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      isActive={pathname.startsWith("/compare")}
                    >
                      <GitCompare className="h-4 w-4" />
                      <span>Compare</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {compareSubItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === subItem.url}
                          >
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/settings"}>
              <Link href="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
