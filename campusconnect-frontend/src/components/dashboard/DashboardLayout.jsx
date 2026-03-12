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
  Home,
  Bell,
  Menu,
  Settings,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Toaster } from "../ui/Toaster";

const DashboardLayout = ({ children, navItems, title, bell=false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleBellClick = () => {
    navigate("/campus-connect/student/notifications");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <a href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">
                Campus<span className="text-primary">Connect</span>
              </span>
            </a>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    navigate(item.href);
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
                <p className="font-medium text-sm truncate">{user?.name}</p>
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
      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-semibold">{title}</h1>
            </div>

            <div className="flex items-center gap-3">
              {bell &&<Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={handleBellClick}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
              </Button>
}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive"
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
        <main className="p-4 md:p-6">{children}</main>
<Toaster />  
      </div>
    </div>
  );
};

export default DashboardLayout;
