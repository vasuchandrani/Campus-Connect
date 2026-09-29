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
  Megaphone,
  Layers,
  GraduationCap,
  CheckSquare,
} from "lucide-react";

// Student Navigation
export const studentNavItems = [
  { label: "Dashboard", href: "/campus-connect/student/dashboard", icon: LayoutDashboard },
  { label: "Clubs", href: "/campus-connect/student/clubs", icon: Users },
  { label: "Events", href: "/campus-connect/student/events", icon: Calendar },
  { label: "Announcements", href: "/campus-connect/student/announcements", icon: Megaphone },
  { label: "Newspaper", href: "/campus-connect/student/newspaper", icon: Newspaper },
  { label: "Research", href: "/campus-connect/student/research", icon: FileText },
  { label: "Settings", href: "/campus-connect/student/settings", icon: Settings },
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

// Club Mentor Navigation
export const clubMentorNavItems = [
  { label: "Dashboard", href: "/campus-connect/professor/clubs/:clubId/mentor-dashboard", icon: LayoutDashboard },
  { label: "Announcements", href: "/campus-connect/professor/clubs/:clubId/mentor-dashboard/announcements", icon: Megaphone },
  { label: "Events", href: "/campus-connect/professor/clubs/:clubId/mentor-dashboard/events", icon: Calendar },
  { label: "Members", href: "/campus-connect/professor/clubs/:clubId/mentor-dashboard/members", icon: Users },
  { label: "Teams", href: "/campus-connect/professor/clubs/:clubId/mentor-dashboard/teams", icon: Layers },
  { label: "Settings", href: "/campus-connect/professor/clubs/:clubId/mentor-dashboard/settings", icon: Settings },
];

// Journalist Navigation
export const journalistNavItems = [
  { label: "Dashboard", href: "/campus-connect/journalist/dashboard", icon: LayoutDashboard },
  { label: "My Articles", href: "/campus-connect/journalist/articles", icon: FileText },
  { label: "Write", href: "/campus-connect/journalist/write", icon: PenSquare },
  { label: "Settings", href: "/campus-connect/journalist/settings", icon: Settings },
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

// Professor Navigation
export const professorNavItems = [
  { label: "Dashboard", href: "/campus-connect/professor/dashboard", icon: LayoutDashboard },
  { label: "Clubs", href: "/campus-connect/professor/clubs", icon: Users },
  { label: "Events", href: "/campus-connect/professor/events", icon: Calendar },
  { label: "Announcements", href: "/campus-connect/professor/announcements", icon: Megaphone },
  { label: "Newspaper", href: "/campus-connect/professor/newspaper", icon: Newspaper },
  { label: "Research", href: "/campus-connect/professor/research", icon: GraduationCap },
  { label: "Review", href: "/campus-connect/professor/review", icon: CheckSquare },
  { label: "Settings", href: "/campus-connect/professor/settings", icon: Settings },
];



// Get navigation items based on user role
export const getNavItemsByRole = (role) => {
  switch ((role || "").toLowerCase()) {
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
    case "professor":
      return professorNavItems;
    case "club_mentor":
    case "mentor":
      return clubMentorNavItems;
    default:
      return studentNavItems;
  }
};