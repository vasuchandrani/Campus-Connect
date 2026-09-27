import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/Button";
import { Avatar, AvatarFallback } from "../ui/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";
import {
  GraduationCap,
  Bell,
  Menu,
  X,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { useState } from "react";
import { toast } from "../../hooks/use-toast";
import SubDashboardLoginDialog from "./SubDashboardLoginDialog";

const DashboardLayout = ({ children, navItems = [], title, bell = false, clubId }) => {
  const { user, logout, returnToStudent, returnToProfessor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Return to parent session state (for sub-dashboard roles)
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnLoading, setReturnLoading] = useState(false);
  const [returnError, setReturnError] = useState("");

  const currentRole = (localStorage.getItem("role") || user?.role || "").toUpperCase();
  const isMentorSubRole = currentRole === "CLUB_MENTOR" || currentRole === "MENTOR";
  const isStudentSubRole = ["JOURNALIST", "CLUB_ADMIN", "CLUB_MEMBER"].includes(currentRole);
  const isSubDashboardRole = isMentorSubRole || isStudentSubRole;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleBellClick = () => {
    navigate("/campus-connect/student/notifications");
  };

  const handleReturnSession = async (password) => {
    setReturnLoading(true);
    setReturnError("");
    try {
      if (isMentorSubRole) {
        const redirectUrl = await returnToProfessor(password);
        toast({
          title: "Session Swapped",
          description: "Welcome back to your Professor Dashboard!",
          variant: "success",
        });
        setReturnDialogOpen(false);
        navigate(redirectUrl, { replace: true });
      } else {
        const redirectUrl = await returnToStudent(password);
        toast({
          title: "Session Swapped",
          description: "Welcome back to your Student Dashboard!",
          variant: "success",
        });
        setReturnDialogOpen(false);
        navigate(redirectUrl, { replace: true });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        (isMentorSubRole
          ? "Invalid password. Please verify your professor password."
          : "Invalid password. Please verify your student password.");
      setReturnError(msg);
      toast({
        title: "Verification Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo + Mobile Close */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-xs">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Campus<span className="text-primary">Connect</span>
              </span>
            </a>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const resolvedHref = clubId
                ? item.href.replace(':clubId', clubId)
                : item.href;
              const isActive = location.pathname === resolvedHref;
              return (
                <button
                  key={resolvedHref}
                  onClick={() => {
                    navigate(resolvedHref);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user?.name || user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="lg:pl-64 flex-1 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/80 supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-5 gap-2 max-w-full">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 shrink-0 text-muted-foreground hover:text-foreground"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-sm sm:text-base md:text-lg font-bold truncate tracking-tight text-foreground select-none">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* Sub-dashboard exit to student session button */}
              {isSubDashboardRole && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setReturnError("");
                      setReturnDialogOpen(true);
                    }}
                    className="sm:hidden h-8 w-8 border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 text-primary shadow-xs shrink-0 rounded-lg"
                    title={isMentorSubRole ? "Return to Professor Dashboard" : "Return to Student Dashboard"}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReturnError("");
                      setReturnDialogOpen(true);
                    }}
                    className="hidden sm:inline-flex h-8.5 px-3 text-xs font-semibold border-primary/30 hover:border-primary/60 bg-primary/5 hover:bg-primary/10 text-foreground gap-1.5 shrink-0 shadow-xs rounded-lg"
                    title={isMentorSubRole ? "Return to Professor Dashboard" : "Return to Student Dashboard"}
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-primary" />
                    <span>{isMentorSubRole ? "Back to Professor" : "Back to Student"}</span>
                  </Button>
                </>
              )}

              {bell && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 sm:h-9 sm:w-9"
                  onClick={handleBellClick}
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground hover:text-foreground" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full">
                    <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs sm:text-sm">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-3.5 sm:p-5 md:p-6 w-full max-w-full min-w-0 overflow-x-hidden flex-1">{children}</main>
      </div>

      {/* Sub-Dashboard Return Dialog */}
      <SubDashboardLoginDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        title={isMentorSubRole ? "Return to Professor Dashboard" : "Return to Student Dashboard"}
        description={
          isMentorSubRole
            ? "Enter your registered professor account password to verify and restore your professor session."
            : "Enter your registered student password to verify and restore your student session."
        }
        icon={GraduationCap}
        onSubmit={handleReturnSession}
        loading={returnLoading}
        error={returnError}
      />
    </div>
  );
};

export default DashboardLayout;
