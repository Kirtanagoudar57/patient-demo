import { LayoutDashboard, Settings, UserCircle, Users, Stethoscope, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const NAV_SECTIONS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", to: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Manage",
    items: [
      { label: "Patients", to: "/patients", icon: Stethoscope },
      { label: "Users", to: "/users", icon: Users },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Profile", to: "/profile", icon: UserCircle },
      { label: "Settings", to: "/settings", icon: Settings },
    ],
  },
];

// Human-readable names for URL segments, used by the breadcrumbs.
export const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  patients: "Patients",
  users: "Users",
  profile: "Profile",
  settings: "Settings",
};
