import React, { useState } from "react";
import {
  GraduationCap, Bell, Menu, X, ArrowLeft, Calendar, Building2,
  BookOpen, Users, ArrowUpRight, ArrowRight, Shield, Plus, Clock,
  Crown, User, PenTool, Eye, Megaphone, LayoutDashboard,
  Newspaper, Settings, Search, Download, Lock, Trash2, Send,
  UserPlus, Globe, Upload, CheckCircle, Key, Flame, CheckSquare, ChevronDown, Check,
  MoreVertical, Mail, CreditCard, FileText
} from "lucide-react";
import { Card, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Avatar, AvatarFallback } from "../ui/Avatar";

const DemoPreview = () => {
  const [activeRole, setActiveRole] = useState("student"); // student | club_admin | club_member
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | events | announcements | clubs | club_detail | newspaper | research | settings | teams | members
  const [activeClub, setActiveClub] = useState(null);

  const handleRoleChange = (role) => {
    setActiveRole(role);
    setActiveTab("dashboard");
    setActiveClub(null);
  };

  const navigateTo = (tab, club = null) => {
    setActiveTab(tab);
    if (club) setActiveClub(club);
  };

  let navItems = [];
  if (activeRole === "student") {
    navItems = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "clubs", label: "Clubs", icon: Users },
      { id: "events", label: "Events", icon: Calendar },
      { id: "announcements", label: "Announcements", icon: Megaphone },
      { id: "newspaper", label: "Newspaper", icon: Newspaper },
      { id: "research", label: "Research", icon: BookOpen },
      { id: "settings", label: "Settings", icon: Settings },
    ];
  } else if (activeRole === "club_admin") {
    navItems = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "announcements", label: "Announcements", icon: Megaphone },
      { id: "teams", label: "Teams", icon: Shield },
      { id: "events", label: "Events", icon: Calendar },
      { id: "members", label: "Members", icon: Users },
      { id: "settings", label: "Settings", icon: Settings },
    ];
  } else if (activeRole === "club_member") {
    navItems = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "announcements", label: "Announcements", icon: Megaphone },
      { id: "events", label: "Events", icon: Calendar },
      { id: "teams", label: "Teams", icon: Shield },
      { id: "members", label: "Members", icon: Users },
    ];
  } else if (activeRole === "journalist") {
    navItems = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "articles", label: "My Articles", icon: Newspaper },
      { id: "write", label: "Write", icon: PenTool },
      { id: "settings", label: "Settings", icon: Settings },
    ];
  } else if (activeRole === "professor") {
    navItems = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "clubs", label: "Clubs", icon: Users },
      { id: "events", label: "Events", icon: Calendar },
      { id: "announcements", label: "Announcements", icon: Megaphone },
      { id: "newspaper", label: "Newspaper", icon: Newspaper },
      { id: "research", label: "Research", icon: BookOpen },
      { id: "review", label: "Review", icon: CheckCircle },
      { id: "settings", label: "Settings", icon: Settings },
    ];
  } else if (activeRole === "club_mentor") {
    navItems = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "announcements", label: "Announcements", icon: Megaphone },
      { id: "events", label: "Events", icon: Calendar },
      { id: "members", label: "Members", icon: Users },
      { id: "teams", label: "Teams", icon: Shield },
      { id: "settings", label: "Settings", icon: Settings },
    ];
  } else if (activeRole === "college_admin") {
    navItems = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "clubs", label: "Clubs", icon: Users },
      { id: "users", label: "Users", icon: User },
      { id: "newspaper", label: "Newspaper", icon: Newspaper },
      { id: "research", label: "Research", icon: BookOpen },
      { id: "settings", label: "Settings", icon: Settings },
    ];
  }

  const displayTab = activeTab === "club_detail" ? "clubs" : activeTab;

  return (
    <div className="w-full flex flex-col items-center animate-fade-in" style={{ animationDelay: "0.5s" }}>
      <div className="flex flex-col items-center gap-3 mb-8 bg-card/60 backdrop-blur-md p-2 rounded-2xl border border-border shadow-soft">
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant={activeRole === "student" ? "default" : "ghost"}
            className={`rounded-xl px-4 md:px-6 text-sm ${activeRole !== "student" && "hover:bg-muted"}`}
            onClick={() => handleRoleChange("student")}
          >
            <GraduationCap className="w-4 h-4 mr-2" /> Student View
          </Button>
          <Button
            variant={activeRole === "club_member" ? "default" : "ghost"}
            className={`rounded-xl px-4 md:px-6 text-sm ${activeRole !== "club_member" && "hover:bg-muted"}`}
            onClick={() => handleRoleChange("club_member")}
          >
            <User className="w-4 h-4 mr-2" /> Club Member View
          </Button>
          <Button
            variant={activeRole === "club_admin" ? "default" : "ghost"}
            className={`rounded-xl px-4 md:px-6 text-sm ${activeRole !== "club_admin" && "hover:bg-muted"}`}
            onClick={() => handleRoleChange("club_admin")}
          >
            <Crown className="w-4 h-4 mr-2" /> Club Admin View
          </Button>
          <Button
            variant={activeRole === "journalist" ? "default" : "ghost"}
            className={`rounded-xl px-4 md:px-6 text-sm ${activeRole !== "journalist" && "hover:bg-muted"}`}
            onClick={() => handleRoleChange("journalist")}
          >
            <Newspaper className="w-4 h-4 mr-2" /> Journalist View
          </Button>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            variant={activeRole === "professor" ? "default" : "ghost"}
            className={`rounded-xl px-4 md:px-6 text-sm ${activeRole !== "professor" && "hover:bg-muted"}`}
            onClick={() => handleRoleChange("professor")}
          >
            <BookOpen className="w-4 h-4 mr-2" /> Professor View
          </Button>
          <Button
            variant={activeRole === "club_mentor" ? "default" : "ghost"}
            className={`rounded-xl px-4 md:px-6 text-sm ${activeRole !== "club_mentor" && "hover:bg-muted"}`}
            onClick={() => handleRoleChange("club_mentor")}
          >
            <Shield className="w-4 h-4 mr-2" /> Mentor View
          </Button>
          <Button
            variant={activeRole === "college_admin" ? "default" : "ghost"}
            className={`rounded-xl px-4 md:px-6 text-sm ${activeRole !== "college_admin" && "hover:bg-muted"}`}
            onClick={() => handleRoleChange("college_admin")}
          >
            <Building2 className="w-4 h-4 mr-2" /> College Admin
          </Button>
        </div>
      </div>

      <div className="w-full max-w-[1400px] aspect-[16/10] bg-background rounded-[2rem] border-[12px] border-muted shadow-2xl overflow-hidden flex flex-col relative group">

        {/* Fake Browser Top Bar */}
        <div className="h-12 bg-muted/80 border-b border-border flex items-center px-4 gap-4 shrink-0">
          <div className="flex gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-destructive/80 shadow-sm" />
            <div className="w-3.5 h-3.5 rounded-full bg-amber-400/80 shadow-sm" />
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/80 shadow-sm" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-background/90 h-7 w-64 md:w-[400px] rounded-md text-xs flex items-center justify-center text-muted-foreground font-mono shadow-sm border border-border/50 truncate px-2">
              campusconnect.edu/demo/{activeRole.replace('_', '-')}/{activeTab === "dashboard" ? "1/dashboard" : activeTab}
            </div>
          </div>
        </div>

        {/* Dashboard Layout Simulation */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-card border-r border-border flex flex-col hidden md:flex shrink-0">
            <div className="p-5 border-b border-border flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-xs shrink-0">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg tracking-tight">Campus<span className="text-primary">Connect</span></span>
            </div>

            <div className="p-4 space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${displayTab === item.id
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="p-4 border-t border-border flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                  {activeRole === "student" ? "S" : activeRole === "club_member" ? "M" : activeRole === "journalist" ? "J" : activeRole === "professor" ? "P" : activeRole === "club_mentor" ? "M" : activeRole === "college_admin" ? "A" : "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-medium text-sm truncate">
                  {activeRole === "student" ? "Demo Student" : activeRole === "club_member" ? "Club Member User" : activeRole === "journalist" ? "Demo Journalist" : activeRole === "professor" ? "Prof. Alex" : activeRole === "club_mentor" ? "Demo Mentor" : activeRole === "college_admin" ? "Admin Officer" : "Admin User"}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {activeRole.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-background flex flex-col overflow-y-auto w-full relative" id="demo-scroll-area">
            <header className="h-16 border-b border-border/80 flex items-center justify-between px-6 shrink-0 bg-background/95 sticky top-0 z-50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <Menu className="w-5 h-5 text-muted-foreground md:hidden" />
                <h1 className="font-bold text-lg capitalize">
                  {activeRole === "club_member" && activeTab === "dashboard" ? "Club Member Portal" : activeRole === "club_mentor" && activeTab === "dashboard" ? "Data Science Society Mentor Portal" : activeTab === "club_detail" ? "Clubs" : activeTab}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {activeRole === "club_member" && (
                  <Button variant="outline" size="sm" className="hidden sm:flex text-emerald-600 border-emerald-500/30 hover:bg-emerald-50" onClick={() => handleRoleChange("student")}>
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Student
                  </Button>
                )}
                {activeRole === "club_mentor" && (
                  <Button variant="outline" size="sm" className="hidden sm:flex text-emerald-600 border-emerald-500/30 hover:bg-emerald-50" onClick={() => handleRoleChange("professor")}>
                    <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Professor
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full relative">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background"></span>
                </Button>
                <Avatar className="w-8 h-8 md:hidden">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                    {activeRole === "student" ? "S" : "A"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </header>

            <div className="p-6 pb-20">
              {activeRole === "student" && activeTab === "dashboard" && <StudentDashboardDemo onNavigate={navigateTo} />}
              {activeRole === "student" && activeTab === "announcements" && <AnnouncementsDemo role="student" />}
              {activeRole === "student" && activeTab === "events" && <EventsDemo role="student" />}
              {activeRole === "student" && activeTab === "clubs" && <ClubsDemo onSelectClub={(c) => navigateTo("club_detail", c)} role={activeRole} />}
              {activeRole === "student" && activeTab === "club_detail" && <ClubDetailDemo club={activeClub} onBack={() => navigateTo("clubs")} />}
              {activeRole === "student" && activeTab === "newspaper" && <NewspaperDemo />}
              {activeRole === "student" && activeTab === "research" && <ResearchDemo />}
              {activeRole === "student" && activeTab === "settings" && <SettingsDemo />}

              {activeRole === "club_admin" && activeTab === "dashboard" && <ClubAdminDashboardDemo onNavigate={navigateTo} />}
              {activeRole === "club_admin" && activeTab === "announcements" && <ClubMemberAnnouncementsDemo />}
              {activeRole === "club_admin" && activeTab === "teams" && <ClubAdminTeamsDemo />}
              {activeRole === "club_admin" && activeTab === "events" && <ClubMemberEventsDemo />}
              {activeRole === "club_admin" && activeTab === "members" && <ClubAdminMembersDemo />}
              {activeRole === "club_admin" && activeTab === "settings" && <ClubAdminSettingsDemo />}

              {activeRole === "club_member" && activeTab === "dashboard" && <ClubMemberDashboardDemo onNavigate={navigateTo} />}
              {activeRole === "club_member" && activeTab === "announcements" && <ClubMemberAnnouncementsDemo />}
              {activeRole === "club_member" && activeTab === "events" && <ClubMemberEventsDemo />}
              {activeRole === "club_member" && activeTab === "teams" && <ClubMemberTeamsDemo />}
              {activeRole === "club_member" && activeTab === "members" && <ClubMemberMembersDemo />}

              {activeRole === "journalist" && activeTab === "dashboard" && <JournalistDashboardDemo onNavigate={navigateTo} />}
              {activeRole === "journalist" && activeTab === "articles" && <JournalistArticlesDemo onNavigate={navigateTo} />}
              {activeRole === "journalist" && activeTab === "write" && <JournalistWriteDemo onNavigate={navigateTo} />}
              {activeRole === "journalist" && activeTab === "settings" && <JournalistSettingsDemo />}

              {activeRole === "professor" && activeTab === "dashboard" && <ProfessorDashboardDemo />}
              {activeRole === "professor" && activeTab === "clubs" && <ClubsDemo onSelectClub={(c) => navigateTo("club_detail", c)} role={activeRole} />}
              {activeRole === "professor" && activeTab === "club_detail" && <ClubDetailDemo club={activeClub} onBack={() => navigateTo("clubs")} />}
              {activeRole === "professor" && activeTab === "events" && <EventsDemo role="professor" />}
              {activeRole === "professor" && activeTab === "announcements" && <AnnouncementsDemo role="professor" />}
              {activeRole === "professor" && activeTab === "newspaper" && <NewspaperDemo />}
              {activeRole === "professor" && activeTab === "research" && <ResearchDemo />}
              {activeRole === "professor" && activeTab === "review" && <ProfessorReviewDemo />}
              {activeRole === "professor" && activeTab === "settings" && <SettingsDemo />}

              {activeRole === "club_mentor" && activeTab === "dashboard" && <ClubMentorDashboardDemo />}
              {activeRole === "club_mentor" && activeTab === "announcements" && <ClubMemberAnnouncementsDemo />}
              {activeRole === "club_mentor" && activeTab === "events" && <ClubMemberEventsDemo />}
              {activeRole === "club_mentor" && activeTab === "members" && <ClubAdminMembersDemo />}
              {activeRole === "club_mentor" && activeTab === "teams" && <ClubAdminTeamsDemo />}
              {activeRole === "club_mentor" && activeTab === "settings" && <ClubMentorSettingsDemo />}

              {activeRole === "college_admin" && activeTab === "dashboard" && <CollegeAdminDashboardDemo />}
              {activeRole === "college_admin" && activeTab === "clubs" && <CollegeAdminClubsDemo />}
              {activeRole === "college_admin" && activeTab === "users" && <CollegeAdminUsersDemo />}
              {activeRole === "college_admin" && activeTab === "newspaper" && <CollegeAdminNewspaperDemo />}
              {activeRole === "college_admin" && activeTab === "research" && <CollegeAdminResearchDemo />}
              {activeRole === "college_admin" && activeTab === "settings" && <CollegeAdminSettingsDemo />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StudentDashboardDemo = ({ onNavigate }) => {
  const handleNav = (tab, club = null) => {
    document.getElementById("demo-scroll-area")?.scrollTo(0, 0);
    onNavigate(tab, club);
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 shadow-xs">
        <Badge variant="outline" className="text-[11px] font-semibold border-primary/20 bg-primary/10 text-primary uppercase tracking-wider mb-3">
          Student Portal
        </Badge>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
          Welcome back, Demo Student!
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
          Access your student leadership positions, discover campus organizations, and follow live university events.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Upcoming Events", val: "3", icon: Calendar, color: "text-blue-500 bg-blue-500/10 border-blue-500/20", route: "events" },
          { label: "Clubs in College", val: "12", icon: Building2, color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20", route: "clubs" },
          { label: "My Research", val: "2", icon: BookOpen, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", route: "research" },
          { label: "Joined Clubs", val: "1", icon: Users, color: "text-amber-500 bg-amber-500/10 border-amber-500/20", route: "clubs" }
        ].map((stat, i) => (
          <Card key={i} onClick={() => handleNav(stat.route)} className="border-border/70 bg-card/80 hover:border-primary/40 hover:shadow-sm transition-all rounded-2xl cursor-pointer group">
            <CardContent className="p-4 md:p-5 flex flex-col items-center justify-center text-center h-full">
              <ArrowUpRight className="absolute top-3 right-3 w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground transition-colors shrink-0" />
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.color} transition-transform group-hover:scale-105 mb-2`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.val}</p>
              <p className="text-xs md:text-sm font-semibold text-foreground/80 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Positions of Responsibility</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Your student leadership roles, club management portals, and editorial privileges</p>
          </div>
          <Button variant="outline" size="sm" className="shadow-xs hidden sm:flex"><Plus className="w-3.5 h-3.5 mr-1.5" /> Request New Club</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/70 rounded-2xl overflow-hidden flex flex-col group hover:border-primary/30 transition-all">
            <div className="relative h-36 bg-muted">
              <img src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80" alt="Journalist" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2 right-2"><Badge className="bg-primary text-primary-foreground border-0 text-[10px] shadow-sm"><PenTool className="w-3 h-3 mr-1" /> Editorial Board</Badge></div>
            </div>
            <CardContent className="p-5 flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-foreground">Campus Journalist</h3>
                <Badge variant="outline" className="text-[10px] bg-muted/40">Press</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">Official campus press reporter. Draft, review, and publish university newspaper articles.</p>
            </CardContent>
            <div className="p-5 pt-0">
              <Button variant="outline" className="w-full text-xs h-9 hover:bg-muted" onClick={() => handleNav("newspaper")}><Eye className="w-3.5 h-3.5 mr-1.5" /> Enter Journalist Workspace</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
};

const ClubMemberDashboardDemo = ({ onNavigate }) => {
  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <Card className="p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-border/70 bg-card">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-muted rounded-2xl overflow-hidden shrink-0 border border-border/50 shadow-sm">
            <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop&q=80" alt="Club Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              Tech Innovators <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 uppercase tracking-widest text-[10px]"><Shield className="w-3 h-3 mr-1" /> Enrolled Member</Badge>
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">Active member portal: browse announcements, propose events, and view team rosters.</p>
          </div>
        </div>
        <Button variant="outline" className="shrink-0 hidden md:flex text-emerald-600 border-emerald-500/30 hover:bg-emerald-50" onClick={() => window.location.href = '/auth'}><ArrowLeft className="w-4 h-4 mr-2" /> Return to Student</Button>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { val: "1", label: "Active Community Followers", icon: Users, color: "text-blue-500 bg-blue-500/10" },
          { val: "2", label: "Enrolled Club Members", icon: User, color: "text-emerald-500 bg-emerald-500/10" },
          { val: "1", label: "Operational Wings / Teams", icon: Shield, color: "text-purple-500 bg-purple-500/10" },
          { val: "0", label: "Active & Ongoing Events", icon: Calendar, color: "text-amber-500 bg-amber-500/10" }
        ].map((stat, i) => (
          <Card key={i} className="border-border/70 bg-card hover:border-primary/40 transition-colors rounded-2xl group cursor-pointer">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full relative">
              <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              <div className={`p-3 rounded-xl mb-3 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold">{stat.val}</p>
              <p className="text-xs font-semibold text-muted-foreground mt-2">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/70 rounded-2xl p-6 bg-card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> Recent Events</h3>
              <p className="text-xs text-muted-foreground">Latest 5 campus and global activities</p>
            </div>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => onNavigate("events")}>View All <ArrowRight className="w-3 h-3 ml-1" /></Button>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => onNavigate("events")}>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0"><Calendar className="w-5 h-5 text-emerald-500" /></div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Intro to React Workshop</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> Tomorrow, 2:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => onNavigate("events")}>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0"><Calendar className="w-5 h-5 text-emerald-500" /></div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Hackathon Brainstorming</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> Oct 22, 2026</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-border/70 rounded-2xl p-6 bg-card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold flex items-center gap-2"><Megaphone className="w-4 h-4 text-primary" /> Recent Announcements</h3>
              <p className="text-xs text-muted-foreground">Latest 5 campus bulletins and updates</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5" onClick={() => onNavigate("announcements")}>View All <ArrowRight className="w-3 h-3 ml-1" /></Button>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => onNavigate("announcements")}>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Megaphone className="w-5 h-5 text-primary" /></div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Welcome to the New Semester!</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Published 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => onNavigate("announcements")}>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Megaphone className="w-5 h-5 text-primary" /></div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Weekly Meeting Moved</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Published Yesterday</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
};

const ClubMemberAnnouncementsDemo = () => {
  const [activeSubTab, setActiveSubTab] = useState("pending");

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">Announcements & Notices</h2>
          <p className="text-sm text-muted-foreground mt-1">View club-wide updates and notices from administrators, or draft an announcement proposal.</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white shrink-0"><Plus className="w-4 h-4 mr-2" /> Draft Announcement</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-8">
        <div className="relative w-full md:w-96">
          <input type="text" placeholder="Search announcements..." className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex gap-1 bg-card p-1 rounded-full border border-border/60 shadow-sm w-full md:w-auto overflow-x-auto">
          <Button variant={activeSubTab === "published" ? "default" : "ghost"} className={`rounded-full h-9 px-4 text-sm ${activeSubTab === "published" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "hover:bg-muted text-muted-foreground"}`} onClick={() => setActiveSubTab("published")}>
            Published
          </Button>
          <Button variant={activeSubTab === "pending" ? "default" : "ghost"} className={`rounded-full h-9 px-4 text-sm ${activeSubTab === "pending" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "hover:bg-muted text-muted-foreground"}`} onClick={() => setActiveSubTab("pending")}>
            Pending Approval
          </Button>
          <Button variant={activeSubTab === "drafts" ? "default" : "ghost"} className={`rounded-full h-9 px-4 text-sm ${activeSubTab === "drafts" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "hover:bg-muted text-muted-foreground"}`} onClick={() => setActiveSubTab("drafts")}>
            My Drafts
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeSubTab === "published" && (
          <>
            <Card className="border-border/60 shadow-sm animate-fade-in" style={{ animationDuration: "0.2s" }}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Welcome to the New Semester!</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><Clock className="w-3.5 h-3.5" /> Published 04/10/2026, 10:00:00</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Live</Badge>
                </div>
                <p className="text-sm text-muted-foreground">We are excited to kick off our new projects this week. Make sure to check the Teams tab to see where you can contribute.</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-sm animate-fade-in" style={{ animationDuration: "0.2s" }}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Weekly Meeting Moved</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><Clock className="w-3.5 h-3.5" /> Published 03/10/2026, 14:30:00</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Live</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Due to the auditorium being booked, our weekly meeting will be in Room 402 this Thursday.</p>
              </CardContent>
            </Card>
          </>
        )}

        {activeSubTab === "pending" && (
          <>
            <Card className="border-border/60 shadow-sm animate-fade-in" style={{ animationDuration: "0.2s" }}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">testing 2</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><Clock className="w-3.5 h-3.5" /> Submitted 04/10/2026, 17:54:32</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Awaiting Approval</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-6">testing 2</p>
                <div className="bg-amber-50/50 border border-amber-200/50 text-amber-600 text-xs p-3 rounded-lg flex items-center gap-2">
                  Sent to Club Admin & Mentor for verification and publication.
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-sm animate-fade-in" style={{ animationDuration: "0.2s" }}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">Call for Volunteers</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><Clock className="w-3.5 h-3.5" /> Submitted 02/10/2026, 09:15:00</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Awaiting Approval</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-6">We need 5 volunteers for the upcoming tech symposium to handle the registration desk.</p>
                <div className="bg-amber-50/50 border border-amber-200/50 text-amber-600 text-xs p-3 rounded-lg flex items-center gap-2">
                  Sent to Club Admin & Mentor for verification and publication.
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeSubTab === "drafts" && (
          <>
            <Card className="border-border/60 shadow-sm animate-fade-in flex flex-col" style={{ animationDuration: "0.2s" }}>
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">testing</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><Clock className="w-3.5 h-3.5" /> Saved 04/10/2026, 17:54:19</p>
                  </div>
                  <Badge variant="outline" className="bg-muted text-muted-foreground hover:bg-muted border-border">Draft</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-6 flex-1">teting</p>
                <div className="border-t border-border pt-4 flex gap-3 w-full justify-between mt-auto">
                  <Button variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4 mr-2" /> Discard</Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 shadow-sm"><Send className="w-4 h-4 mr-2" /> Submit for Approval</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-sm animate-fade-in flex flex-col" style={{ animationDuration: "0.2s" }}>
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg">New Merch Drops</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><Clock className="w-3.5 h-3.5" /> Saved 01/10/2026, 20:00:00</p>
                  </div>
                  <Badge variant="outline" className="bg-muted text-muted-foreground hover:bg-muted border-border">Draft</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-6 flex-1">Club hoodies and stickers are arriving next week. Fill out the size form...</p>
                <div className="border-t border-border pt-4 flex gap-3 w-full justify-between mt-auto">
                  <Button variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4 mr-2" /> Discard</Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 shadow-sm"><Send className="w-4 h-4 mr-2" /> Submit for Approval</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
};

const ClubsDemo = ({ onSelectClub, role }) => {
  // ... rest of previous components remain same
  const handleNav = (club) => {
    document.getElementById("demo-scroll-area")?.scrollTo(0, 0);
    onSelectClub(club);
  };

  const clubs = [
    { name: "Data Science Society", desc: "Empowering students through data analytics, machine learning, and AI research projects.", img: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&auto=format&fit=crop&q=80", isMentored: role === "professor", members: 142, lead: "Alice Johnson" },
    { name: "Tech Innovators", desc: "Driving technological advancement on campus.", img: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop&q=80" },
    { name: "Robotics Club", desc: "Building the future with machines.", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80" },
    { name: "Debate Society", desc: "Sharpen your argumentation skills.", img: "https://images.unsplash.com/photo-1529070538774-1843cb1665eb?w=600&auto=format&fit=crop&q=80" },
    { name: "Music Club", desc: "For those who love rhythm and melodies.", img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&auto=format&fit=crop&q=80" },
    { name: "Coding Ninjas", desc: "Competitive programming and logic building.", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Campus Clubs Directory</h2>
          <p className="text-sm text-muted-foreground mt-1">Explore and oversee all officially active student clubs and organizations in your college.</p>
        </div>
        <div className="relative">
          <input type="text" placeholder="Search clubs, mentors..." className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20" />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clubs.map((club, i) => (
          <Card key={i} className="border border-border/60 bg-card rounded-2xl overflow-hidden group transition-all flex flex-col hover:border-primary/40 hover:shadow-md">
            <div className="relative h-48 bg-muted overflow-hidden">
              <img src={club.img} alt={club.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              {club.isMentored && (
                <>
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-semibold px-2 shadow-sm"><CheckCircle className="w-3 h-3 mr-1" /> You Mentor</Badge>
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs font-medium bg-background/90 px-2 py-1 rounded-md text-foreground shadow-sm">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" /> {club.members}
                  </div>
                </>
              )}
            </div>
            <CardContent className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors">{club.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{club.desc}</p>
              {club.isMentored && (
                <div className="pt-4 mt-auto border-t border-border/50 text-xs flex flex-col gap-2">
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-emerald-500" /> Faculty Mentor:</span>
                    <span className="font-semibold text-emerald-600">You (Faculty Mentor)</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-emerald-500" /> Student Lead:</span>
                    <span className="font-semibold text-foreground">{club.lead}</span>
                  </div>
                </div>
              )}
            </CardContent>
            <div className="p-5 pt-0">
              {club.isMentored ? (
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 h-10 border-emerald-500/30 hover:bg-emerald-50 text-emerald-600 shadow-sm" onClick={() => handleNav(club)}><Eye className="w-4 h-4 mr-1.5" /> View Details</Button>
                  <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 border-border/80 hover:text-red-500 text-muted-foreground shadow-sm"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart w-4 h-4"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg></Button>
                  <Button className="flex-1 h-10 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" onClick={() => window.location.href = '/auth'}>Mentor <ArrowUpRight className="w-4 h-4 ml-1.5" /></Button>
                </div>
              ) : (
                <Button variant="outline" className="w-full h-10 border-border/80 hover:bg-muted text-primary" onClick={() => handleNav(club)}><Eye className="w-4 h-4 mr-2" /> Explore Details</Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
};

const ClubDetailDemo = ({ club, onBack }) => {
  const [isFollowing, setIsFollowing] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState("teams");
  const clubName = club?.name || "Tech Innovators";

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 -ml-2 hover:bg-muted"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory</Button>

      <div className="relative h-48 md:h-72 rounded-[2rem] overflow-hidden bg-muted shadow-sm border border-border/50 group">
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/80 via-blue-800/60 to-transparent z-10" />
        <img src={club?.img || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=1200&auto=format&fit=crop&q=80"} alt="Club Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

        <div className="absolute bottom-6 left-6 z-20">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-2">{clubName}</h1>
          <p className="text-white/90 text-sm md:text-base font-medium max-w-xl">{club?.desc || "Driving technological advancement on campus."}</p>
        </div>

        <div className="absolute bottom-6 right-6 z-20">
          <Button
            variant={isFollowing ? "secondary" : "default"}
            onClick={() => setIsFollowing(!isFollowing)}
            className={`shadow-lg font-semibold rounded-xl transition-all ${isFollowing ? "bg-white/95 text-destructive hover:bg-white hover:text-destructive" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
          >
            {isFollowing ? <><X className="w-4 h-4 mr-2" /> Unfollow</> : <><Plus className="w-4 h-4 mr-2" /> Follow</>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { val: "128", label: "Members", icon: Users },
          { val: "2", label: "Teams", icon: Users },
          { val: "3", label: "Events", icon: Calendar },
          { val: "256", label: "Followers", icon: Users }
        ].map((stat, i) => (
          <Card key={i} className="border-border/60 bg-card/60 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="text-primary mb-1"><stat.icon className="w-5 h-5 opacity-70" /></div>
              <p className="text-2xl font-bold">{stat.val}</p>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border-border/60">
        <Avatar className="w-14 h-14 border-2 border-background shadow-sm">
          <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">AJ</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-bold text-lg flex items-center gap-2">Alex Johnson <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-semibold py-0">Admin</Badge></h3>
          <p className="text-sm text-muted-foreground mt-0.5">Club Administrator</p>
        </div>
      </Card>

      <div className="space-y-4 pt-2">
        <div className="flex gap-2 border-b border-border overflow-x-auto pb-[-1px]">
          {["teams", "members", "events", "announcements"].map((tab) => (
            <Button
              key={tab}
              variant={activeSubTab === tab ? "default" : "ghost"}
              onClick={() => setActiveSubTab(tab)}
              className={`rounded-b-none rounded-t-xl px-6 h-10 capitalize ${activeSubTab !== tab && "hover:bg-muted/50 text-muted-foreground shadow-none"}`}
            >
              {tab}
            </Button>
          ))}
        </div>

        <Card className="p-6 rounded-2xl border-border/60 border-t-0 rounded-tl-none bg-card/50 min-h-[300px]">
          {activeSubTab === "teams" && (
            <div className="space-y-4 animate-fade-in" style={{ animationDuration: "0.2s" }}>
              <h3 className="font-bold text-lg mb-3">Club Teams</h3>
              <div className="bg-background/80 p-5 rounded-xl border border-border/40 shadow-sm">
                <h4 className="font-semibold text-primary">Web Development Team</h4>
                <p className="text-sm text-muted-foreground mt-1.5">Responsible for building and maintaining the club's portal and internal tools.</p>
                <div className="flex items-center gap-2 mt-3"><Badge variant="outline">12 Members</Badge><Badge variant="outline">Recruiting</Badge></div>
              </div>
              <div className="bg-background/80 p-5 rounded-xl border border-border/40 shadow-sm">
                <h4 className="font-semibold text-primary">App Development Team</h4>
                <p className="text-sm text-muted-foreground mt-1.5">Focuses on mobile solutions and competitive hackathon projects.</p>
                <div className="flex items-center gap-2 mt-3"><Badge variant="outline">8 Members</Badge></div>
              </div>
            </div>
          )}

          {activeSubTab === "members" && (
            <div className="space-y-4 animate-fade-in" style={{ animationDuration: "0.2s" }}>
              <h3 className="font-bold text-lg mb-3">Core Members</h3>
              <div className="flex items-center justify-between bg-background/80 p-4 rounded-xl border border-border/40 shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback className="bg-primary/10 text-primary">AJ</AvatarFallback></Avatar>
                  <div><p className="font-semibold">Alex Johnson</p><p className="text-xs text-muted-foreground">President</p></div>
                </div>
                <Button variant="ghost" size="sm">View Profile</Button>
              </div>
              <div className="flex items-center justify-between bg-background/80 p-4 rounded-xl border border-border/40 shadow-sm">
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback className="bg-emerald-500/10 text-emerald-500">SM</AvatarFallback></Avatar>
                  <div><p className="font-semibold">Sarah Miller</p><p className="text-xs text-muted-foreground">Vice President</p></div>
                </div>
                <Button variant="ghost" size="sm">View Profile</Button>
              </div>
            </div>
          )}

          {activeSubTab === "events" && (
            <div className="space-y-4 animate-fade-in" style={{ animationDuration: "0.2s" }}>
              <h3 className="font-bold text-lg mb-3">Upcoming Events</h3>
              <div className="bg-background/80 p-5 rounded-xl border border-border/40 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Calendar className="text-primary" /></div>
                <div>
                  <h4 className="font-semibold">Intro to React Workshop</h4>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Oct 20, 2026 • 2:00 PM</p>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === "announcements" && (
            <div className="space-y-4 animate-fade-in" style={{ animationDuration: "0.2s" }}>
              <h3 className="font-bold text-lg mb-3">Recent Announcements</h3>
              <div className="bg-background/80 p-5 rounded-xl border border-border/40 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500/10 rounded-lg flex items-center justify-center shrink-0"><Megaphone className="text-amber-500" /></div>
                <div>
                  <h4 className="font-semibold">Welcome to the New Semester!</h4>
                  <p className="text-sm text-muted-foreground mt-1.5">We are excited to kick off our new projects this week. Make sure to check the Teams tab to see where you can contribute.</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
};

const ClubAdminDashboardDemo = ({ onNavigate }) => {
  const handleNav = (tab) => {
    document.getElementById("demo-scroll-area")?.scrollTo(0, 0);
    onNavigate(tab);
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <Card className="p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border-border/70 bg-card">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-muted rounded-2xl overflow-hidden shrink-0 border border-border/50 shadow-sm">
            <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop&q=80" alt="Club Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              Tech Innovators <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 uppercase tracking-widest text-[10px]"><Crown className="w-3 h-3 mr-1" /> Club Admin</Badge>
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5">Manage club members, publish events, and broadcast announcements.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="shrink-0 hidden md:flex text-emerald-600 border-emerald-500/30 hover:bg-emerald-50" onClick={() => window.location.href = '/auth'}><ArrowLeft className="w-4 h-4 mr-2" /> Return to Student</Button>
          <Button className="shrink-0 hidden md:flex bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" onClick={() => handleNav("settings")}><Settings className="w-4 h-4 mr-2" /> Manage Profile</Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { val: "128", label: "Enrolled Members", icon: Users, color: "text-blue-500 bg-blue-500/10", tab: "members" },
          { val: "14", label: "Announcements", icon: Megaphone, color: "text-amber-500 bg-amber-500/10", tab: "announcements" },
          { val: "1", label: "Operational Teams", icon: Shield, color: "text-purple-500 bg-purple-500/10", tab: "teams" },
          { val: "3", label: "Active Events", icon: Calendar, color: "text-emerald-500 bg-emerald-500/10", tab: "events" }
        ].map((stat, i) => (
          <Card key={i} className="border-border/70 bg-card hover:border-primary/40 transition-colors rounded-2xl group cursor-pointer" onClick={() => handleNav(stat.tab)}>
            <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full relative">
              <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
              <div className={`p-3 rounded-xl mb-3 ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold">{stat.val}</p>
              <p className="text-xs font-semibold text-muted-foreground mt-2">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/70 rounded-2xl p-6 bg-card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> Recent Events</h3>
              <p className="text-xs text-muted-foreground">Latest 5 campus and global activities</p>
            </div>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => handleNav("events")}>View All <ArrowRight className="w-3 h-3 ml-1" /></Button>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => handleNav("events")}>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0"><Calendar className="w-5 h-5 text-emerald-500" /></div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Intro to React Workshop</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> Tomorrow, 2:00 PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => handleNav("events")}>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0"><Calendar className="w-5 h-5 text-emerald-500" /></div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Hackathon Brainstorming</h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> Oct 22, 2026</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-border/70 rounded-2xl p-6 bg-card">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold flex items-center gap-2"><Megaphone className="w-4 h-4 text-primary" /> Recent Announcements</h3>
              <p className="text-xs text-muted-foreground">Latest 5 campus bulletins and updates</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5" onClick={() => handleNav("announcements")}>View All <ArrowRight className="w-3 h-3 ml-1" /></Button>
          </div>
          <div className="space-y-3 mt-4">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => handleNav("announcements")}>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Megaphone className="w-5 h-5 text-primary" /></div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Welcome to the New Semester!</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Published 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={() => handleNav("announcements")}>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0"><Megaphone className="w-5 h-5 text-primary" /></div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Weekly Meeting Moved</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Published Yesterday</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
};

const AnnouncementsDemo = ({ role }) => (
  <div className="space-y-4 max-w-5xl mx-auto">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2"><Megaphone className="w-5 h-5 text-primary" /> Campus Announcements</h2>
        <p className="text-sm text-muted-foreground mt-1">Latest updates from clubs and administration.</p>
      </div>
      {role === "admin" && (
        <Button size="sm" className="shadow-xs"><Plus className="w-4 h-4 mr-2" /> New Announcement</Button>
      )}
    </div>

    {[1, 2, 3].map(i => (
      <Card key={i} className="border border-border/60 bg-card rounded-xl hover:border-primary/30 transition-colors">
        <CardContent className="p-5 flex flex-col sm:flex-row gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Megaphone className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <h3 className="font-bold text-foreground">Annual Tech Symposium {i}</h3>
              <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/20">Important</Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              Join us for the biggest tech event of the year featuring industry experts and hands-on workshops.
              Registration closes soon, so grab your spot today!
            </p>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> Tech Innovators</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 2 hours ago</span>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const EventsDemo = ({ role }) => {
  const [activeSubTab, setActiveSubTab] = useState("active");
  const [dialogEvent, setDialogEvent] = useState(null);

  const getEventData = (activeSubTab, i) => {
    const isGlobal = activeSubTab === "global";
    const isFinished = activeSubTab === "finished";

    return {
      title: isGlobal ? `Inter-college Hackathon ${i}` : `Campus Tech Summit ${i}`,
      img: isGlobal
        ? `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80`
        : `https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&auto=format&fit=crop&q=80`,
      time: isFinished ? "Last Week" : "Oct 15, 2026 • 10:00 AM",
      location: isGlobal ? "Tech Hub, NY" : "Main Auditorium",
      status: isFinished ? "Finished" : isGlobal ? "Global" : "Active"
    };
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-500" /> Campus & Global Events</h2>
          <p className="text-sm text-muted-foreground mt-1">Explore campus workshops, hackathons, guest lectures, and cross-college global events</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input type="text" placeholder="Search events..." className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-muted/30 p-1.5 rounded-xl border border-border/50 inline-flex">
        <Button variant={activeSubTab === "active" ? "default" : "ghost"} className={`rounded-lg h-9 ${activeSubTab === "active" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : ""}`} onClick={() => setActiveSubTab("active")}>
          Active
        </Button>
        <Button variant={activeSubTab === "global" ? "default" : "ghost"} className={`rounded-lg h-9 ${activeSubTab === "global" ? "bg-primary text-white shadow-sm" : ""}`} onClick={() => setActiveSubTab("global")}>
          Global
        </Button>
        <Button variant={activeSubTab === "finished" ? "default" : "ghost"} className={`rounded-lg h-9 ${activeSubTab === "finished" ? "shadow-sm" : ""}`} onClick={() => setActiveSubTab("finished")}>
          Finished
        </Button>
      </div>

      {role === "admin" && (
        <div className="mb-4">
          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 shadow-xs"><Plus className="w-4 h-4 mr-2" /> Create Event</Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, (activeSubTab === "global" ? 4 : null)].filter(Boolean).map(i => {
          const ev = getEventData(activeSubTab, i);
          return (
            <Card key={`${activeSubTab}-${i}`} className="border border-border/60 bg-card rounded-2xl overflow-hidden hover:shadow-md transition-all group animate-fade-in flex flex-col" style={{ animationDuration: "0.3s" }}>
              <div className="h-40 relative overflow-hidden bg-muted">
                <img src={ev.img} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                <div className="absolute top-3 right-3">
                  <Badge className="bg-background/90 text-foreground backdrop-blur-sm border-0 text-[10px] font-semibold px-2">
                    {ev.status}
                  </Badge>
                </div>
                {activeSubTab === "active" && (
                  <div className="absolute bottom-3 right-3">
                    <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-semibold shadow-sm">Live</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                  {ev.title}
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-md px-2">
                    <Clock className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span>{ev.time}</span>
                  </div>
                  <div className="flex items-center gap-2 px-2">
                    <Building2 className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <span className="line-clamp-1">{ev.location}</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 flex gap-2 w-full">
                  {ev.status !== "Finished" && (
                    <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-9" onClick={() => window.location.href = '/auth'}>
                      Register
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1 border-border/80 hover:bg-muted text-xs h-9" onClick={() => setDialogEvent(ev)}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {dialogEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={() => setDialogEvent(null)}>
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col relative animate-scale-in" onClick={e => e.stopPropagation()} style={{ animationDuration: "0.2s" }}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full z-10 w-8 h-8"
              onClick={() => setDialogEvent(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="h-48 md:h-56 w-full relative bg-muted">
              <img src={dialogEvent.img} alt={dialogEvent.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <Badge className="bg-emerald-500 text-white border-0 text-[10px] mb-2 font-semibold shadow-sm">{dialogEvent.status}</Badge>
                <h2 className="text-2xl font-bold text-white leading-tight">{dialogEvent.title}</h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium"><Clock className="w-4 h-4 text-primary" /> {dialogEvent.time}</span>
                <span className="flex items-center gap-1.5 font-medium"><Building2 className="w-4 h-4 text-primary" /> {dialogEvent.location}</span>
              </div>
              <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                <h3 className="font-semibold mb-2">About This Event</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Join us for an exciting event filled with learning, networking, and innovation! This event brings together students, mentors, and professionals to share knowledge and build a stronger community.
                  <br /><br />
                  Don't miss out on this amazing opportunity to expand your skillset and connect with peers. Registration is required and spots are limited!
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setDialogEvent(null)}>Close</Button>
                {dialogEvent.status !== "Finished" && (
                  <Button className="bg-emerald-500 hover:bg-emerald-600 px-6" onClick={() => window.location.href = '/auth'}>Register Now</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
};

const NewspaperDemo = () => {
  const [activeSubTab, setActiveSubTab] = useState("campus");
  const [dialogPaper, setDialogPaper] = useState(null);

  const getPapers = () => {
    if (activeSubTab === "campus") {
      return [
        { title: "Campus Weekly - October Edition", img: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop&q=80", date: "Oct 1, 2026", badge: "Campus" },
        { title: "The Tech Innovator Student Journal", img: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80", date: "Sep 15, 2026", badge: "Campus" },
      ];
    }
    return [
      { title: "Global Tech Gazette - Edition 1", img: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=600&auto=format&fit=crop&q=80", date: "Oct 12, 2026", badge: "Global" },
      { title: "Inter-University Research Chronicle", img: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop&q=80", date: "Oct 5, 2026", badge: "Global" },
    ];
  };

  const papers = getPapers();

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><Newspaper className="w-5 h-5 text-primary" /> Campus Chronicle & Newspapers</h2>
          <p className="text-sm text-muted-foreground mt-1">Read student journalism, campus gazettes, and syndicated publications across partner colleges</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="hidden sm:flex text-primary border-primary/20" onClick={() => window.location.href = '/auth'}><PenTool className="w-4 h-4 mr-2" /> Become Journalist</Button>
          <div className="relative w-full sm:w-64">
            <input type="text" placeholder="Search articles, headlines..." className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6 bg-muted/30 p-1.5 rounded-xl border border-border/50 inline-flex">
        <Button variant={activeSubTab === "campus" ? "default" : "ghost"} className={`rounded-lg h-9 ${activeSubTab === "campus" ? "bg-primary text-white shadow-sm" : ""}`} onClick={() => setActiveSubTab("campus")}>
          Campus
        </Button>
        <Button variant={activeSubTab === "global" ? "default" : "ghost"} className={`rounded-lg h-9 ${activeSubTab === "global" ? "bg-primary text-white shadow-sm" : ""}`} onClick={() => setActiveSubTab("global")}>
          Global
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {papers.map((paper, i) => (
          <Card key={i} className="border border-border/60 bg-card rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col animate-fade-in" style={{ animationDuration: "0.3s" }}>
            <div className="h-40 relative overflow-hidden bg-muted">
              <img src={paper.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
              <div className="absolute top-3 right-3">
                <Badge className={`${paper.badge === "Global" ? "bg-primary" : "bg-emerald-500"} text-white border-0 text-[10px] font-semibold px-2`}>{paper.badge}</Badge>
              </div>
            </div>
            <CardContent className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{paper.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">The latest news on technology, student life, and global university partnerships.</p>
              <div className="mt-auto pt-4 flex gap-2 w-full border-t border-border/50">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white text-xs h-9" onClick={() => setDialogPaper(paper)}>
                  <Eye className="w-4 h-4 mr-2" /> Read
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {dialogPaper && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={() => setDialogPaper(null)}>
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col relative animate-scale-in" onClick={e => e.stopPropagation()} style={{ animationDuration: "0.2s" }}>
            <Button variant="ghost" size="icon" className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full z-10 w-8 h-8" onClick={() => setDialogPaper(null)}>
              <X className="w-4 h-4" />
            </Button>
            <div className="h-48 md:h-56 w-full relative bg-muted">
              <img src={dialogPaper.img} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h2 className="text-2xl font-bold text-white leading-tight">{dialogPaper.title}</h2>
                <p className="text-white/80 text-sm mt-1">{dialogPaper.date}</p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-muted/30 p-4 rounded-xl border border-border/40 max-h-60 overflow-y-auto">
                <h3 className="font-semibold mb-2">Headline: The Future of Campus Tech</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  Universities across the globe are adopting cutting-edge technologies to enhance the student experience. From AI-driven grading systems to virtual reality classrooms, the educational landscape is shifting rapidly.
                </p>
                <h3 className="font-semibold mb-2">Student Life</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  As campuses reopen fully, student organizations have reported a 40% increase in club participation, indicating a strong desire for community and real-world connection among peers.
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setDialogPaper(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
};

const ResearchDemo = () => {
  const [activeSubTab, setActiveSubTab] = useState("campus");
  const [dialogText, setDialogText] = useState(null);

  const getPapers = () => {
    if (activeSubTab === "campus") {
      return [
        { title: "AI-Driven Grading Systems in Higher Education", desc: "An analysis of how artificial intelligence is transforming automated grading within our campus.", domain: "Artificial Intelligence", date: "Oct 2026" },
        { title: "Sustainable Energy Solutions for Campus Buildings", desc: "Proposing a new architecture for reducing carbon footprints in university facilities.", domain: "Environmental Science", date: "Sep 2026" }
      ];
    }
    if (activeSubTab === "global") {
      return [
        { title: "Distributed Consensus Architectures in Edge Computing", desc: "This paper explores new methodologies for achieving low-latency consensus among edge devices without relying on central cloud servers.", domain: "Computer Science", date: "Oct 2026" },
        { title: "Quantum Cryptography in Next-Gen Networks", desc: "A comprehensive study on the implementation of quantum key distribution across global communication networks.", domain: "Cybersecurity", date: "Aug 2026" }
      ];
    }
    return [];
  };

  const papers = getPapers();

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-500" /> Academic Research & Publications</h2>
          <p className="text-sm text-muted-foreground mt-1">Explore college research, cross-institutional academic papers, or submit your own research</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input type="text" placeholder="Search papers, domains..." className="pl-9 pr-4 py-2 bg-muted/50 border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 bg-muted/30 p-1.5 rounded-xl border border-border/50 inline-flex">
        <Button variant={activeSubTab === "campus" ? "default" : "ghost"} className={`rounded-lg h-9 ${activeSubTab === "campus" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : ""}`} onClick={() => setActiveSubTab("campus")}>
          Campus
        </Button>
        <Button variant={activeSubTab === "global" ? "default" : "ghost"} className={`rounded-lg h-9 ${activeSubTab === "global" ? "shadow-sm" : ""}`} onClick={() => setActiveSubTab("global")}>
          Global
        </Button>
        <Button variant={activeSubTab === "submit" ? "default" : "ghost"} className={`rounded-lg h-9 ${activeSubTab === "submit" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : ""}`} onClick={() => setActiveSubTab("submit")}>
          <ArrowUpRight className="w-4 h-4 mr-1.5" /> Submit Paper
        </Button>
        <Button variant={activeSubTab === "mine" ? "default" : "ghost"} className={`rounded-lg h-9 ${activeSubTab === "mine" ? "shadow-sm" : ""}`} onClick={() => window.location.href = '/auth'}>
          My Submissions
        </Button>
      </div>

      {(activeSubTab === "campus" || activeSubTab === "global") && (
        <div className="space-y-4">
          {papers.map((paper, i) => (
            <Card key={i} className="border border-border/60 bg-card rounded-xl hover:border-emerald-500/30 transition-colors animate-fade-in" style={{ animationDuration: "0.3s" }}>
              <CardContent className="p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-emerald-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{paper.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {paper.desc}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="font-medium text-emerald-600">{paper.domain}</span>
                    <span>Published: {paper.date}</span>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                  <Button variant="outline" className="flex-1 sm:flex-none border-border/80 hover:bg-muted" onClick={() => setDialogText(`${paper.title}\n\nAbstract: ${paper.desc}\n\nOur findings indicate significant improvements over traditional methods. Extensive testing confirms the hypothesis proposed in section 2.1...`)}>
                    <Eye className="w-4 h-4 mr-2" /> View
                  </Button>
                  <Button className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600" onClick={() => window.location.href = '/auth'}>
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeSubTab === "submit" && (
        <Card className="border-border/60 bg-card max-w-2xl">
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-bold text-lg">Submit Research Paper</h3>
              <p className="text-sm text-muted-foreground mt-1">Submit your paper for faculty review and institutional academic indexing.</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Research Paper Title *</label>
                <input type="text" placeholder="e.g. Distributed Consensus Architectures in Edge Computing" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold mb-1.5 block">Subject / Domain *</label>
                  <input type="text" placeholder="e.g. Artificial Intelligence" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
                <div>
                  <label className="text-xs font-semibold mb-1.5 block">Department *</label>
                  <input type="text" placeholder="e.g. Computer Science" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Abstract / Overview *</label>
                <textarea rows={4} placeholder="Provide an overview, key methodology, findings, and conclusion of the research..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"></textarea>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block">Manuscript Document (PDF) *</label>
                <div className="border-2 border-dashed border-border/80 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition-colors">
                  <Download className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-semibold text-foreground">Click to select PDF document</p>
                  <p className="text-xs text-muted-foreground mt-1">Maximum file size 10MB • Formatted PDF</p>
                </div>
              </div>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600" onClick={() => window.location.href = '/auth'}>Submit for Review</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {dialogText && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={() => setDialogText(null)}>
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col relative animate-scale-in" onClick={e => e.stopPropagation()} style={{ animationDuration: "0.2s" }}>
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <h3 className="font-bold flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-500" /> Document Preview</h3>
              <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full" onClick={() => setDialogText(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{dialogText}</p>
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={() => window.location.href = '/auth'}><Download className="w-4 h-4 mr-2" /> Download Full PDF</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
};

const SettingsDemo = () => {
  const [activeSubTab, setActiveSubTab] = useState("profile");

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold">Account Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your personal profile, credentials, and account preferences</p>
      </div>

      <div className="flex gap-2 bg-muted/30 p-1.5 rounded-xl border border-border/50 inline-flex">
        <Button variant={activeSubTab === "profile" ? "default" : "ghost"} className={`rounded-lg h-9 ${activeSubTab === "profile" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : ""}`} onClick={() => setActiveSubTab("profile")}>
          <User className="w-4 h-4 mr-2" /> Profile
        </Button>
        <Button variant={activeSubTab === "security" ? "default" : "ghost"} className={`rounded-lg h-9 ${activeSubTab === "security" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : ""}`} onClick={() => setActiveSubTab("security")}>
          <Lock className="w-4 h-4 mr-2" /> Security
        </Button>
      </div>

      {activeSubTab === "profile" && (
        <Card className="border-border/60 shadow-sm animate-fade-in" style={{ animationDuration: "0.2s" }}>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-bold">Personal Profile Information</h3>
              <p className="text-sm text-muted-foreground mt-1">Update your profile information and personal details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Full Name *</label>
                <input type="text" defaultValue="Demo Student" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Gender *</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-emerald-500" /> Academic Department</label>
                <select className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none">
                  <option>Information Technology (IT)</option>
                  <option>Computer Science</option>
                  <option>Electronics</option>
                </select>
                <p className="text-[10px] text-muted-foreground mt-1">Only departments affiliated with your registered college are available.</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/50">
              <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={() => window.location.href = '/auth'}>Save Profile Changes</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSubTab === "security" && (
        <Card className="border-border/60 shadow-sm animate-fade-in" style={{ animationDuration: "0.2s" }}>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-bold">Account Security & Credentials</h3>
              <p className="text-sm text-muted-foreground mt-1">Update your account password to ensure your student profile remains secure</p>
            </div>

            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Current Password *</label>
                <input type="password" placeholder="Enter current password" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">New Password *</label>
                <input type="password" placeholder="At least 6 characters" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">Confirm New Password *</label>
                <input type="password" placeholder="Re-enter new password" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/50">
              <Button className="bg-emerald-500 hover:bg-emerald-600" onClick={() => window.location.href = '/auth'}><Lock className="w-4 h-4 mr-2" /> Update Password</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
};

const ClubMemberEventsDemo = () => {
  const [activeSubTab, setActiveSubTab] = useState("published");
  const [dialogEvent, setDialogEvent] = useState(null);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">Club Events & Proposals</h2>
          <p className="text-sm text-muted-foreground mt-1">Browse upcoming club activities, workshops, competitions, or propose a new event initiative.</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white shrink-0"><Plus className="w-4 h-4 mr-2" /> Propose Event</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-8">
        <div className="relative w-full md:w-96">
          <input type="text" placeholder="Search events by title or venue..." className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex gap-1 bg-card p-1 rounded-full border border-border/60 shadow-sm w-full md:w-auto overflow-x-auto">
          {["published", "finished", "pending", "drafts"].map(t => (
            <Button key={t} variant={activeSubTab === t ? "default" : "ghost"} className={`rounded-full h-9 px-4 text-sm capitalize ${activeSubTab === t ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "hover:bg-muted text-muted-foreground"}`} onClick={() => setActiveSubTab(t)}>
              {t === "pending" ? "Pending Approval" : t === "drafts" ? "My Drafts" : t}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {activeSubTab === "published" && (
            <>
              <Card className="border-border/60 bg-card rounded-2xl overflow-hidden hover:shadow-md transition-all group animate-fade-in flex flex-col">
                <div className="h-40 relative overflow-hidden bg-muted">
                  <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-semibold shadow-sm">Live</Badge>
                  </div>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2">Intro to React Workshop</h3>
                  <div className="space-y-2 text-sm text-muted-foreground mt-1 mb-4 flex-1">
                    <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-md px-2"><Clock className="w-4 h-4 text-muted-foreground" /> <span>Tomorrow, 2:00 PM</span></div>
                    <div className="flex items-center gap-2 px-2"><Building2 className="w-4 h-4 text-muted-foreground" /> <span>Main Auditorium</span></div>
                  </div>
                  <div className="flex gap-2 w-full pt-4 border-t border-border/50">
                    <Button variant="outline" className="flex-1 border-border/80 hover:bg-muted text-xs h-9" onClick={() => setDialogEvent({ title: "Intro to React Workshop", img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80", time: "Tomorrow, 2:00 PM", location: "Main Auditorium", status: "Live" })}>
                      View Details
                    </Button>
                    <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-9" onClick={() => window.location.href = '/auth'}>
                      Registered Students
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/60 bg-card rounded-2xl overflow-hidden hover:shadow-md transition-all group animate-fade-in flex flex-col">
                <div className="h-40 relative overflow-hidden bg-muted">
                  <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-semibold shadow-sm">Live</Badge>
                  </div>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2">Hackathon Brainstorming</h3>
                  <div className="space-y-2 text-sm text-muted-foreground mt-1 mb-4 flex-1">
                    <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-md px-2"><Clock className="w-4 h-4 text-muted-foreground" /> <span>Oct 22, 2026</span></div>
                    <div className="flex items-center gap-2 px-2"><Building2 className="w-4 h-4 text-muted-foreground" /> <span>Tech Hub Room 201</span></div>
                  </div>
                  <div className="flex gap-2 w-full pt-4 border-t border-border/50">
                    <Button variant="outline" className="flex-1 border-border/80 hover:bg-muted text-xs h-9" onClick={() => setDialogEvent({ title: "Hackathon Brainstorming", img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&auto=format&fit=crop&q=80", time: "Oct 22, 2026", location: "Tech Hub Room 201", status: "Live" })}>
                      View Details
                    </Button>
                    <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-9" onClick={() => window.location.href = '/auth'}>
                      Registered Students
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {activeSubTab === "finished" && (
            <Card className="border-border/60 bg-card rounded-2xl overflow-hidden hover:shadow-md transition-all group animate-fade-in flex flex-col">
              <div className="h-40 relative overflow-hidden bg-muted">
                <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80" className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-background/90 text-foreground backdrop-blur-sm border-0 text-[10px] font-semibold px-2 shadow-sm">Finished</Badge>
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-2">Annual Tech Symposium</h3>
                <div className="space-y-2 text-sm text-muted-foreground mt-1 mb-4 flex-1">
                  <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-md px-2"><Clock className="w-4 h-4 text-muted-foreground" /> <span>Last Week</span></div>
                  <div className="flex items-center gap-2 px-2"><Building2 className="w-4 h-4 text-muted-foreground" /> <span>Main Auditorium</span></div>
                </div>
                <div className="flex gap-2 w-full pt-4 border-t border-border/50">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-9" onClick={() => window.location.href = '/auth'}>
                    Registered Students
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSubTab === "pending" && (
            <Card className="border-border/60 bg-card rounded-2xl overflow-hidden hover:shadow-md transition-all group animate-fade-in flex flex-col">
              <div className="h-40 relative overflow-hidden bg-muted">
                <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 shadow-sm">Awaiting Approval</Badge>
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-2">Web3 Seminar</h3>
                <div className="space-y-2 text-sm text-muted-foreground mt-1 mb-4 flex-1">
                  <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-md px-2"><Clock className="w-4 h-4 text-muted-foreground" /> <span>Submitted Today</span></div>
                  <div className="flex items-center gap-2 px-2"><Building2 className="w-4 h-4 text-muted-foreground" /> <span>Virtual</span></div>
                </div>
                <div className="flex gap-2 w-full pt-4 border-t border-border/50 justify-between">
                  <Button variant="outline" className="border-border/80 hover:bg-muted text-xs h-9 px-3" onClick={() => setDialogEvent({ title: "Web3 Seminar", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&auto=format&fit=crop&q=80", time: "Submitted Today", location: "Virtual", status: "Awaiting Approval" })}>
                    <Eye className="w-3.5 h-3.5 mr-1" /> View Details
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 text-xs h-9 px-3" onClick={() => window.location.href = '/auth'}>
                      Reject
                    </Button>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-9 px-3" onClick={() => window.location.href = '/auth'}>
                      Approve
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSubTab === "drafts" && (
            <Card className="border-border/60 bg-card rounded-2xl overflow-hidden hover:shadow-md transition-all group animate-fade-in flex flex-col">
              <div className="h-40 relative overflow-hidden bg-muted">
                <img src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=600&auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                <div className="absolute top-3 right-3">
                  <Badge variant="outline" className="bg-background/90 text-foreground backdrop-blur-sm border-0 text-[10px] font-semibold px-2 shadow-sm">Draft</Badge>
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-2">AI Ethics Discussion</h3>
                <div className="space-y-2 text-sm text-muted-foreground mt-1 mb-4 flex-1">
                  <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-md px-2"><Clock className="w-4 h-4 text-muted-foreground" /> <span>Saved 3 days ago</span></div>
                  <div className="flex items-center gap-2 px-2"><Building2 className="w-4 h-4 text-muted-foreground" /> <span>Library Hall</span></div>
                </div>
                <div className="flex gap-2 w-full pt-4 border-t border-border/50 justify-between">
                  <Button variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs h-9 px-3" onClick={() => window.location.href = '/auth'}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Discard
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-9 px-4" onClick={() => window.location.href = '/auth'}>
                    <Send className="w-3.5 h-3.5 mr-1" /> Submit for Approval
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>

      {dialogEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={() => setDialogEvent(null)}>
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col relative animate-scale-in" onClick={e => e.stopPropagation()} style={{ animationDuration: "0.2s" }}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full z-10 w-8 h-8"
              onClick={() => setDialogEvent(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="h-48 md:h-56 w-full relative bg-muted">
              <img src={dialogEvent.img} alt={dialogEvent.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <Badge className="bg-emerald-500 text-white border-0 text-[10px] mb-2 font-semibold shadow-sm">{dialogEvent.status}</Badge>
                <h2 className="text-2xl font-bold text-white leading-tight">{dialogEvent.title}</h2>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium"><Clock className="w-4 h-4 text-primary" /> {dialogEvent.time}</span>
                <span className="flex items-center gap-1.5 font-medium"><Building2 className="w-4 h-4 text-primary" /> {dialogEvent.location}</span>
              </div>
              <div className="bg-muted/30 p-4 rounded-xl border border-border/40">
                <h3 className="font-semibold mb-2">About This Event</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Join us for an exciting event filled with learning, networking, and innovation! This event brings together students, mentors, and professionals to share knowledge and build a stronger community.
                  <br /><br />
                  Don't miss out on this amazing opportunity to expand your skillset and connect with peers. Registration is required and spots are limited!
                </p>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setDialogEvent(null)}>Close</Button>
                {dialogEvent.status === "Live" && (
                  <Button className="bg-emerald-500 hover:bg-emerald-600 px-6" onClick={() => window.location.href = '/auth'}>View Registered Students</Button>
                )}
                {dialogEvent.status === "Awaiting Approval" && (
                  <Button className="bg-emerald-500 hover:bg-emerald-600 px-6" onClick={() => window.location.href = '/auth'}>Approve Request</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ClubMemberTeamsDemo = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Teams</h2>
        <p className="text-sm text-muted-foreground mt-1">View teams and their members</p>
      </div>

      <div className="relative w-full md:w-96 mb-6">
        <input type="text" placeholder="Search teams..." className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-1">WEB</h3>
            <p className="text-xs text-muted-foreground mb-3">No description provided.</p>
            <Badge className="bg-muted/50 text-muted-foreground border-border/50 text-[10px] mb-6 shadow-none">3 members</Badge>

            <div className="space-y-0">
              <div className="font-medium text-sm text-foreground border-b border-border/50 pb-2">John Doe</div>
              <div className="font-medium text-sm text-foreground border-b border-border/50 py-2">Jane Smith</div>
              <div className="font-medium text-sm text-foreground pt-2">David Clark</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-1">APP DEV</h3>
            <p className="text-xs text-muted-foreground mb-3">Mobile application development team.</p>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] mb-6 shadow-none">4 members</Badge>

            <div className="space-y-0">
              <div className="font-medium text-sm text-foreground border-b border-border/50 pb-2">Alex Johnson</div>
              <div className="font-medium text-sm text-foreground border-b border-border/50 py-2">Sarah Miller</div>
              <div className="font-medium text-sm text-foreground border-b border-border/50 py-2">Michael Brown</div>
              <div className="font-medium text-sm text-foreground pt-2">Emily Davis</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const ClubMemberMembersDemo = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Club Members Directory</h2>
        <p className="text-sm text-muted-foreground mt-1">View fellow members, club leadership coordinators, and peer contributors.</p>
      </div>

      <div className="relative w-full md:w-96 mb-6">
        <input type="text" placeholder="Search members by name, roll, department..." className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>

      <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card divide-y divide-border/50">
        {[
          { name: "John Doe", role: "Member", initial: "J" },
          { name: "Alex Johnson", role: "Admin", initial: "A" },
          { name: "Jane Smith", role: "Member", initial: "J" },
          { name: "David Clark", role: "Member", initial: "D" },
          { name: "Michael Brown", role: "Member", initial: "M" },
          { name: "Sarah Miller", role: "Member", initial: "S" },
          { name: "Emily Davis", role: "Member", initial: "E" }
        ].map((m, i) => (
          <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4">
              <Avatar className="w-10 h-10 border border-border/50"><AvatarFallback className={m.role === 'Admin' ? 'bg-emerald-500/10 text-emerald-600 text-sm font-bold' : 'bg-primary/10 text-primary text-sm font-bold'}>{m.initial}</AvatarFallback></Avatar>
              <div>
                <p className="font-bold text-sm">{m.name}</p>
                <p className="text-xs text-muted-foreground">Enrolled Student</p>
              </div>
            </div>
            <Badge className={`${m.role === 'Admin' ? 'bg-emerald-500 text-white hover:bg-emerald-600 border-0 shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted border-border/50 shadow-none'} text-[10px] uppercase tracking-widest`}>{m.role}</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
};

const ClubAdminTeamsDemo = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-sm text-muted-foreground mt-1">Create teams and manage member assignments</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white shrink-0"><Plus className="w-4 h-4 mr-2" /> Create Team</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mt-6">
        <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card min-w-[200px]">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center shrink-0"><Users className="w-5 h-5 text-emerald-500" /></div>
            <div>
              <p className="font-bold text-xl">3</p>
              <p className="text-xs text-muted-foreground">Total Teams</p>
            </div>
          </CardContent>
        </Card>

        <div className="relative w-full">
          <input type="text" placeholder="Search teams by name or description..." className="pl-9 pr-4 py-3 bg-card border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {[
          { name: "WEB DEV", members: ["John Doe", "Jane Smith", "David Clark"] },
          { name: "APP DEV", members: ["Alex Johnson", "Sarah Miller", "Michael Brown", "Emily Davis"] },
          { name: "DESIGN", members: ["Alice Walker", "Bob Marley"] }
        ].map((team, idx) => (
          <Card key={idx} className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card">
            <CardContent className="p-6 flex flex-col h-full">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-bold text-lg">{team.name}</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-2 -mr-2"><Trash2 className="w-4 h-4" /></Button>
              </div>
              <p className="text-xs text-muted-foreground mb-3 flex-1">{team.name === 'DESIGN' ? 'UI/UX and graphic design team.' : team.name === 'APP DEV' ? 'Mobile application development team.' : 'Web application development team.'}</p>
              <Badge className="bg-muted/50 text-muted-foreground border-border/50 text-[10px] mb-6 shadow-none self-start">{team.members.length} members</Badge>

              <div className="space-y-0 border-b border-border/50 pb-4 mb-4">
                {team.members.map((member, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5">
                    <div className="font-medium text-sm text-foreground">{member}</div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                ))}
              </div>

              <div className="relative mt-auto">
                <select className="w-full pl-3 pr-8 py-2.5 bg-background border border-border rounded-lg text-xs text-muted-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                  <option>Add member to team...</option>
                  <option>Jane Smith</option>
                  <option>Alex Johnson</option>
                </select>
                <svg className="absolute right-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ClubAdminMembersDemo = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">Club Members Directory <Badge variant="outline" className="text-[10px] font-normal shadow-sm bg-background">28 Enrolled</Badge></h2>
          <p className="text-sm text-muted-foreground mt-1">Manage enrolled club members, designate leadership roles, and monitor team affiliations.</p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white shrink-0"><UserPlus className="w-4 h-4 mr-2" /> Add Member</Button>
      </div>

      <div className="relative w-full md:w-96 mb-6">
        <input type="text" placeholder="Search members by name, roll, email..." className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>

      <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card divide-y divide-border/50">
        {[
          { name: "Alice Johnson", role: "Admin", initial: "A", detail: "Student Lead" },
          { name: "John Doe", role: "Member", initial: "J", detail: "Web Team" },
          { name: "Jane Smith", role: "Member", initial: "J", detail: "Web Team" },
          { name: "David Clark", role: "Member", initial: "D", detail: "Web Team" },
          { name: "Alex Johnson", role: "Member", initial: "A", detail: "App Dev Team" },
          { name: "Sarah Miller", role: "Member", initial: "S", detail: "App Dev Team" },
          { name: "Alice Walker", role: "Member", initial: "A", detail: "Design Team" }
        ].map((m, i) => (
          <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-4">
              <Avatar className="w-10 h-10 border border-border/50"><AvatarFallback className={m.role === 'Admin' ? 'bg-emerald-500/10 text-emerald-600 text-sm font-bold' : 'bg-primary/10 text-primary text-sm font-bold'}>{m.initial}</AvatarFallback></Avatar>
              <div>
                <p className="font-bold text-sm">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.detail}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${m.role === 'Admin' ? 'bg-emerald-500 text-white hover:bg-emerald-600 border-0 shadow-sm' : 'bg-muted text-muted-foreground hover:bg-muted border-border/50 shadow-none'} text-[10px] uppercase tracking-widest`}>{m.role}</Badge>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};

const ClubAdminSettingsDemo = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3">Club Settings & Profile <Badge variant="outline" className="text-[10px] font-normal shadow-sm bg-background">Configuration</Badge></h2>
        <p className="text-sm text-muted-foreground mt-1">Manage public branding, contact portals, recruitment status, and administrative credentials.</p>
      </div>

      <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold">Club Profile Information</h3>
            <p className="text-sm text-muted-foreground mt-0.5">Update public details, branding, and contact portals for your organization.</p>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <div className="w-20 h-20 bg-muted rounded-full overflow-hidden shrink-0 border border-border/50 shadow-sm relative group cursor-pointer">
              <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop&q=80" alt="Club Logo" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white"><Upload className="w-6 h-6" /></div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-1">Club Insignia / Logo</p>
              <p className="text-xs text-muted-foreground mb-3">Recommended format: Square PNG or JPG, max 2MB.</p>
              <Button variant="outline" size="sm" className="h-8 text-emerald-600 border-emerald-500/30 hover:bg-emerald-50"><Upload className="w-3.5 h-3.5 mr-2" /> Choose New Logo</Button>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Club Name *</label>
              <input type="text" defaultValue="Tech Innovators" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Club Description</label>
              <textarea rows={4} defaultValue="Driving technological advancement on campus." className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none shadow-sm"></textarea>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">Official Website / Portfolio Link</label>
              <div className="relative">
                <input type="text" defaultValue="https://myclub.university.edu" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border/50">
            <Button className="bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white" onClick={() => window.location.href = '/auth'}><CheckCircle className="w-4 h-4 mr-2" /> Save Club Profile</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 shadow-sm rounded-xl overflow-hidden bg-amber-50/10">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-amber-600 flex items-center gap-2"><Key className="w-5 h-5" /> Handover Club Leadership</h3>
            <p className="text-sm text-muted-foreground mt-1">Transfer supreme club presidency to another registered student. This requires security OTP verification.</p>
          </div>

          <div className="bg-background rounded-lg border border-border/50 p-4 text-sm text-muted-foreground flex gap-3">
            <span className="font-semibold text-foreground shrink-0">Important Note:</span>
            <span>Upon successfully verifying the transfer code, your administrative privileges will immediately expire and transfer to the designated student.</span>
          </div>

          <div className="space-y-1.5 max-w-md">
            <label className="text-xs font-bold text-foreground">Successor University Email *</label>
            <input type="email" placeholder="newadmin@university.edu" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm" />
          </div>

          <Button className="bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white" onClick={() => window.location.href = '/auth'}><Send className="w-4 h-4 mr-2" /> Send Verification OTP</Button>
        </CardContent>
      </Card>
    </div>
  );
};

const JournalistDashboardDemo = ({ onNavigate }) => {
  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <Card className="p-6 md:p-8 rounded-2xl border-border/70 bg-card">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] uppercase tracking-widest shadow-none">Journalist Desk</Badge>
              <span className="text-muted-foreground text-sm font-medium flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> Your College</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
              Welcome back, John Doe!
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
              Report campus stories, publish verified journalism, and elevate top breaking news to global syndication.
            </p>
          </div>
          <Button variant="outline" className="shrink-0 text-emerald-600 border-emerald-500/30 hover:bg-emerald-50" onClick={() => window.location.href = '/auth'}><ArrowLeft className="w-4 h-4 mr-2" /> Return to Student</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border/70 p-6 rounded-2xl bg-card hover:border-emerald-500/40 transition-colors cursor-pointer group" onClick={() => onNavigate("articles")}>
          <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-muted-foreground/30 group-hover:text-emerald-500 transition-colors" />
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <div className="text-4xl font-bold text-foreground">12</div>
            <p className="font-semibold text-muted-foreground mt-1">My Published</p>
          </div>
        </Card>
        <Card className="border-border/70 p-6 rounded-2xl bg-card hover:border-blue-500/40 transition-colors cursor-pointer group" onClick={() => onNavigate("articles")}>
          <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-muted-foreground/30 group-hover:text-blue-500 transition-colors" />
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-4xl font-bold text-foreground">3</div>
            <p className="font-semibold text-muted-foreground mt-1">My Globalized</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h3 className="font-bold flex items-center gap-2 mb-1"><Flame className="w-4 h-4 text-orange-500" /> Top Headlines by You</h3>
            <p className="text-xs text-muted-foreground mb-4">Ranked by highest reader upvotes across the campus network</p>
            <Card className="border-border/70 rounded-2xl bg-card overflow-hidden">
              <div className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors border-b border-border/50 cursor-pointer" onClick={() => onNavigate("articles")}>
                <div className="w-16 h-16 bg-muted rounded-lg shrink-0 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-foreground truncate">The Future of AI on Campus</h4>
                  <p className="text-xs text-muted-foreground mt-1 truncate">An inside look at how our university is adopting artificial intelligence in everyday studies.</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-emerald-500">1.2k</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Upvotes</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => onNavigate("articles")}>
                <div className="w-16 h-16 bg-muted rounded-lg shrink-0 overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-foreground truncate">Hackathon Winners Announced</h4>
                  <p className="text-xs text-muted-foreground mt-1 truncate">Team 'ByteMe' takes home the grand prize after an exhausting 48-hour coding marathon.</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-emerald-500">845</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Upvotes</div>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h3 className="font-bold flex items-center gap-2 mb-1"><BookOpen className="w-4 h-4 text-emerald-500" /> In-Progress Drafts</h3>
                <p className="text-xs text-muted-foreground">Unfinished stories waiting in your editorial workbench</p>
              </div>
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => onNavigate("articles")}>Manage All <ArrowRight className="w-3 h-3 ml-1" /></Button>
            </div>
            <Card className="border-border/70 rounded-2xl bg-card border-dashed">
              <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => onNavigate("write")}>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Interview with the Dean</h4>
                  <p className="text-xs text-muted-foreground mt-1">Saved 2 hours ago</p>
                </div>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-emerald-600"><PenTool className="w-4 h-4" /></Button>
              </div>
            </Card>
          </div>
        </div>

        <div>
          <Card className="border-emerald-500/30 rounded-2xl bg-emerald-50/5 shadow-sm sticky top-4">
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-md shrink-0"><Shield className="w-4 h-4" /></div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Campus Press Standards</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Guidelines for publishing & syndication</p>
                </div>
              </div>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Factual & Verified:</strong> Double check facts with student club organizers or college reps before publishing.</p>
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">High Quality Visuals:</strong> High resolution horizontal cover images ensure eligibility for university-wide globalization.</p>
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Reader Engagement:</strong> Stories exceeding community upvote benchmarks are nominated for global syndication.</p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const JournalistArticlesDemo = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState("published");
  const [dialogArticle, setDialogArticle] = useState(null);

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <Card className="p-6 md:p-8 rounded-2xl border-border/70 bg-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] uppercase tracking-widest shadow-none mb-3">Editorial Archive</Badge>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">My Articles & Newsroom Drafts</h2>
          <p className="text-sm text-muted-foreground max-w-xl">Manage your campus publications, monitor readership upvotes, nominate stories for global syndication, and resume drafts.</p>
        </div>
        <Button className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" onClick={() => onNavigate("write")}><PenTool className="w-4 h-4 mr-2" /> Write New Article</Button>
      </Card>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-1 bg-card p-1 rounded-full border border-border/60 shadow-sm w-full md:w-auto overflow-x-auto">
          <Button variant={activeTab === "published" ? "default" : "ghost"} className={`rounded-full h-9 px-4 text-sm ${activeTab === "published" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "hover:bg-muted text-muted-foreground"}`} onClick={() => setActiveTab("published")}>
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Published
          </Button>
          <Button variant={activeTab === "drafts" ? "default" : "ghost"} className={`rounded-full h-9 px-4 text-sm ${activeTab === "drafts" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "hover:bg-muted text-muted-foreground"}`} onClick={() => setActiveTab("drafts")}>
            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Drafts
          </Button>
        </div>
        <div className="relative w-full md:w-80">
          <input type="text" placeholder="Search headline or content..." className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeTab === "published" ? (
          <>
            <Card className="border-border/60 bg-card rounded-2xl overflow-hidden hover:shadow-md transition-all group animate-fade-in flex flex-col">
              <div className="h-40 relative overflow-hidden bg-muted">
                <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-semibold shadow-sm">Published</Badge>
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-2">The Future of AI on Campus</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">An inside look at how our university is adopting artificial intelligence in everyday studies, from smart grading to virtual classrooms.</p>
                <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                  <span>Published: Oct 2026</span>
                  <span className="flex items-center gap-1 font-bold text-emerald-500"><ArrowUpRight className="w-3 h-3" /> 1.2k upvotes</span>
                </div>
                <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-9" onClick={() => setDialogArticle({ title: 'The Future of AI on Campus', date: 'Oct 2026', img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80' })}>
                    <Eye className="w-4 h-4 mr-2" /> Read Article
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60 bg-card rounded-2xl overflow-hidden hover:shadow-md transition-all group animate-fade-in flex flex-col">
              <div className="h-40 relative overflow-hidden bg-muted">
                <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-semibold shadow-sm">Published</Badge>
                </div>
              </div>
              <CardContent className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg mb-2">Hackathon Winners Announced</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">Team 'ByteMe' takes home the grand prize after an exhausting 48-hour coding marathon, showcasing incredible innovation.</p>
                <div className="flex items-center gap-4 mb-4 text-xs text-muted-foreground">
                  <span>Published: Sep 2026</span>
                  <span className="flex items-center gap-1 font-bold text-emerald-500"><ArrowUpRight className="w-3 h-3" /> 845 upvotes</span>
                </div>
                <div className="mt-auto pt-4 border-t border-border/50 flex items-center justify-between">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-9" onClick={() => setDialogArticle({ title: 'Hackathon Winners Announced', date: 'Sep 2026', img: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&auto=format&fit=crop&q=80' })}>
                    <Eye className="w-4 h-4 mr-2" /> Read Article
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="border-border/60 bg-card rounded-2xl overflow-hidden hover:shadow-md transition-all group animate-fade-in flex flex-col">
            <div className="h-40 relative overflow-hidden bg-muted flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-muted-foreground/30" />
              <div className="absolute top-3 right-3">
                <Badge variant="outline" className="bg-background/90 text-foreground backdrop-blur-sm border-0 text-[10px] font-semibold px-2 shadow-sm">Draft</Badge>
              </div>
            </div>
            <CardContent className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-lg mb-2">Interview with the Dean</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">A comprehensive discussion regarding the upcoming structural changes to the curriculum and campus facilities.</p>
              <div className="flex gap-2 w-full pt-4 border-t border-border/50 justify-between items-center mt-auto">
                <Button variant="ghost" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs h-9 px-3" onClick={() => window.location.href = '/auth'}>
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Discard
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="text-xs h-9 px-3 border-border/80" onClick={() => setDialogArticle({ title: 'Interview with the Dean', date: 'Drafted 2 hours ago' })}>
                    <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                  </Button>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-9 px-4" onClick={() => onNavigate("write")}>
                    <PenTool className="w-3.5 h-3.5 mr-1" /> Continue
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {dialogArticle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-fade-in" onClick={() => setDialogArticle(null)}>
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border overflow-hidden flex flex-col relative animate-scale-in" onClick={e => e.stopPropagation()} style={{ animationDuration: "0.2s" }}>
            <Button variant="ghost" size="icon" className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full z-10 w-8 h-8" onClick={() => setDialogArticle(null)}>
              <X className="w-4 h-4" />
            </Button>
            {dialogArticle.img ? (
              <div className="h-48 md:h-56 w-full relative bg-muted">
                <img src={dialogArticle.img} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h2 className="text-2xl font-bold text-white leading-tight">{dialogArticle.title}</h2>
                  <p className="text-white/80 text-sm mt-1">{dialogArticle.date}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 pb-2 border-b border-border/50 bg-muted/20">
                <h2 className="text-2xl font-bold text-foreground leading-tight">{dialogArticle.title}</h2>
                <p className="text-muted-foreground text-sm mt-1">{dialogArticle.date}</p>
              </div>
            )}
            <div className="p-5 space-y-4">
              <div className="bg-muted/30 p-4 rounded-xl border border-border/40 max-h-60 overflow-y-auto font-serif">
                <p className="text-foreground text-sm leading-relaxed mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="text-foreground text-sm leading-relaxed">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="outline" onClick={() => setDialogArticle(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const JournalistWriteDemo = ({ onNavigate }) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <Card className="p-6 md:p-8 rounded-2xl border-border/70 bg-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] uppercase tracking-widest shadow-none mb-3">Newsroom Studio</Badge>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">Write & Publish Campus Story</h2>
          <p className="text-sm text-muted-foreground max-w-xl">Compose articles using Markdown, attach photojournalism visuals, and distribute verified news to campus readers.</p>
        </div>
        <Button variant="outline" className="shrink-0 text-emerald-600 border-emerald-500/30 hover:bg-emerald-50" onClick={() => onNavigate("articles")}><ArrowLeft className="w-4 h-4 mr-2" /> My Articles</Button>
      </Card>

      <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Headline Title *</label>
            <input type="text" placeholder="e.g. Annual University Hackathon Unveils New Innovation Grants" className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground">Lead Abstract / Summary</label>
            <textarea rows={3} placeholder="Provide a concise 1-2 sentence overview of the news story..." className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none shadow-sm"></textarea>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card">
        <div className="border-b border-border/50 bg-muted/10 px-4 py-3 flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 bg-background border-border/80 shadow-sm text-xs"><PenTool className="w-3 h-3 mr-1.5" /> Editor</Button>
            <Button variant="ghost" size="sm" className="h-8 text-muted-foreground text-xs"><Eye className="w-3 h-3 mr-1.5" /> Live Preview</Button>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
            <span>**bold**</span>
            <span>*italic*</span>
            <span>## Heading</span>
            <span> Quote</span>
            <span>[Link](url)</span>
          </div>
        </div>
        <CardContent className="p-0">
          <textarea rows={12} className="w-full px-6 py-4 bg-transparent border-0 text-sm focus:outline-none focus:ring-0 resize-vertical font-mono" defaultValue={`Write your news article in Markdown format here...\n\n## Key Highlights\n- Detail event facts\n- Cite campus interviews\n- Discuss future outlook`}></textarea>
        </CardContent>
        <div className="border-t border-border/50 bg-muted/10 px-4 py-2 flex justify-between items-center text-xs text-muted-foreground">
          <span>Supports Markdown formatting</span>
          <span>164 characters</span>
        </div>
      </Card>

      <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card">
        <CardContent className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="font-bold flex items-center gap-2 mb-1"><Upload className="w-4 h-4 text-emerald-500" /> Media & Attachments</h3>
            <p className="text-xs text-muted-foreground">Attach up to 5 photos (first image acts as primary cover) and an optional print edition PDF.</p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2">
            <div className="w-32 h-32 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 hover:border-emerald-500/50 hover:text-emerald-600 transition-colors cursor-pointer shrink-0">
              <Plus className="w-6 h-6 mb-2" />
              <span className="text-xs font-semibold">Add Photo</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">0 of 5 images attached.</p>

          <div className="pt-6 border-t border-border/50">
            <label className="text-xs font-bold text-foreground block mb-2">Print Edition PDF (Optional)</label>
            <Button variant="outline" size="sm" className="h-9 border-border/80 hover:bg-muted"><Upload className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Upload Gazette PDF (Max 10MB)</Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-4">
        <Button variant="ghost" className="w-full sm:w-auto text-muted-foreground hover:text-destructive hover:bg-destructive/10"><Trash2 className="w-4 h-4 mr-2" /> Clear Form</Button>
        <div className="flex w-full sm:w-auto gap-3">
          <Button variant="outline" className="flex-1 sm:flex-none border-emerald-500/30 text-emerald-600 hover:bg-emerald-50" onClick={() => window.location.href = '/auth'}><BookOpen className="w-4 h-4 mr-2" /> Save as Draft</Button>
          <Button className="flex-1 sm:flex-none bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" onClick={() => window.location.href = '/auth'}><Send className="w-4 h-4 mr-2" /> Publish to Campus</Button>
        </div>
      </div>
    </div>
  );
};

const JournalistSettingsDemo = () => {
  const [activeSubTab, setActiveSubTab] = useState("profile");

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3">Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      <div className="flex gap-1 mb-2 bg-card p-1 rounded-full border border-border/60 shadow-sm inline-flex">
        <Button
          variant={activeSubTab === "profile" ? "default" : "ghost"}
          onClick={() => setActiveSubTab("profile")}
          className={`rounded-full h-9 px-4 text-sm ${activeSubTab === "profile" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "hover:bg-muted text-muted-foreground"}`}
        >
          <User className="w-3.5 h-3.5 mr-1.5" /> Profile
        </Button>
        <Button
          variant={activeSubTab === "security" ? "default" : "ghost"}
          onClick={() => setActiveSubTab("security")}
          className={`rounded-full h-9 px-4 text-sm ${activeSubTab === "security" ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "hover:bg-muted text-muted-foreground"}`}
        >
          <Shield className="w-3.5 h-3.5 mr-1.5" /> Security
        </Button>
      </div>

      {activeSubTab === "profile" && (
        <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card animate-fade-in" style={{ animationDuration: "0.2s" }}>
          <CardContent className="p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-bold">Profile Information</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Update your personal details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">Full Name</label>
                <input type="text" defaultValue="John Doe" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-foreground">About</label>
                <input type="text" defaultValue="A passionate storyteller covering campus events." className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">Portfolio Url</label>
              <input type="url" placeholder="https://" className="w-full md:w-1/2 px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
            </div>

            <div className="pt-4">
              <Button className="bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white" onClick={() => window.location.href = '/auth'}>Save Changes</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSubTab === "security" && (
        <Card className="border-border/60 shadow-sm rounded-xl overflow-hidden bg-card animate-fade-in" style={{ animationDuration: "0.2s" }}>
          <CardContent className="p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-lg font-bold">Account Security & Credentials</h3>
              <p className="text-sm text-muted-foreground mt-1">Update your account password to ensure your journalist profile remains secure</p>
            </div>

            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground">Current Password *</label>
                <input type="password" placeholder="Enter current password" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground">New Password *</label>
                <input type="password" placeholder="At least 6 characters" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-foreground">Confirm New Password *</label>
                <input type="password" placeholder="Re-enter new password" className="w-full px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <Button className="bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white" onClick={() => window.location.href = '/auth'}><Lock className="w-4 h-4 mr-2" /> Update Password</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const ProfessorDashboardDemo = () => {
  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card/90 to-emerald-500/5 p-6 shadow-xs flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-[11px] font-semibold border-emerald-500/20 bg-emerald-500/10 text-emerald-600 uppercase tracking-wider">
              FACULTY PORTAL
            </Badge>
            <span className="text-[11px] text-muted-foreground">• Academic Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-3">
            Welcome back, Prof. Alex!
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium"><Building2 className="w-3.5 h-3.5" /> DDU</span>
            <span className="text-border mx-1">•</span>
            <Badge variant="secondary" className="text-[10px] bg-muted/60 font-medium">Information Technology</Badge>
            <span className="text-border mx-1">•</span>
            <span>Academic Session 2026-27</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 shadow-sm" onClick={() => window.location.href = '/auth'}>
            Submit Research <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
          <Button className="bg-emerald-500 hover:bg-emerald-600 shadow-sm text-white" onClick={() => window.location.href = '/auth'}>
            Evaluate Papers <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending Reviews", val: "2", icon: Clock, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
          { label: "Evaluated Researches", val: "2", icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
          { label: "Mentored Clubs", val: "1", icon: Users, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
          { label: "My Research Papers", val: "0", icon: GraduationCap, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" }
        ].map((stat, i) => (
          <Card key={i} className="border-border/70 bg-card/80 hover:border-emerald-500/30 hover:shadow-sm transition-all rounded-2xl cursor-pointer group">
            <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center text-center h-full">
              <ArrowUpRight className="absolute top-3 right-3 w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-foreground transition-colors shrink-0" />
              <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${stat.color} transition-transform group-hover:scale-105 mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.val}</p>
              <p className="text-sm font-semibold text-foreground/80 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4 pt-4">
        <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-2">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" /> Position of Responsibility
              <Badge variant="outline" className="text-[10px] ml-1 bg-emerald-500/5 text-emerald-600 border-emerald-500/20 font-medium">Faculty Mentorship</Badge>
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Clubs and student organizations operating under your official faculty mentorship</p>
          </div>
          <Button variant="ghost" className="text-xs text-muted-foreground hover:text-foreground h-8 px-2" onClick={() => window.location.href = '/auth'}>
            Browse All Clubs <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="border-border/60 bg-card rounded-2xl overflow-hidden hover:border-emerald-500/30 hover:shadow-md transition-all group flex flex-col">
            <div className="h-40 relative overflow-hidden bg-muted">
              <img src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&auto=format&fit=crop&q=80" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80" />
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge className="bg-emerald-500 text-white border-0 text-[10px] font-semibold px-2 shadow-sm">Mentored by You</Badge>
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Shield className="w-16 h-16 text-white/20" />
              </div>
            </div>
            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg group-hover:text-emerald-500 transition-colors">Data Science Society</h3>
                <div className="flex items-center gap-1 text-xs font-medium bg-muted px-2 py-1 rounded-md text-muted-foreground border border-border/50">
                  <Users className="w-3.5 h-3.5" /> 142
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">Empowering students through data analytics, machine learning, and AI research projects.</p>
              <div className="pt-3 border-t border-border/50 text-xs text-muted-foreground mb-4">
                <span className="font-medium text-foreground">Lead:</span> Alice Johnson
              </div>
              <div className="mt-auto pt-1">
                <Button variant="outline" className="w-full text-emerald-600 border-emerald-500/30 hover:bg-emerald-50 text-xs h-9" onClick={() => window.location.href = '/auth'}>
                  <Eye className="w-4 h-4 mr-1.5" /> Open Mentor Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold flex items-center gap-2 text-emerald-600"><Megaphone className="w-4 h-4" /> Club Announcements Feed</h3>
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer flex items-center">View All <ArrowRight className="w-3 h-3 ml-1" /></span>
          </div>
          <Card className="border-border/60 bg-card rounded-xl">
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <span className="text-blue-600 font-bold text-sm">DS</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Call for Machine Learning Papers</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Data Science Society • 2 hours ago</p>
                  <p className="text-sm mt-2 line-clamp-2">We are accepting submissions for the upcoming ML symposium. Submit your abstracts by Friday!</p>
                </div>
              </div>
              <div className="border-t border-border/50 pt-4 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <span className="text-purple-600 font-bold text-sm">RC</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Robotics Workshop Postponed</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Robotics Club • 1 day ago</p>
                  <p className="text-sm mt-2 line-clamp-2">Due to unexpected maintenance in the lab, the workshop has been moved to next Tuesday.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold flex items-center gap-2 text-emerald-600"><Calendar className="w-4 h-4" /> Upcoming Club Events Pipeline</h3>
            <span className="text-xs text-muted-foreground hover:text-foreground cursor-pointer flex items-center">View All <ArrowRight className="w-3 h-3 ml-1" /></span>
          </div>
          <Card className="border-border/60 bg-card rounded-xl">
            <CardContent className="p-4 space-y-4">
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Oct</span>
                  <span className="text-lg font-bold text-emerald-700 leading-none">14</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">Data Science Symposium</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Data Science Society</p>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs">Review</Button>
              </div>
              <div className="border-t border-border/50 pt-4 flex gap-3 items-center">
                <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Oct</span>
                  <span className="text-lg font-bold text-emerald-700 leading-none">20</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">AI Ethics Guest Lecture</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">Data Science Society</p>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-xs">Review</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ProfessorReviewDemo = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [filter, setFilter] = useState("all");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" | "oldest"

  const evaluatedPapers = [
    {
      id: 1,
      title: "Blockchain-based Voting Systems: A Security Analysis",
      author: "Aman Gupta",
      rollNo: "22ituos091",
      status: "approved",
      feedback: "Excellent methodology. The practical implementation of the consensus algorithm is well-documented. Ready for publication.",
      date: "Sept 28, 2026",
      timestamp: new Date("2026-09-28").getTime(),
      category: "Cybersecurity",
      score: 92
    },
    {
      id: 2,
      title: "Augmented Reality in E-Commerce",
      author: "Sarah Khan",
      rollNo: "24ituos022",
      status: "rejected",
      feedback: "The literature review is lacking proper citations and the experimental setup requires a much larger sample size to draw conclusive results. Needs major revision.",
      date: "Sept 25, 2026",
      timestamp: new Date("2026-09-25").getTime(),
      category: "HCI",
      score: 45
    }
  ];

  const filteredPapers = evaluatedPapers.filter(paper => filter === "all" || paper.status === filter);
  const sortedPapers = [...filteredPapers].sort((a, b) => {
    return sortOrder === "newest" ? b.timestamp - a.timestamp : a.timestamp - b.timestamp;
  });

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-500" /> Peer Review & Academic Evaluations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Evaluate student research manuscripts assigned to you by college administration</p>
        </div>
        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search papers, student author..."
            className="pl-9 pr-4 py-2 bg-muted/20 border border-border/80 rounded-lg text-sm w-full md:w-[320px] focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex gap-1 border border-border/60 bg-card rounded-lg p-1 w-fit shadow-xs">
          <button
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "pending" ? "bg-emerald-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Evaluation
          </button>
          <button
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "evaluated" ? "bg-emerald-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}
            onClick={() => setActiveTab("evaluated")}
          >
            Evaluated
          </button>
        </div>

        {activeTab === "evaluated" && (
          <div className="flex gap-4 items-center flex-wrap animate-fade-in" style={{ animationDuration: "0.2s" }}>
            <div className="flex gap-2">
              <Badge
                variant={filter === "all" ? "default" : "outline"}
                className={`cursor-pointer border-border transition-colors ${filter === "all" ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-500" : "hover:bg-muted font-normal text-muted-foreground bg-card"}`}
                onClick={() => setFilter("all")}
              >
                All
              </Badge>
              <Badge
                variant={filter === "approved" ? "default" : "outline"}
                className={`cursor-pointer border-border transition-colors ${filter === "approved" ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-500" : "hover:bg-muted font-normal text-muted-foreground bg-card"}`}
                onClick={() => setFilter("approved")}
              >
                Approved
              </Badge>
              <Badge
                variant={filter === "rejected" ? "default" : "outline"}
                className={`cursor-pointer border-border transition-colors ${filter === "rejected" ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-500" : "hover:bg-muted font-normal text-muted-foreground bg-card"}`}
                onClick={() => setFilter("rejected")}
              >
                Rejected
              </Badge>
            </div>

            <div className="relative">
              <Button variant="outline" size="sm" className="h-7 text-xs flex items-center gap-1 rounded-full border-border/80 bg-card hover:bg-muted" onClick={() => setSortOpen(!sortOpen)}>
                {sortOrder === "newest" ? "Newest First" : "Oldest First"} <ChevronDown className="w-3 h-3 text-muted-foreground ml-1" />
              </Button>
              {sortOpen && (
                <div className="absolute top-full left-0 mt-1 w-40 bg-card border border-border shadow-md rounded-lg py-1 z-10 text-sm overflow-hidden animate-fade-in" style={{ animationDuration: "0.15s" }}>
                  <div className={`px-3 py-1.5 flex justify-between items-center cursor-pointer transition-colors ${sortOrder === "newest" ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100/50" : "hover:bg-muted text-muted-foreground"}`} onClick={() => { setSortOrder("newest"); setSortOpen(false); }}>
                    Newest First {sortOrder === "newest" && <Check className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`px-3 py-1.5 flex justify-between items-center cursor-pointer transition-colors ${sortOrder === "oldest" ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100/50" : "hover:bg-muted text-muted-foreground"}`} onClick={() => { setSortOrder("oldest"); setSortOpen(false); }}>
                    Oldest First {sortOrder === "oldest" && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {activeTab === "pending" && (
          <>
            <Card className="border-border/60 bg-card rounded-xl hover:shadow-md transition-all group overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-stretch">
                  <div className="w-full md:w-2 bg-amber-500 shrink-0 h-2 md:h-auto" />
                  <div className="p-5 md:p-6 flex-1">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">Optimizing Deep Neural Networks for Low-Power IoT Devices</h3>
                        <p className="text-sm text-muted-foreground">Author: Rahul Sharma <span className="opacity-60 text-xs ml-1">(23ituos045)</span></p>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 shrink-0"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Submitted: Oct 2, 2026</span>
                      <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> Category: Machine Learning</span>
                    </div>
                  </div>
                  <div className="p-5 md:p-6 bg-muted/20 border-t md:border-t-0 md:border-l border-border flex flex-row md:flex-col items-center justify-center gap-3 shrink-0 md:w-48">
                    <Button variant="outline" className="w-full text-xs shadow-sm bg-card hover:bg-muted" onClick={() => window.location.href = '/auth'}><Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF</Button>
                    <Button className="w-full text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" onClick={() => window.location.href = '/auth'}><CheckSquare className="w-3.5 h-3.5 mr-1.5" /> Evaluate Paper</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card rounded-xl hover:shadow-md transition-all group overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row md:items-stretch">
                  <div className="w-full md:w-2 bg-amber-500 shrink-0 h-2 md:h-auto" />
                  <div className="p-5 md:p-6 flex-1">
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div>
                        <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">Quantum Computing Algorithms for Cryptography</h3>
                        <p className="text-sm text-muted-foreground">Author: Priya Patel <span className="opacity-60 text-xs ml-1">(23ituos012)</span></p>
                      </div>
                      <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20 shrink-0"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                      <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Submitted: Oct 3, 2026</span>
                      <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> Category: Quantum Physics</span>
                    </div>
                  </div>
                  <div className="p-5 md:p-6 bg-muted/20 border-t md:border-t-0 md:border-l border-border flex flex-row md:flex-col items-center justify-center gap-3 shrink-0 md:w-48">
                    <Button variant="outline" className="w-full text-xs shadow-sm bg-card hover:bg-muted" onClick={() => window.location.href = '/auth'}><Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF</Button>
                    <Button className="w-full text-xs bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" onClick={() => window.location.href = '/auth'}><CheckSquare className="w-3.5 h-3.5 mr-1.5" /> Evaluate Paper</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "evaluated" && (
          sortedPapers.length === 0 ? (
            <Card className="w-full border-border/40 shadow-sm bg-card hover:shadow-md transition-shadow">
              <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-[250px]">
                <CheckSquare className="w-10 h-10 text-muted-foreground/50 mb-4" />
                <h3 className="font-bold text-base text-foreground">No Evaluated Papers Found</h3>
                <p className="text-xs text-muted-foreground mt-1">No research papers have been reviewed under the selected filter.</p>
              </CardContent>
            </Card>
          ) : (
            sortedPapers.map(paper => (
              <Card key={paper.id} className="border-border/60 bg-card rounded-xl hover:shadow-md transition-all group overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-stretch">
                    <div className={`w-full md:w-2 shrink-0 h-2 md:h-auto ${paper.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div className="p-5 md:p-6 flex-1">
                      <div className="flex justify-between items-start gap-4 mb-3">
                        <div>
                          <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors">{paper.title}</h3>
                          <p className="text-sm text-muted-foreground">Author: {paper.author} <span className="opacity-60 text-xs ml-1">({paper.rollNo})</span></p>
                        </div>
                        {paper.status === 'approved' ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 shrink-0"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>
                        ) : (
                          <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20 shrink-0"><X className="w-3 h-3 mr-1" /> Rejected</Badge>
                        )}
                      </div>
                      <div className={`p-3 rounded-lg border my-4 text-sm ${paper.status === 'approved' ? 'bg-emerald-50/50 border-emerald-100/50 text-emerald-800' : 'bg-red-50/50 border-red-100/50 text-red-800'}`}>
                        <span className={`font-semibold mr-2 ${paper.status === 'approved' ? 'text-emerald-900' : 'text-red-900'}`}>Your Feedback:</span>
                        {paper.feedback}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-4 pt-4 border-t border-border/50">
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Evaluated: {paper.date}</span>
                        <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> Category: {paper.category}</span>
                      </div>
                    </div>
                    <div className="p-5 md:p-6 bg-muted/20 border-t md:border-t-0 md:border-l border-border flex flex-row md:flex-col items-center justify-center gap-3 shrink-0 md:w-48">
                      <div className="text-center w-full mb-2 hidden md:block">
                        <div className={`text-2xl font-bold ${paper.status === 'approved' ? 'text-emerald-600' : 'text-red-600'}`}>{paper.score}/100</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mt-1">Final Score</div>
                      </div>
                      <Button variant="outline" className="w-full text-xs shadow-sm bg-card hover:bg-muted" onClick={() => window.location.href = '/auth'}><Eye className="w-3.5 h-3.5 mr-1.5" /> View Details</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )
        )}
      </div>
    </div>
  );
};

const ClubMentorDashboardDemo = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <Card className="overflow-hidden border-border/60 bg-card rounded-2xl shadow-sm">
        <div className="h-12 md:h-16 bg-gradient-to-r from-emerald-500/20 via-primary/10 to-transparent"></div>
        <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 relative">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-start relative -top-6 sm:-top-8 mb-[-24px] sm:mb-[-32px]">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white shadow-sm border-[3px] border-white flex items-center justify-center shrink-0 overflow-hidden">
              <img src="/placeholder-logo.png" alt="Data Science Society" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=DS&background=10b981&color=fff&size=200" }} />
            </div>

            <div className="flex-1 pt-1 sm:pt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold">Data Science Society</h1>
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium shadow-sm border-0 text-[10px] px-2 py-0 h-5"><CheckCircle className="w-3 h-3 mr-1" /> Mentorship Active</Badge>
                </div>
                <p className="text-muted-foreground text-xs max-w-2xl">Exploring data science, machine learning, and AI through collaborative projects and research.</p>

                <div className="mt-2 flex items-center gap-2 text-xs">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold">Student Lead: Alice Johnson</span>
                  <span className="text-muted-foreground ml-1">(Information Technology)</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0 md:min-w-[180px]">
                <Button variant="outline" className="w-full justify-center shadow-sm text-xs bg-card hover:bg-muted text-emerald-600 border-border/80 h-8 px-3" onClick={() => window.location.href = '/auth'}>
                  <GraduationCap className="w-3.5 h-3.5 mr-1.5" /> Return to Professor
                </Button>
                <Button variant="outline" className="w-full justify-center shadow-sm text-xs bg-card hover:bg-muted border-border/80 h-8 px-3" onClick={() => window.location.href = '/auth'}>
                  <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Governance: <span className="font-semibold text-foreground ml-1">Direct</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Community Followers", value: "142", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Enrolled Club Members", value: "28", icon: User, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Operational Wings / Teams", value: "3", icon: Shield, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Active & Ongoing Events", value: "1", icon: Calendar, color: "text-amber-500", bg: "bg-amber-500/10" }
        ].map((stat, i) => (
          <Card key={i} className="border-border/60 bg-card rounded-xl hover:shadow-md transition-shadow relative overflow-hidden group">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center relative z-10">
              <div className="absolute top-3 right-3 text-muted-foreground/30 group-hover:text-primary transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-border/60 bg-card rounded-xl shadow-sm flex flex-col">
          <div className="p-5 border-b border-border/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold flex items-center gap-2"><Calendar className="w-4 h-4 text-emerald-500" /> Recent Club Events <span className="text-xs font-normal text-muted-foreground ml-1">(Latest 5)</span></h3>
              <p className="text-xs text-muted-foreground">Live and scheduled club activities</p>
            </div>
            <button className="text-xs text-emerald-600 font-medium hover:underline">View All</button>
          </div>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-border/50">
              <div className="p-4 sm:p-5 hover:bg-muted/50 transition-colors flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex flex-col items-center justify-center shrink-0 border border-emerald-500/20">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Oct</span>
                  <span className="text-lg font-black text-emerald-700 leading-none">10</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Intro to Neural Networks Workshop</h4>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 4:00 PM</span>
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Lab 3</span>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-5 hover:bg-muted/50 transition-colors flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex flex-col items-center justify-center shrink-0 border border-emerald-500/20">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Oct</span>
                  <span className="text-lg font-black text-emerald-700 leading-none">15</span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-1">Kaggle Competition Kickoff</h4>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 5:30 PM</span>
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> Main Auditorium</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card rounded-xl shadow-sm flex flex-col">
          <div className="p-5 border-b border-border/50 flex justify-between items-center">
            <div>
              <h3 className="font-bold flex items-center gap-2"><Megaphone className="w-4 h-4 text-emerald-500" /> Recent Announcements <span className="text-xs font-normal text-muted-foreground ml-1">(Latest 5)</span></h3>
              <p className="text-xs text-muted-foreground">Official published bulletins and updates</p>
            </div>
            <button className="text-xs text-emerald-600 font-medium hover:underline">View All</button>
          </div>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-border/50">
              <div className="p-4 sm:p-5 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h4 className="font-semibold text-sm">Looking for new project leads!</h4>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-full">Oct 3, 2026</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">We are opening applications for project leads for the upcoming semester. If you have experience with ML and want to mentor others, apply now!</p>
              </div>
              <div className="p-4 sm:p-5 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h4 className="font-semibold text-sm">Datathon 2026 Winners 🏆</h4>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded-full">Sept 28, 2026</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">Congratulations to our club's team for securing the first place in the national Datathon 2026! A proud moment for the Data Science Society.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DemoPreview;

const CollegeAdminDashboardDemo = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <Card className="border-border/60 bg-card rounded-2xl shadow-sm overflow-hidden">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              <Badge variant="outline" className="text-[10px] font-normal shadow-none bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-2 py-0">INSTITUTION COMMAND CENTER</Badge>
              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> System Active</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Global University</h1>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">Review live campus activities, publication queues, academic papers, and student organizations.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" className="border-border/80 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => window.location.href = '/auth'}>Settings</Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm rounded-full" onClick={() => window.location.href = '/auth'}>Clubs Hub <ArrowRight className="w-4 h-4 ml-2" /></Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Clubs", value: "1", icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Research Papers", value: "0", icon: BookOpen, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Journalists", value: "1", icon: Newspaper, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Enrolled Students", value: "3", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" }
        ].map((stat, i) => (
          <Card key={i} className="border-border/60 bg-card rounded-xl hover:shadow-md transition-shadow relative overflow-hidden group">
            <CardContent className="p-6 flex flex-col items-center justify-center text-center relative z-10">
              <div className="absolute top-3 right-3 text-muted-foreground/30 group-hover:text-primary transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </div>
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-3xl font-bold mb-1">{stat.value}</h3>
              <p className="text-xs font-semibold text-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Latest Newspaper</h3>
              <p className="text-xs text-muted-foreground">Most recently published edition</p>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1">View Feed <ArrowRight className="w-3 h-3" /></button>
          </div>
          <Card className="border-border/60 bg-card rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-0 flex h-40 overflow-hidden group">
              <div className="w-1/3 bg-muted relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80" alt="Newspaper" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-emerald-500 text-white border-0 text-[10px] shadow-sm">Vol. 42</Badge>
                </div>
              </div>
              <div className="w-2/3 p-4 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm">Fall Semester Kickoff</h4>
                  <span className="text-[10px] text-muted-foreground">2d ago</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 flex-1 mt-1">Exploring the new facilities and introducing the updated curriculum for incoming freshmen this semester.</p>
                <div className="flex items-center gap-2 mt-auto">
                  <Avatar className="w-5 h-5"><AvatarFallback className="bg-primary/10 text-[8px] text-primary">JD</AvatarFallback></Avatar>
                  <span className="text-[10px] text-muted-foreground font-medium">By John Doe</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Upcoming Events</h3>
              <p className="text-xs text-muted-foreground">Next 3 scheduled campus activities</p>
            </div>
            <button className="text-xs text-muted-foreground hover:text-foreground font-medium flex items-center gap-1">All Events <ArrowRight className="w-3 h-3" /></button>
          </div>
          <Card className="border-border/60 bg-card rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-0 flex h-40 overflow-hidden group">
              <div className="w-1/3 bg-muted relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80" alt="Event" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2">
                  <Badge className="bg-emerald-500 text-white border-0 text-[10px] shadow-sm">Live</Badge>
                </div>
              </div>
              <div className="w-2/3 p-4 flex flex-col">
                <h4 className="font-bold text-sm">Tech Symposium 2026</h4>
                <div className="space-y-1 mt-2">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="w-3.5 h-3.5" /> <span>Oct 12, 10:00 AM</span></div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Building2 className="w-3.5 h-3.5" /> <span>Main Auditorium</span></div>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <Badge variant="outline" className="text-[10px] font-normal shadow-none bg-muted/50 border-border/50">Code & Develop Club</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const CollegeAdminClubsDemo = () => {
  const [activeSubTab, setActiveSubTab] = useState("Active Clubs");

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Clubs & Campus Life</h2>
          <p className="text-sm text-muted-foreground mt-1">Oversee recognized student clubs, announcements, events, and approval requests.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input type="text" placeholder="Search clubs, events, posts..." className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 border-b border-border/50">
        {["Active Clubs", "Announcements", "Active Events", "Completed Events"].map(t => (
          <Button key={t} variant={activeSubTab === t ? "default" : "ghost"} className={`rounded-full h-9 px-4 text-sm shrink-0 ${activeSubTab === t ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"}`} onClick={() => setActiveSubTab(t)}>{t}</Button>
        ))}
      </div>

      {activeSubTab === "Active Clubs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border border-border/60 bg-card rounded-2xl overflow-hidden group transition-all flex flex-col hover:border-primary/40 hover:shadow-md">
            <div className="relative h-48 bg-muted overflow-hidden shrink-0">
              <img src="/placeholder-logo.png" alt="Code & Develop Club" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=C&D&background=10b981&color=fff&size=200" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
              <div className="absolute top-3 right-3 flex gap-2">
                <Button variant="ghost" size="icon" className="w-8 h-8 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md"><MoreVertical className="w-4 h-4" /></Button>
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs font-medium bg-background/90 px-2 py-1 rounded-md text-foreground shadow-sm">
                <Users className="w-3.5 h-3.5 text-muted-foreground" /> 42
              </div>
            </div>
            <CardContent className="p-5 flex-1 flex flex-col">
              <h3 className="font-bold text-xl mb-1 group-hover:text-primary transition-colors truncate">Code & Develop Club</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 flex-1 mb-6">A community for aspiring developers to build projects and learn new technologies.</p>
              <Button variant="outline" className="w-full text-sm border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 shadow-sm mt-auto" onClick={() => window.location.href = '/auth'}><Eye className="w-4 h-4 mr-1.5" /> Explore Club Details <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-50" /></Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === "Announcements" && (
        <div className="space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">Looking for new project leads!</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><Clock className="w-3.5 h-3.5" /> Published by Code & Develop Club</p>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Live</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-4">We are opening applications for project leads for the upcoming semester. If you have experience with ML and want to mentor others, apply now!</p>
              <Button variant="outline" className="text-xs h-8 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 rounded-full" onClick={() => window.location.href = '/auth'}>View Announcement</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === "Active Events" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/60 shadow-sm flex overflow-hidden">
            <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80" alt="Tech Symposium" className="w-1/3 object-cover" />
            <CardContent className="p-4 flex-1">
              <h3 className="font-bold text-md mb-2">Tech Symposium 2026</h3>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">Join us for a day of inspiring talks, hands-on workshops, and networking with tech leaders.</p>
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="w-3.5 h-3.5" /> <span>Oct 12, 10:00 AM</span></div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Building2 className="w-3.5 h-3.5" /> <span>Main Auditorium</span></div>
              </div>
              <Button variant="outline" className="w-full text-xs h-8 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 rounded-full" onClick={() => window.location.href = '/auth'}>Manage Event</Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === "Completed Events" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-border/60 shadow-sm flex overflow-hidden opacity-75">
            <img src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80" alt="Hackathon" className="w-1/3 object-cover grayscale" />
            <CardContent className="p-4 flex-1">
              <h3 className="font-bold text-md mb-2">Spring Hackathon 2026</h3>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">A 48-hour coding marathon focused on building sustainable solutions for the campus.</p>
              <div className="space-y-1 mb-4">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><CheckCircle className="w-3.5 h-3.5" /> <span>Completed on Mar 15</span></div>
              </div>
              <Button variant="outline" className="w-full text-xs h-8 border-muted text-muted-foreground hover:bg-muted rounded-full" onClick={() => window.location.href = '/auth'}>View Report</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

const CollegeAdminUsersDemo = () => {
  const [activeSubTab, setActiveSubTab] = useState("Journalists");

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">User Directory</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage campus journalists, enrolled students, faculty professors, and position requests.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input type="text" placeholder="Search by name, email, ID..." className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 border-b border-border/50">
        {["Journalists", "Students", "Professors", "Pending Approval"].map(t => (
          <Button key={t} variant={activeSubTab === t ? "default" : "ghost"} className={`rounded-full h-9 px-4 text-sm shrink-0 ${activeSubTab === t ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"}`} onClick={() => setActiveSubTab(t)}>{t}</Button>
        ))}
      </div>

      {activeSubTab === "Journalists" && (
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="font-bold text-lg">Campus Journalists</h3>
              <p className="text-xs text-muted-foreground">Appointed student reporters publishing college newspaper editions.</p>
            </div>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm text-xs h-8 rounded-full px-4" onClick={() => window.location.href = '/auth'}><UserPlus className="w-3.5 h-3.5 mr-1.5" /> Add Journalist</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-border/60 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-sm">John Doe</h4>
                    <p className="text-xs text-muted-foreground">john.doe@university.edu</p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px] shadow-none">Active</Badge>
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-border/50 shadow-none bg-muted/30">ID: STUD-001</Badge>
                  <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-border/50 shadow-none bg-muted/30">Computer Science</Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center">Batch 4</span>
                </div>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1 text-xs h-8 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 rounded-full" onClick={() => window.location.href = '/auth'}>Deactivate</Button>
                  <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={() => window.location.href = '/auth'}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeSubTab === "Students" && (
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="font-bold text-lg">Enrolled Students</h3>
              <p className="text-xs text-muted-foreground">Total student directory registered in this institution.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 text-xs h-8 shadow-sm rounded-full px-4" onClick={() => window.location.href = '/auth'}><Upload className="w-3.5 h-3.5 mr-1.5" /> Excel Import</Button>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm text-xs h-8 rounded-full px-4" onClick={() => window.location.href = '/auth'}><UserPlus className="w-3.5 h-3.5 mr-1.5" /> Add Student</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "John Doe", email: "john.doe@university.edu", id: "STUD-001" },
              { name: "Jane Smith", email: "jane.smith@university.edu", id: "STUD-002" },
              { name: "Alice Walker", email: "alice.w@university.edu", id: "STUD-003" }
            ].map((s, i) => (
              <Card key={i} className="border-border/60 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-sm">{s.name}</h4>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-0 text-[10px] shadow-none">Active</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-border/50 shadow-none bg-muted/30">ID: {s.id}</Badge>
                    <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground border-border/50 shadow-none bg-muted/30">Information Technology</Badge>
                  </div>
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" className="flex-1 text-xs h-8 border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 rounded-full" onClick={() => window.location.href = '/auth'}>Suspend</Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={() => window.location.href = '/auth'}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === "Professors" && (
        <div className="space-y-4">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="font-bold text-lg">Faculty Professors</h3>
              <p className="text-xs text-muted-foreground">Academic faculty available as club mentors and research reviewers.</p>
            </div>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm text-xs h-8 rounded-full px-4" onClick={() => window.location.href = '/auth'}><UserPlus className="w-3.5 h-3.5 mr-1.5" /> Add Professor</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-border/60 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-border/50"><AvatarFallback className="bg-amber-100 text-amber-700 font-bold">R</AvatarFallback></Avatar>
                    <div>
                      <h4 className="font-bold text-sm flex items-center gap-2">Dr. Roberts <Badge className="bg-muted text-muted-foreground shadow-none border-0 text-[9px] uppercase px-1.5 py-0">Faculty</Badge></h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> dr.roberts@university.edu</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-2 -mr-2" onClick={() => window.location.href = '/auth'}><Trash2 className="w-4 h-4" /></Button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <Badge className="bg-emerald-500/10 text-emerald-700 border-0 text-[10px] shadow-none flex items-center gap-1"><GraduationCap className="w-3 h-3" /> Computer Science</Badge>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Joined Sep 28, 2026</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeSubTab === "Pending Approval" && (
        <div className="space-y-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h3 className="font-bold text-lg">Pending Requests</h3>
              <p className="text-xs text-muted-foreground">Review applications for new roles and club creations.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border/60 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-border/50 bg-amber-50 text-amber-700">
                      <AvatarFallback>EH</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-sm">Ethan Hunt</h4>
                      <p className="text-xs text-muted-foreground">ethan.h@university.edu</p>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-0 shadow-none">Journalist Request</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  <p><strong>Department:</strong> Mass Communication</p>
                  <p className="mt-1 text-xs">"I would like to cover the upcoming sports events and cultural fests for the university newsletter."</p>
                </div>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1 text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10 rounded-full" onClick={() => window.location.href = '/auth'}><X className="w-3.5 h-3.5 mr-1.5" /> Reject</Button>
                  <Button className="flex-1 text-xs h-8 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm rounded-full" onClick={() => window.location.href = '/auth'}><Check className="w-3.5 h-3.5 mr-1.5" /> Approve</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
              <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border border-border/50 bg-blue-50 text-blue-700">
                      <AvatarFallback>AI</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-sm">AI Research Club</h4>
                      <p className="text-xs text-muted-foreground">Requested by: Sarah Connor</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-0 shadow-none">Club Creation</Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  <p><strong>Proposed Mentor:</strong> Dr. Roberts</p>
                  <p className="mt-1 text-xs">"A new club dedicated to exploring artificial intelligence, machine learning, and hosting weekly study groups."</p>
                </div>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1 text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10 rounded-full" onClick={() => window.location.href = '/auth'}><X className="w-3.5 h-3.5 mr-1.5" /> Deny</Button>
                  <Button className="flex-1 text-xs h-8 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm rounded-full" onClick={() => window.location.href = '/auth'}><Check className="w-3.5 h-3.5 mr-1.5" /> Authorize</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

const ClubMentorSettingsDemo = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-3"><Settings className="w-6 h-6 text-emerald-500" /> Club Publishing Governance Policies</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure review and approval workflows for club content. Changes take effect immediately upon saving.</p>
      </div>

      <div className="space-y-8 mt-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2"><Megaphone className="w-5 h-5 text-emerald-500" /> Announcement Publishing Permission</h3>
          <p className="text-xs text-muted-foreground mb-4">Define the review hierarchy required before announcements are published publicly to the campus.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-emerald-500 bg-emerald-500/5 shadow-sm rounded-xl cursor-pointer hover:border-emerald-500 transition-colors relative overflow-hidden">
              <CardContent className="p-5 relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Badge className="bg-emerald-500 text-white border-0 text-[10px] shadow-sm">Multi-Tier Approval</Badge>
                  <div className="w-4 h-4 rounded-full border-4 border-emerald-500 bg-white shadow-sm"></div>
                </div>
                <h4 className="font-bold text-sm mb-1 mt-2">Club Mentor Permission Required</h4>
                <p className="text-xs text-muted-foreground flex-1 leading-relaxed">Member creates &rarr; Club Admin approves first &rarr; Moves to Mentor pending approval section &rarr; Mentor gives final approval &rarr; Goes Public.</p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card shadow-sm rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors">
              <CardContent className="p-5 h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px] shadow-none border-border/50">Admin Governed</Badge>
                  <div className="w-4 h-4 rounded-full border-2 border-border/60"></div>
                </div>
                <h4 className="font-bold text-sm mb-1 mt-2">Only Club Admin Permission Required</h4>
                <p className="text-xs text-muted-foreground flex-1 leading-relaxed">Member creates &rarr; Club Admin reviews & approves &rarr; Directly Goes Public. (Mentor pending approval section remains empty).</p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card shadow-sm rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors">
              <CardContent className="p-5 h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px] shadow-none border-border/50">Open Publishing</Badge>
                  <div className="w-4 h-4 rounded-full border-2 border-border/60"></div>
                </div>
                <h4 className="font-bold text-sm mb-1 mt-2">Direct Member Publishing</h4>
                <p className="text-xs text-muted-foreground flex-1 leading-relaxed">Any enrolled club member can directly publish announcements without waiting for admin or mentor approval.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-border/50">
          <h3 className="font-semibold text-lg flex items-center gap-2"><Calendar className="w-5 h-5 text-emerald-500" /> Event Publishing Permission</h3>
          <p className="text-xs text-muted-foreground mb-4">Define the review hierarchy required before events are published publicly on the campus calendar.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border/60 bg-card shadow-sm rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors">
              <CardContent className="p-5 h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px] shadow-none border-border/50">Multi-Tier Approval</Badge>
                  <div className="w-4 h-4 rounded-full border-2 border-border/60"></div>
                </div>
                <h4 className="font-bold text-sm mb-1 mt-2">Club Mentor Permission Required</h4>
                <p className="text-xs text-muted-foreground flex-1 leading-relaxed">Member organizes &rarr; Club Admin approves first &rarr; Moves to Mentor Pending Approval section &rarr; Mentor gives final approval &rarr; Goes Public.</p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-card shadow-sm rounded-xl cursor-pointer hover:border-emerald-500/50 transition-colors">
              <CardContent className="p-5 h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-muted text-muted-foreground text-[10px] shadow-none border-border/50">Admin Governed</Badge>
                  <div className="w-4 h-4 rounded-full border-2 border-border/60"></div>
                </div>
                <h4 className="font-bold text-sm mb-1 mt-2">Only Club Admin Permission Required</h4>
                <p className="text-xs text-muted-foreground flex-1 leading-relaxed">Member organizes &rarr; Club Admin reviews & approves &rarr; Directly Goes Public. (Mentor pending approval section remains empty).</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-500 bg-emerald-500/5 shadow-sm rounded-xl cursor-pointer hover:border-emerald-500 transition-colors relative overflow-hidden">
              <CardContent className="p-5 relative z-10 h-full flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <Badge className="bg-emerald-500 text-white border-0 text-[10px] shadow-sm">Open Publishing</Badge>
                  <div className="w-4 h-4 rounded-full border-4 border-emerald-500 bg-white shadow-sm"></div>
                </div>
                <h4 className="font-bold text-sm mb-1 mt-2">Direct Member Publishing</h4>
                <p className="text-xs text-muted-foreground flex-1 leading-relaxed">Any enrolled club member can directly publish events without waiting for admin or mentor approval.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex justify-end pt-6 border-t border-border/50">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 shadow-sm"><CheckCircle className="w-4 h-4 mr-2" /> Save Governance Policies</Button>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><Shield className="w-5 h-5 text-muted-foreground" /> Danger Zone: Club Deletion</h2>
            <p className="text-sm text-muted-foreground mt-1">As the designated faculty mentor, you hold the institutional authority to permanently dissolve or delete this club from the college.</p>
          </div>

          <Card className="border-destructive/30 bg-destructive/5 rounded-xl">
            <CardContent className="p-6 flex flex-col sm:flex-row gap-6 justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-foreground mb-1">Dissolve Data Science Society</h3>
                <p className="text-xs text-muted-foreground max-w-lg">Once deleted, all club records, announcements, past and ongoing events, registrations, teams, and member associations will be wiped immediately. This cannot be undone.</p>
              </div>
              <Button variant="destructive" className="shrink-0 whitespace-nowrap shadow-sm"><Trash2 className="w-4 h-4 mr-2" /> Dissolve Club</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export const CollegeAdminNewspaperDemo = () => {
  const [activeSubTab, setActiveSubTab] = useState("Campus");
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Newspaper Editions</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage campus releases, discover global student journalism, and review publication queues.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input type="text" placeholder="Search articles, journalists..." className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 border-b border-border/50">
        {["Campus", "Global", "Pending Approval"].map(t => (
          <Button key={t} variant={activeSubTab === t ? "default" : "ghost"} className={`rounded-full h-9 px-4 text-sm shrink-0 ${activeSubTab === t ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"}`} onClick={() => setActiveSubTab(t)}>{t}</Button>
        ))}
      </div>
      {activeSubTab === "Campus" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-border/60 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col">
            <div className="relative h-48 bg-muted w-full">
              <img src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80" alt="Newspaper Edition" className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <Badge className="bg-emerald-500 text-white shadow-sm border-0">Vol. 42</Badge>
              </div>
            </div>
            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg leading-tight">Fall Semester Kickoff & Campus Updates</h3>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">Exploring the new facilities and introducing the updated curriculum for incoming freshmen this semester. Interviews with the dean and more.</p>

              <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6"><AvatarFallback className="bg-primary/10 text-[10px] text-primary font-bold">JD</AvatarFallback></Avatar>
                  <span className="text-xs text-muted-foreground font-medium">John Doe</span>
                </div>
                <span className="text-[10px] text-muted-foreground">Published Oct 2</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === "Global" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-border/60 bg-card rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden flex flex-col">
            <div className="relative h-48 bg-muted w-full">
              <img src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop&q=80" alt="Global Edition" className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <Badge className="bg-blue-500 text-white shadow-sm border-0">Stanford Weekly</Badge>
              </div>
            </div>
            <CardContent className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg leading-tight">AI Advancements in Silicon Valley</h3>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">A deep dive into the latest AI research coming out of Stanford and its impact on the local tech ecosystem.</p>

              <div className="mt-auto pt-4 border-t border-border/50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6"><AvatarFallback className="bg-primary/10 text-[10px] text-primary font-bold">EM</AvatarFallback></Avatar>
                  <span className="text-xs text-muted-foreground font-medium">Emily Chen</span>
                </div>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Globe className="w-3 h-3" /> Global Feed</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === "Pending Approval" && (
        <div className="space-y-4">
          <Card className="border-border/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-border/50 bg-amber-50 text-amber-700">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-sm">John Doe</h4>
                    <p className="text-xs text-muted-foreground">Draft: "Interview with the New Dean"</p>
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-0 shadow-none">Needs Publishing</Badge>
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                <p className="mt-1 text-xs line-clamp-2">"An exclusive interview discussing the future plans for the university, upcoming infrastructure projects, and the new student welfare policies..."</p>
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="outline" className="flex-1 text-xs h-8 border-destructive/30 text-destructive hover:bg-destructive/10 rounded-full" onClick={() => window.location.href = '/auth'}><X className="w-3.5 h-3.5 mr-1.5" /> Reject</Button>
                <Button className="flex-1 text-xs h-8 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm rounded-full" onClick={() => window.location.href = '/auth'}><Check className="w-3.5 h-3.5 mr-1.5" /> Approve & Publish</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export const CollegeAdminResearchDemo = () => {
  const [activeSubTab, setActiveSubTab] = useState("Not Reviewed");
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Research Publications</h2>
          <p className="text-sm text-muted-foreground mt-1">Assign faculty reviewers, oversee campus academic outputs, and process globalization requests.</p>
        </div>
        <div className="relative w-full md:w-64">
          <input type="text" placeholder="Search papers, authors, subjects..." className="pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm" />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="flex overflow-x-auto pb-2 mb-6 gap-2 border-b border-border/50">
        {["Not Reviewed", "Campus", "Global", "Pending Approval"].map(t => (
          <Button key={t} variant={activeSubTab === t ? "default" : "ghost"} className={`rounded-full h-9 px-4 text-sm shrink-0 ${activeSubTab === t ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:bg-muted"}`} onClick={() => setActiveSubTab(t)}>{t}</Button>
        ))}
      </div>
      {activeSubTab === "Not Reviewed" && (
        <div className="space-y-4">
          <Card className="border-border/60 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-48 h-32 bg-muted rounded-xl shrink-0 overflow-hidden relative group">
                <img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80" alt="Paper Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge className="bg-emerald-500/90 text-white border-0 text-[10px] shadow-sm backdrop-blur-sm">PDF</Badge>
                </div>
              </div>
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div>
                    <h3 className="font-bold text-lg leading-tight truncate">Optimizing Neural Networks for Edge Devices</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-emerald-600 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">Computer Science</span>
                      <span className="text-xs text-muted-foreground">&bull;</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Submitted 2 days ago</span>
                    </div>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700 border-0 shadow-none whitespace-nowrap">Needs Reviewer</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2 mb-4">This paper explores novel quantization techniques for deploying large language models on low-power IoT and mobile edge devices with minimal accuracy loss.</p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6 border border-border/50"><AvatarFallback className="text-[10px] bg-muted text-muted-foreground">AS</AvatarFallback></Avatar>
                    <span className="text-xs text-muted-foreground font-medium">By Alex Smith</span>
                  </div>
                  <Button className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm h-8 text-xs rounded-full" onClick={() => window.location.href = '/auth'}><UserPlus className="w-3.5 h-3.5 mr-1.5" /> Assign Professor</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === "Campus" && (
        <div className="space-y-4">
          <Card className="border-border/60 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-48 h-32 bg-muted rounded-xl shrink-0 overflow-hidden relative group">
                <img src="https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=600&auto=format&fit=crop&q=80" alt="Paper Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge className="bg-emerald-500/90 text-white border-0 text-[10px] shadow-sm backdrop-blur-sm">PDF</Badge>
                </div>
              </div>
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div>
                    <h3 className="font-bold text-lg leading-tight truncate">Sustainable Urban Architecture</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-blue-600 font-medium bg-blue-500/10 px-2 py-0.5 rounded-full">Civil Engineering</span>
                      <span className="text-xs text-muted-foreground">&bull;</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Published 1 week ago</span>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-0 shadow-none whitespace-nowrap">Published</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2 mb-4">An analysis of sustainable building materials and their long-term cost benefits in urban environments.</p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6 border border-border/50"><AvatarFallback className="text-[10px] bg-muted text-muted-foreground">MW</AvatarFallback></Avatar>
                    <span className="text-xs text-muted-foreground font-medium">By Mia Wong</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Reviewed by Dr. Roberts
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === "Global" && (
        <div className="space-y-4">
          <Card className="border-border/60 shadow-sm transition-all hover:shadow-md">
            <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row gap-6">
              <div className="w-full sm:w-48 h-32 bg-muted rounded-xl shrink-0 overflow-hidden relative group">
                <img src="https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600&auto=format&fit=crop&q=80" alt="Paper Thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Badge className="bg-emerald-500/90 text-white border-0 text-[10px] shadow-sm backdrop-blur-sm">PDF</Badge>
                </div>
              </div>
              <div className="flex-1 flex flex-col min-w-0">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div>
                    <h3 className="font-bold text-lg leading-tight truncate">Quantum Computing: Practical Applications</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-purple-600 font-medium bg-purple-500/10 px-2 py-0.5 rounded-full">Physics</span>
                      <span className="text-xs text-muted-foreground">&bull;</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> MIT Repository</span>
                    </div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700 border-0 shadow-none whitespace-nowrap">Global Feed</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2 mb-4">A comprehensive review of near-term applications for quantum algorithms in cryptography and material science.</p>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6 border border-border/50"><AvatarFallback className="text-[10px] bg-muted text-muted-foreground">DL</AvatarFallback></Avatar>
                    <span className="text-xs text-muted-foreground font-medium">By David Lin</span>
                  </div>
                  <Button variant="outline" className="h-8 text-xs rounded-full" onClick={() => window.location.href = '/auth'}><Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeSubTab === "Pending Approval" && (
        <div className="space-y-4">
          <Card className="border-border/60 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-border/50 bg-amber-50 text-amber-700">
                    <AvatarFallback>SK</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-sm">Samantha Kyle</h4>
                    <p className="text-xs text-muted-foreground">"Effects of Microplastics in Local Waterways"</p>
                  </div>
                </div>
                <Badge className="bg-amber-100 text-amber-700 border-0 shadow-none">Global Publishing Request</Badge>
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                <p className="mt-1 text-xs">Dr. Roberts has reviewed and approved this paper. The author is now requesting to publish it to the Global Research Feed for other universities to view.</p>
              </div>
              <div className="flex gap-2 w-full">
                <Button className="w-full text-xs h-8 bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm rounded-full" onClick={() => window.location.href = '/auth'}><UserPlus className="w-3.5 h-3.5 mr-1.5" /> Assign Reviewer</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export const CollegeAdminSettingsDemo = () => {
  const [activeSubTab, setActiveSubTab] = useState("Profile");

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in" style={{ animationDuration: "0.3s" }}>
      <div>
        <h2 className="text-2xl font-bold">Institution Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">Configure campus profile, subscription billing, and administrative security.</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: "Profile", icon: Globe },
          { id: "Departments", icon: Building2 },
          { id: "Subscription", icon: CreditCard },
          { id: "Security", icon: Shield }
        ].map(t => (
          <Button
            key={t.id}
            variant={activeSubTab === t.id ? "default" : "outline"}
            className={`rounded-full h-9 px-4 text-sm ${activeSubTab === t.id ? "bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm" : "text-muted-foreground border-border/50 bg-transparent hover:bg-muted"}`}
            onClick={() => setActiveSubTab(t.id)}
          >
            <t.icon className="w-3.5 h-3.5 mr-2" /> {t.id}
          </Button>
        ))}
      </div>

      {activeSubTab === "Profile" && (
        <Card className="border-border/60 shadow-sm rounded-xl">
          <CardContent className="p-8">
            <h3 className="font-bold text-lg mb-1">Institution Public Profile</h3>
            <p className="text-xs text-muted-foreground mb-8">Information displayed across student feeds and inter-college directories.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold">Admin Officer Name</label>
                <input type="text" defaultValue="Dr. Emily Chen" className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Admin Email</label>
                <input type="email" defaultValue="admin@globaluniversity.edu" className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Admin Phone Number</label>
                <input type="text" defaultValue="+1 (555) 123-4567" className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Institution Domain</label>
                <input type="text" defaultValue="globaluniversity.edu" className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Institution Name</label>
                <input type="text" defaultValue="Global University" className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Official Website</label>
                <input type="text" defaultValue="https://www.globaluniversity.edu" className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <label className="text-xs font-semibold">Institution Overview</label>
              <textarea rows={4} defaultValue="A leading research institution dedicated to advancing global knowledge and fostering innovation across multiple disciplines." className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50 resize-none"></textarea>
            </div>
            <div className="space-y-2 mb-8">
              <label className="text-xs font-semibold">Campus Address</label>
              <input type="text" defaultValue="123 Academic Way, Innovation City, ST 12345" className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50" />
            </div>

            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm" onClick={() => window.location.href = '/auth'}>Save Profile Changes</Button>
          </CardContent>
        </Card>
      )}

      {activeSubTab === "Departments" && (
        <Card className="border-border/60 shadow-sm rounded-xl">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-bold text-lg mb-1 flex items-center gap-2"><Building2 className="w-5 h-5 text-emerald-500" /> Academic Departments</h3>
                <p className="text-xs text-muted-foreground">Configure and manage academic departments established at your institution.</p>
              </div>
              <Badge variant="outline" className="text-xs font-normal shadow-none border-border/60">7 Active Departments</Badge>
            </div>

            <div className="border border-emerald-500/20 bg-emerald-500/5 rounded-xl p-5 mb-8">
              <h4 className="text-sm font-semibold mb-4 flex items-center gap-2"><Plus className="w-4 h-4 text-emerald-500" /> Add New Department</h4>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="space-y-2 flex-1">
                  <label className="text-xs font-semibold">Department Name *</label>
                  <input type="text" placeholder="e.g. Electrical & Electronics Engineering" className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50" />
                </div>
                <div className="space-y-2 flex-1">
                  <label className="text-xs font-semibold">Short Code (Optional)</label>
                  <input type="text" placeholder="e.g. EEE" className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50" />
                </div>
                <Button className="bg-emerald-400 hover:bg-emerald-500 text-white rounded-lg shadow-sm" onClick={() => window.location.href = '/auth'}><Plus className="w-4 h-4 mr-2" /> Add Department</Button>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold mb-4 text-muted-foreground">Configured Departments:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Civil Engineering", code: "CE" },
                  { name: "Computer Science & Engineering", code: "CSE" },
                  { name: "Electrical Engineering", code: "EE" },
                  { name: "Electronics & Communication", code: "EC" },
                  { name: "General", code: "GEN", locked: true },
                  { name: "Information Technology", code: "IT" },
                  { name: "Mechanical Engineering", code: "ME" }
                ].map((dep, i) => (
                  <div key={i} className="flex justify-between items-center p-4 border border-border/50 rounded-xl bg-card hover:border-border transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center">{dep.code}</div>
                      <div>
                        <h4 className="font-semibold text-sm flex items-center gap-2">{dep.name} {dep.locked && <Badge className="bg-muted text-muted-foreground text-[9px] px-1 py-0 shadow-none border-0 uppercase">Default</Badge>}</h4>
                        <p className="text-xs text-muted-foreground">Code: {dep.code}</p>
                      </div>
                    </div>
                    {dep.locked ? (
                      <Lock className="w-4 h-4 text-muted-foreground/40" />
                    ) : (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10" onClick={() => window.location.href = '/auth'}><Trash2 className="w-4 h-4" /></Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeSubTab === "Subscription" && (
        <Card className="border-border/60 shadow-sm rounded-xl">
          <CardContent className="p-8">
            <h3 className="font-bold text-lg mb-1">Subscription & Billing</h3>
            <p className="text-xs text-muted-foreground mb-8">Active tier license and verified invoice receipts.</p>

            <div className="border border-border/50 rounded-xl p-6 flex justify-between items-center mb-6">
              <div>
                <h4 className="font-bold text-lg mb-1">Premium</h4>
                <p className="text-xs text-muted-foreground">Active until 27/10/2026</p>
              </div>
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm border-0">Active License</Badge>
            </div>

            <Button variant="outline" className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 rounded-full text-xs h-9 px-4" onClick={() => window.location.href = '/auth'}><FileText className="w-3.5 h-3.5 mr-2" /> View Invoices</Button>
          </CardContent>
        </Card>
      )}

      {activeSubTab === "Security" && (
        <Card className="border-border/60 shadow-sm rounded-xl">
          <CardContent className="p-8">
            <h3 className="font-bold text-lg mb-1">Security & Access Credentials</h3>
            <p className="text-xs text-muted-foreground mb-8">Update administrative password for this college command account.</p>

            <div className="max-w-md space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold">Current Password</label>
                <input type="password" placeholder="" className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">New Password</label>
                <input type="password" placeholder="" className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <div className="space-y-2 mb-8">
                <label className="text-xs font-semibold">Confirm New Password</label>
                <input type="password" placeholder="" className="w-full px-3 py-2 bg-card border border-border/60 rounded-lg text-sm focus:outline-none focus:border-emerald-500/50" />
              </div>
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm" onClick={() => window.location.href = '/auth'}>Update Security Password</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
