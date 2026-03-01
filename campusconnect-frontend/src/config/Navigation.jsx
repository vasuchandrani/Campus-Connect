import {
  Home,
  Users,
  Calendar,
  Newspaper,
  FileText,
  Settings,
  UserCircle,
  LayoutDashboard,
  PenSquare,
  BarChart3,
  Megaphone,
  Layers,
} from "lucide-react";

// Student Navigation
export const studentNavItems = [
  { label: "Home", href: "/campus-connect/student/dashboard", icon: Home },
  { label: "Clubs", href: "/campus-connect/student/clubs", icon: Users },
  { label: "Events", href: "/campus-connect/student/events", icon: Calendar },
  { label: "Announcements", href: "/campus-connect/student/announcements", icon: Megaphone },
  { label: "Newspaper", href: "/campus-connect/student/newspaper", icon: Newspaper },
  { label: "Research", href: "/campus-connect/student/research", icon: FileText },
];

// Club Admin Navigation
export const clubAdminNavItems = [
  { label: "Dashboard", href: "/campus-connect/club-admin/:clubId/dashboard", icon: Home },
  { label: "Announcements", href: "/campus-connect/club-admin/:clubId/announcements", icon: Megaphone },
  { label: "Teams", href: "/campus-connect/club-admin/:clubId/teams", icon: Layers },
  { label: "Events", href: "/campus-connect/club-admin/:clubId/events", icon: Calendar },
  { label: "Members", href: "/campus-connect/club-admin/:clubId/members", icon: Users },
  { label: "Settings", href: "/campus-connect/club-admin/:clubId/settings", icon: Settings },
];

// Club Member Navigation
export const clubMemberNavItems = [
  { label: "Dashboard", href: "/campus-connect/club-member/:clubId/dashboard", icon: Home },
  { label: "Announcements", href: "/campus-connect/club-member/:clubId/announcements", icon: Megaphone },
  { label: "Events", href: "/campus-connect/club-member/:clubId/events", icon: Calendar },
  { label: "Teams", href: "/campus-connect/club-member/:clubId/teams", icon: Layers },
  { label: "Members", href: "/campus-connect/club-member/:clubId/members", icon: Users },
];

// Journalist Navigation
export const journalistNavItems = [
  { label: "Dashboard", href: "/campus-connect/journalist-dashboard", icon: LayoutDashboard },
  { label: "My Articles", href: "/campus-connect/journalist-articles", icon: FileText },
  { label: "Write", href: "/campus-connect/journalist-write", icon: PenSquare },
  { label: "Settings", href: "/campus-connect/journalist-settings", icon: Settings },
];

// College Admin Navigation
export const collegeAdminNavItems = [
  { label: "Dashboard", href: "/campus-connect/college-admin/dashboard", icon: Home },
  { label: "Clubs", href: "/campus-connect/college-admin/clubs", icon: Users },
  { label: "Users", href: "/campus-connect/college-admin/users", icon: UserCircle },
  { label: "Newspaper", href: "/campus-connect/college-admin/newspaper", icon: Newspaper },
  { label: "Research", href: "/campus-connect/college-admin/research", icon: FileText },
  { label: "Settings", href: "/campus-connect/college-admin/settings", icon: Settings },
];

// Reviewer Navigation
export const reviewerNavItems = [
  { label: "Dashboard", href: "/campus-connect/reviewer-dashboard", icon: Home },
  { label: "Settings", href: "/campus-connect/reviewer-settings", icon: Settings },
];

// Settings page navigation
export const settingsNavItems = [
  { label: "Home", href: "/campus-connect/dashboard", icon: Home },
  { label: "Settings", href: "/campus-connect/settings", icon: Settings },
];

// Get navigation items based on user role
export const getNavItemsByRole = (role) => {
  switch (role) {
    case "student":
      return studentNavItems;
    case "club_admin":
      return clubAdminNavItems;
    case "club_member":
      return clubMemberNavItems;
    case "journalist":
      return journalistNavItems;
    case "college_admin":
      return collegeAdminNavItems;
    case "reviewer":
      return reviewerNavItems;
    default:
      return studentNavItems;
  }
};