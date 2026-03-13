import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import './App.css'
import StudentDashboard from "./pages/student/StudentDashboard";
import ClubDetailPage from "./pages/student/ClubDetailPage";
import ClubsPage from "./pages/student/ClubsPage";
import AnnouncementsPage from "./pages/student/AnnouncementsPage";
import EventsPage from "./pages/student/EventsPage";
import CollegeAdminDashboard from "./pages/collageAdmin/CollegeAdminDashboard";
import AdminClubsPage from "./pages/collageAdmin/AdminClubsPage";
import AdminUsersPage from "./pages/collageAdmin/AdminUsersPage";
import NotFound from "./pages/NotFound";
import ClubDetailAdminPage from "./pages/collageAdmin/ClubDetailAdminPage";
import ClubAdminDashboard from "./pages/club-admin/ClubAdminDashboard";
import ClubAdminAnnouncementsPage from "./pages/club-admin/ClubAdminAnnouncementsPage";
import ClubAdminTeamsPage from "./pages/club-admin/ClubAdminTeamsPage";
import ClubAdminEventsPage from "./pages/club-admin/ClubAdminEventsPage";
import ClubAdminMembersPage from "./pages/club-admin/ClubAdminMembersPage";
import ClubMemberDashboard from "./pages/club-member/ClubMemberDashboard";
import ClubMemberAnnouncementsPage from "./pages/club-member/ClubMemberAnnouncementsPage";
import ClubMemberEventsPage from "./pages/club-member/ClubMemberEventsPage";
import ClubMembersPage from "./pages/club-member/ClubMembersPage";
import ClubMemberTeamsPage from "./pages/club-member/ClubMemberTeamsPage";
import EventDetailPage from "./pages/student/EventDetailPage";
import AdminEventDetailPage from "./pages/collageAdmin/AdminEventDetailPage";
import ClubAdminEventDetailPage from "./pages/club-admin/ClubAdminEventDetail";
import ClubMemberEventDetailPage from "./pages/club-member/ClubMemberEventDetailPage";
import JournalistArticlesPage from "./pages/journalist/JournalistArticlesPage";
import JournalistDashboard from "./pages/journalist/JournalistDashboard";
import JournalistWritePage from "./pages/journalist/JournalistWritePage";
import AdminNewspaperPage from "./pages/collageAdmin/AdminNewspaperPage";
import StudentNewspaperPage from "./pages/student/StudentNewspaperPage";
import ReviewerDashboard from "./pages/reviewer/ReviewerDashboard";
import AdminResearchPage from "./pages/collageAdmin/AdminResearchPage";
import ResearchPage from "./pages/student/ResearchPage";
import ReviewerSetting from "./pages/reviewer/ReviewerSetting";
import JournalistSetting from "./pages/journalist/JournalistSetting";
import AdminSettingsPage from "./pages/collageAdmin/AdminSettingsPage";
import StudentSetting from "./pages/student/studentSetting";
import ClubSettingsPage from "./pages/club-admin/clubSetting";
import StudentNotificationPage from "./pages/student/StudentNotificationPage";
import { Toaster } from "./components/ui/Toaster";

function App() {
  return (
    <>
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Index />} />

      <Route path="/campus-connect/journalist/dashboard" element={<JournalistDashboard />} />
      <Route path="/campus-connect/admin-dashboard" element={<div>Admin Dashboard</div>} />
      <Route path="/campus-connect/reviewer/dashboard" element={<ReviewerDashboard/>} />
      <Route path="/campus-connect/student/notifications" element={<StudentNotificationPage />} />

      <Route path="/campus-connect/student/dashboard" element={<StudentDashboard />} />
      <Route path="/campus-connect/student/clubs/:clubId" element={<ClubDetailPage />} />
      <Route path="/campus-connect/student/clubs" element={<ClubsPage />} />
      <Route path="/campus-connect/student/announcements" element={<AnnouncementsPage />} />
      <Route path="/campus-connect/student/newspaper" element={<StudentNewspaperPage />} />
      <Route path="/campus-connect/student/research" element={<ResearchPage />} />
      <Route path="/campus-connect/student/events" element={<EventsPage />} />
      <Route path="/campus-connect/student/events/:id" element={<EventDetailPage />} />

      <Route path="/campus-connect/college-admin/dashboard" element={<CollegeAdminDashboard />} />
      <Route path="/campus-connect/college-admin/clubs" element={<AdminClubsPage />} />
      <Route path="/campus-connect/college-admin/users" element={<AdminUsersPage />} />
      <Route path="/campus-connect/college-admin/clubs/:clubId" element={<ClubDetailAdminPage />} />
      <Route path="/campus-connect/college-admin/events/:id" element={<AdminEventDetailPage />} />
      <Route path="/campus-connect/college-admin/newspaper" element={<AdminNewspaperPage />} />
      <Route path="/campus-connect/college-admin/research" element={<AdminResearchPage />} />

      <Route path="/campus-connect/club-admin/:clubId/dashboard" element={<ClubAdminDashboard />} />
      <Route path="/campus-connect/club-admin/:clubId/announcements" element={<ClubAdminAnnouncementsPage />} />
      <Route path="/campus-connect/club-admin/:clubId/teams" element={<ClubAdminTeamsPage />} />
      <Route path="/campus-connect/club-admin/:clubId/events" element={<ClubAdminEventsPage />} />
      <Route path="/campus-connect/club-admin/:clubId/members" element={<ClubAdminMembersPage />} />
      <Route path="/campus-connect/club-admin/:clubId/events/:id" element={<ClubAdminEventDetailPage />} />

      <Route path="/campus-connect/club-member/:clubId/dashboard" element={<ClubMemberDashboard />} />
      <Route path="/campus-connect/club-member/:clubId/announcements" element={<ClubMemberAnnouncementsPage />} />
      <Route path="/campus-connect/club-member/:clubId/events" element={<ClubMemberEventsPage />} />
      <Route path="/campus-connect/club-member/:clubId/members" element={<ClubMembersPage/>} />
      <Route path="/campus-connect/club-member/:clubId/teams" element={<ClubMemberTeamsPage />} />
      <Route path="/campus-connect/club-member/:clubId/events/:id" element={<ClubMemberEventDetailPage />} />

      <Route path="/campus-connect/journalist/articles" element={<JournalistArticlesPage />} />
      <Route path="/campus-connect/journalist/write" element={<JournalistWritePage />} />
      <Route path="/campus-connect/reviewer/settings" element={<ReviewerSetting />} />
      <Route path="/campus-connect/journalist/settings" element={<JournalistSetting />} />
      <Route path="/campus-connect/college-admin/settings" element={<AdminSettingsPage />} />
      <Route path="/campus-connect/student/settings" element={<StudentSetting />} />
      <Route path="/campus-connect/club-admin/:clubId/settings" element={<ClubSettingsPage />} />
         
      <Route path="*" element={<NotFound />} /> 
    </Routes>
    <Toaster position="bottom-right"/>
    </>
  );
}

export default App;