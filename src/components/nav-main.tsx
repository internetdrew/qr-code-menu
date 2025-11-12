import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useRestaurantContext } from "@/contexts/ActiveRestaurantContext";
import { ScrollText, Settings } from "lucide-react";
import { Link } from "react-router";

const navItems = [
  { title: "Menu", url: "/dashboard/menu", icon: ScrollText },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function NavMain() {
  const { restaurants } = useRestaurantContext();
  const { setOpenMobile } = useSidebar();

  if (!restaurants.length) {
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
