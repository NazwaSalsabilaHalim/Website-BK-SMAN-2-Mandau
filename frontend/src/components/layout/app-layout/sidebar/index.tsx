import { SidebarUserCard } from "@/components/bk/ui";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { API_URL, clearSession, getSession } from "@/lib/bkAuth";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { navItems, othersItems, supportItems } from "./data";
import AppSidebarHeader from "./sidebar-header";
import SidebarNavGroup from "./sidebar-nav-group";
import type { MenuType, NavItem } from "./types";

const menuSections: { type: MenuType; labelKey: string; items: NavItem[] }[] = [
  { type: "main", labelKey: "groups.menu", items: navItems },
  { type: "support", labelKey: "groups.support", items: supportItems },
  { type: "others", labelKey: "groups.others", items: othersItems },
];

const findMatchingSubmenu = (path: string) => {
  for (const section of menuSections) {
    for (let index = 0; index < section.items.length; index++) {
      const nav = section.items[index];
      if (
        nav.subItems?.some(
          (subItem) =>
            subItem.path === path ||
            (subItem.path === "/ai-settings" &&
              path.startsWith("/ai-settings")),
        )
      ) {
        return { type: section.type, index };
      }
    }
  }
  return null;
};

export default function AppSidebar() {
  const { open, isMobile, isHovered } = useSidebar();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const session = getSession();
  const nama = session?.name || "Admin BK";
  const peran = session?.role === "admin" ? "Administrator" : "Guru BK";

  async function handleLogout() {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session?.token ?? ""}`,
        },
      });
    } catch {
      // server mati pun tetap keluar di sisi browser
    }
    clearSession();
    void navigate("/", { replace: true });
  }

  const showContent = open || isHovered || isMobile;

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: MenuType;
    index: number;
  } | null>(() => findMatchingSubmenu(pathname));

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpenSubmenu(findMatchingSubmenu(pathname));
  }

  const handleSubmenuToggle = (index: number, menuType: MenuType) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const activeSections = menuSections.filter(
    (section) => section.items.length > 0,
  );

  return (
    <Sidebar side="left" collapsible="icon">
      <AppSidebarHeader showContent={showContent} />

      <SidebarContent className="adm-sidebar-content">
        <nav className="app-nav p-0 flex-none" aria-label="Menu admin">
          <div className="flex flex-col gap-6">
            {activeSections.map((section) => (
              <SidebarNavGroup
                key={section.type}
                labelKey={section.labelKey}
                menuType={section.type}
                items={section.items}
                openSubmenu={openSubmenu}
                showContent={showContent}
                pathname={pathname}
                onToggleSubmenu={handleSubmenuToggle}
              />
            ))}
          </div>
        </nav>
      </SidebarContent>

      <SidebarFooter className="p-0">
        <SidebarUserCard
          nama={nama}
          peran={peran}
          onLogout={handleLogout}
          showContent={showContent}
        />
      </SidebarFooter>
    </Sidebar>
  );
}