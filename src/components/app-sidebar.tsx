"use client";

import * as React from "react";
import { ScrollText } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { PlaceSwitcher } from "@/components/PlaceSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link } from "react-router";
import { title } from "@/constants";
import { usePlaceContext } from "@/contexts/ActivePlaceContext";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { places } = usePlaceContext();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton asChild>
          <Link to="/" className="flex items-center">
            <ScrollText className="size-4 text-pink-600" />
            <span className="font-semibold">{title}</span>
          </Link>
        </SidebarMenuButton>
        {places.length > 0 && <PlaceSwitcher />}
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
