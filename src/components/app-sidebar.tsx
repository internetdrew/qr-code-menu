"use client";

import * as React from "react";
import { UtensilsCrossed } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { RestaurantSwitcher } from "@/components/RestaurantSwitcher";
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
import { useRestaurantContext } from "@/contexts/ActiveRestaurantContext";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { restaurants } = useRestaurantContext();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton asChild>
          <Link to="/" className="flex items-center">
            <UtensilsCrossed className="size-4 text-pink-600" />
            <span className="font-semibold">{title}</span>
          </Link>
        </SidebarMenuButton>
        {restaurants.length > 0 && <RestaurantSwitcher />}
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
