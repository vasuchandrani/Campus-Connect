import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import './App.css'
import ProtectedRoute from "./components/auth/ProtectedRoute";
import StudentDashboard from "./pages/student/StudentDashboard";
import ClubDetailPage from "./pages/student/ClubDetailPage";
import ClubsPage from "./pages/student/ClubsPage";
import AnnouncementsPage from "./pages/student/AnnouncementsPage";
import EventsPage from "./pages/student/EventsPage";
import CollegeAdminDashboard from "./pages/collegeAdmin/CollegeAdminDashboard";
import AdminClubsPage from "./pages/collegeAdmin/AdminClubsPage";
import AdminUsersPage from "./pages/collegeAdmin/AdminUsersPage";
import NotFound from "./pages/NotFound";
import ClubDetailAdminPage from "./pages/collegeAdmin/ClubDetailAdminPage";
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
import AdminEventDetailPage from "./pages/collegeAdmin/AdminEventDetailPage";
import ClubAdminEventDetailPage from "./pages/club-admin/ClubAdminEventDetail";
import ClubMemberEventDetailPage from "./pages/club-member/ClubMemberEventDetailPage";
import JournalistArticlesPage from "./pages/journalist/JournalistArticlesPage";
import JournalistDashboard from "./pages/journalist/JournalistDashboard";
import JournalistWritePage from "./pages/journalist/JournalistWritePage";
import AdminNewspaperPage from "./pages/collegeAdmin/AdminNewspaperPage";
import StudentNewspaperPage from "./pages/student/StudentNewspaperPage";
import ProfessorDashboard from "./pages/professor/ProfessorDashboard";
import ProfessorClubsPage from "./pages/professor/ProfessorClubsPage";
import ClubMentorDashboard from "./pages/club-mentor/ClubMentorDashboard";
import ProfessorEventsPage from "./pages/professor/ProfessorEventsPage";
import ProfessorAnnouncementsPage from "./pages/professor/ProfessorAnnouncementsPage";
import ProfessorNewspaperPage from "./pages/professor/ProfessorNewspaperPage";
import ProfessorResearchPage from "./pages/professor/ProfessorResearchPage";
import ProfessorReviewPage from "./pages/professor/ProfessorReviewPage";
import ProfessorSettings from "./pages/professor/ProfessorSettings";
import AdminResearchPage from "./pages/collegeAdmin/AdminResearchPage";
import ResearchPage from "./pages/student/ResearchPage";
import JournalistSetting from "./pages/journalist/JournalistSetting";
import AdminSettingsPage from "./pages/collegeAdmin/AdminSettingsPage";
import StudentSetting from "./pages/student/StudentSetting";
import ClubSettingsPage from "./pages/club-admin/ClubSetting";
import StudentNotificationPage from "./pages/student/StudentNotificationPage";
import { Toaster } from "./components/ui/Toaster";
import AboutPage from "./pages/info/AboutPage";
import ContactPage from "./pages/info/ContactPage";
import BlogPage from "./pages/info/BlogPage";
import DocumentationPage from "./pages/info/DocumentationPage";
import PrivacyPolicyPage from "./pages/info/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/info/TermsOfServicePage";

function App() {
  return (
    <>
    <Routes>
      {/* Public routes */}
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/documentation" element={<DocumentationPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />

      {/* System Admin — Stub route. TODO: Implement full admin dashboard when needed */}
      <Route path="/campus-connect/admin-dashboard" element={<div>Admin Dashboard — Coming Soon</div>} />

      {/* Journalist Routes — Protected */}
      <Route path="/campus-connect/journalist/dashboard" element={<ProtectedRoute allowedRoles={["JOURNALIST"]}><JournalistDashboard /></ProtectedRoute>} />
      <Route path="/campus-connect/journalist/articles" element={<ProtectedRoute allowedRoles={["JOURNALIST"]}><JournalistArticlesPage /></ProtectedRoute>} />
      <Route path="/campus-connect/journalist/write" element={<ProtectedRoute allowedRoles={["JOURNALIST"]}><JournalistWritePage /></ProtectedRoute>} />
      <Route path="/campus-connect/journalist/settings" element={<ProtectedRoute allowedRoles={["JOURNALIST"]}><JournalistSetting /></ProtectedRoute>} />

      {/* Professor Routes — Protected */}
      <Route path="/campus-connect/professor/dashboard" element={<ProtectedRoute allowedRoles={["PROFESSOR"]}><ProfessorDashboard/></ProtectedRoute>} />
      <Route path="/campus-connect/professor/clubs" element={<ProtectedRoute allowedRoles={["PROFESSOR"]}><ProfessorClubsPage /></ProtectedRoute>} />
      <Route path="/campus-connect/professor/clubs/:clubId" element={<ProtectedRoute allowedRoles={["PROFESSOR", "STUDENT", "COLLEGE_ADMIN", "CLUB_ADMIN", "CLUB_MEMBER"]}><ClubDetailPage /></ProtectedRoute>} />
      
      {/* Club Mentor Routes — Protected */}
      <Route path="/campus-connect/professor/clubs/:clubId/mentor-dashboard" element={<ProtectedRoute allowedRoles={["CLUB_MENTOR", "MENTOR"]}><ClubMentorDashboard /></ProtectedRoute>} />
      <Route path="/campus-connect/professor/clubs/:clubId/mentor-dashboard/:subTab" element={<ProtectedRoute allowedRoles={["CLUB_MENTOR", "MENTOR"]}><ClubMentorDashboard /></ProtectedRoute>} />
      <Route path="/campus-connect/club-mentor/:clubId/dashboard" element={<ProtectedRoute allowedRoles={["CLUB_MENTOR", "MENTOR"]}><ClubMentorDashboard /></ProtectedRoute>} />
      <Route path="/campus-connect/club-mentor/:clubId/dashboard/:subTab" element={<ProtectedRoute allowedRoles={["CLUB_MENTOR", "MENTOR"]}><ClubMentorDashboard /></ProtectedRoute>} />

      <Route path="/campus-connect/professor/events" element={<ProtectedRoute allowedRoles={["PROFESSOR"]}><ProfessorEventsPage /></ProtectedRoute>} />
      <Route path="/campus-connect/professor/announcements" element={<ProtectedRoute allowedRoles={["PROFESSOR"]}><ProfessorAnnouncementsPage /></ProtectedRoute>} />
      <Route path="/campus-connect/professor/newspaper" element={<ProtectedRoute allowedRoles={["PROFESSOR"]}><ProfessorNewspaperPage /></ProtectedRoute>} />
      <Route path="/campus-connect/professor/research" element={<ProtectedRoute allowedRoles={["PROFESSOR"]}><ProfessorResearchPage /></ProtectedRoute>} />
      <Route path="/campus-connect/professor/review" element={<ProtectedRoute allowedRoles={["PROFESSOR"]}><ProfessorReviewPage /></ProtectedRoute>} />
      <Route path="/campus-connect/professor/settings" element={<ProtectedRoute allowedRoles={["PROFESSOR"]}><ProfessorSettings /></ProtectedRoute>} />

      {/* Student Routes — Protected */}
      <Route path="/campus-connect/student/dashboard" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/campus-connect/student/clubs" element={<ProtectedRoute allowedRoles={["STUDENT"]}><ClubsPage /></ProtectedRoute>} />
      <Route path="/campus-connect/student/clubs/:clubId" element={<ProtectedRoute allowedRoles={["STUDENT", "PROFESSOR", "COLLEGE_ADMIN", "CLUB_ADMIN", "CLUB_MEMBER"]}><ClubDetailPage /></ProtectedRoute>} />
      <Route path="/campus-connect/student/events" element={<ProtectedRoute allowedRoles={["STUDENT"]}><EventsPage /></ProtectedRoute>} />
      <Route path="/campus-connect/student/events/:id" element={<ProtectedRoute allowedRoles={["STUDENT"]}><EventDetailPage /></ProtectedRoute>} />
      <Route path="/campus-connect/student/announcements" element={<ProtectedRoute allowedRoles={["STUDENT"]}><AnnouncementsPage /></ProtectedRoute>} />
      <Route path="/campus-connect/student/newspaper" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentNewspaperPage /></ProtectedRoute>} />
      <Route path="/campus-connect/student/research" element={<ProtectedRoute allowedRoles={["STUDENT"]}><ResearchPage /></ProtectedRoute>} />
      <Route path="/campus-connect/student/settings" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentSetting /></ProtectedRoute>} />
      <Route path="/campus-connect/student/notifications" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentNotificationPage /></ProtectedRoute>} />

      {/* College Admin Routes — Protected */}
      <Route path="/campus-connect/college-admin/dashboard" element={<ProtectedRoute allowedRoles={["COLLEGE_ADMIN"]}><CollegeAdminDashboard /></ProtectedRoute>} />
      <Route path="/campus-connect/college-admin/clubs" element={<ProtectedRoute allowedRoles={["COLLEGE_ADMIN"]}><AdminClubsPage /></ProtectedRoute>} />
      <Route path="/campus-connect/college-admin/users" element={<ProtectedRoute allowedRoles={["COLLEGE_ADMIN"]}><AdminUsersPage /></ProtectedRoute>} />
      <Route path="/campus-connect/college-admin/clubs/:clubId" element={<ProtectedRoute allowedRoles={["COLLEGE_ADMIN", "PROFESSOR", "STUDENT"]}><ClubDetailAdminPage /></ProtectedRoute>} />
      <Route path="/campus-connect/college-admin/events/:id" element={<ProtectedRoute allowedRoles={["COLLEGE_ADMIN"]}><AdminEventDetailPage /></ProtectedRoute>} />
      <Route path="/campus-connect/college-admin/newspaper" element={<ProtectedRoute allowedRoles={["COLLEGE_ADMIN"]}><AdminNewspaperPage /></ProtectedRoute>} />
      <Route path="/campus-connect/college-admin/research" element={<ProtectedRoute allowedRoles={["COLLEGE_ADMIN"]}><AdminResearchPage /></ProtectedRoute>} />
      <Route path="/campus-connect/college-admin/settings" element={<ProtectedRoute allowedRoles={["COLLEGE_ADMIN"]}><AdminSettingsPage /></ProtectedRoute>} />

      {/* Club Admin Routes — Protected */}
      <Route path="/campus-connect/club-admin/:clubId/dashboard" element={<ProtectedRoute allowedRoles={["CLUB_ADMIN", "ADMIN"]}><ClubAdminDashboard initialTab="dashboard" /></ProtectedRoute>} />
      <Route path="/campus-connect/club-admin/:clubId/announcements" element={<ProtectedRoute allowedRoles={["CLUB_ADMIN", "ADMIN"]}><ClubAdminDashboard initialTab="announcements" /></ProtectedRoute>} />
      <Route path="/campus-connect/club-admin/:clubId/teams" element={<ProtectedRoute allowedRoles={["CLUB_ADMIN", "ADMIN"]}><ClubAdminDashboard initialTab="teams" /></ProtectedRoute>} />
      <Route path="/campus-connect/club-admin/:clubId/events" element={<ProtectedRoute allowedRoles={["CLUB_ADMIN", "ADMIN"]}><ClubAdminDashboard initialTab="events" /></ProtectedRoute>} />
      <Route path="/campus-connect/club-admin/:clubId/members" element={<ProtectedRoute allowedRoles={["CLUB_ADMIN", "ADMIN"]}><ClubAdminDashboard initialTab="members" /></ProtectedRoute>} />
      <Route path="/campus-connect/club-admin/:clubId/events/:id" element={<ProtectedRoute allowedRoles={["CLUB_ADMIN", "ADMIN"]}><ClubAdminEventDetailPage /></ProtectedRoute>} />
      <Route path="/campus-connect/club-admin/:clubId/settings" element={<ProtectedRoute allowedRoles={["CLUB_ADMIN", "ADMIN"]}><ClubAdminDashboard initialTab="settings" /></ProtectedRoute>} />

      {/* Club Member Routes — Protected */}
      <Route path="/campus-connect/club-member/:clubId/dashboard" element={<ProtectedRoute allowedRoles={["CLUB_MEMBER", "MEMBER"]}><ClubMemberDashboard initialTab="dashboard" /></ProtectedRoute>} />
      <Route path="/campus-connect/club-member/:clubId/announcements" element={<ProtectedRoute allowedRoles={["CLUB_MEMBER", "MEMBER"]}><ClubMemberDashboard initialTab="announcements" /></ProtectedRoute>} />
      <Route path="/campus-connect/club-member/:clubId/events" element={<ProtectedRoute allowedRoles={["CLUB_MEMBER", "MEMBER"]}><ClubMemberDashboard initialTab="events" /></ProtectedRoute>} />
      <Route path="/campus-connect/club-member/:clubId/members" element={<ProtectedRoute allowedRoles={["CLUB_MEMBER", "MEMBER"]}><ClubMemberDashboard initialTab="members" /></ProtectedRoute>} />
      <Route path="/campus-connect/club-member/:clubId/teams" element={<ProtectedRoute allowedRoles={["CLUB_MEMBER", "MEMBER"]}><ClubMemberDashboard initialTab="teams" /></ProtectedRoute>} />
      <Route path="/campus-connect/club-member/:clubId/events/:id" element={<ProtectedRoute allowedRoles={["CLUB_MEMBER", "MEMBER"]}><ClubMemberEventDetailPage /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} /> 
    </Routes>
    <Toaster position="bottom-right"/>
    </>
  );
}

export default App;