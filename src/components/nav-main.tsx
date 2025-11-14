import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { usePlaceContext } from "@/contexts/ActivePlaceContext";
import { Box, ScrollText, Settings } from "lucide-react";
import { Link } from "react-router";

const navItems = [
  { title: "Items", url: "/dashboard/items", icon: Box },
  { title: "Menu", url: "/dashboard/menu", icon: ScrollText },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function NavMain() {
  const { places } = usePlaceContext();
  const { setOpenMobile } = useSidebar();

  if (!places.length) {
    return null;
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Manage</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {navItems?.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link to={item.url} onClick={() => setOpenMobile(false)}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
