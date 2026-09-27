// Centralized API client for CampusConnect frontend

export const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;

  // When accessing via network IP/LAN/hotspot (e.g. 10.134.126.152),
  // always target that host's port 8080 unless a real remote production domain is configured.
  if (typeof window !== "undefined" && window.location) {
    const hostname = window.location.hostname;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
        const protocol = window.location.protocol === "https:" ? "https:" : "http:";
        return `${protocol}//${hostname}:8080`;
      }
    }
  }

  if (envUrl) {
    return envUrl;
  }

  return "http://localhost:8080";
};

/**
 * Core request helper that standardizes headers, authorization, and error handling.
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem("authToken");
  const headers = { ...options.headers };

  // Attach token if present and not already provided
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Handle body: if FormData, don't set Content-Type (let browser set boundary)
  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body !== undefined && options.body !== null) {
    if (typeof options.body === "object" || typeof options.body === "boolean" || typeof options.body === "number") {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    }
  }

  const baseUrl = getBaseUrl();
  const url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    // Request failed to reach server (server down, offline, CORS, connection refused)
    const serverError = new Error("Unable to connect to server. Please try again shortly.");
    serverError.isServerDown = true;
    serverError.status = 0;
    throw serverError;
  }

  // Handle blob responses (e.g., file downloads)
  if (options.responseType === "blob") {
    if (!response.ok) {
      const error = new Error(`Failed to download file (Status ${response.status})`);
      error.status = response.status;
      throw error;
    }
    return response.blob();
  }

  // Parse response
  let data;
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let errorMessage =
      (data && (data.message || data.error || data.detail)) || "";

    if (errorMessage && typeof errorMessage === "string") {
      // Clean up raw Spring Boot ResponseStatusException or ApiError messages:
      errorMessage = errorMessage.replace(/^Something went wrong:\s*/i, "");
      errorMessage = errorMessage.replace(/^\d{3}\s+[A-Z_]+(?:\s+["']?|:\s*["']?)/i, "");
      errorMessage = errorMessage.replace(/^["']|["']$/g, "").trim();

      if (errorMessage.includes("Duplicate or invalid data entry")) {
        if (errorMessage.toLowerCase().includes("unique") || errorMessage.toLowerCase().includes("already exists")) {
          errorMessage = "A record with this information already exists.";
        } else if (errorMessage.toLowerCase().includes("accepted_by")) {
          errorMessage = "Unable to process application approval. Please try again.";
        } else {
          errorMessage = "Action could not be completed due to duplicate or invalid data.";
        }
      }
    } else if (!errorMessage) {
      if (response.status >= 500) {
        errorMessage = "Unable to connect to server. Please try again shortly.";
      } else if (response.status === 401 || response.status === 403) {
        errorMessage = "Invalid email or password. Please try again.";
      } else if (response.status === 404) {
        errorMessage = "Requested resource not found.";
      } else {
        errorMessage = "Something went wrong. Please try again.";
      }
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    if (response.status >= 500) {
      error.isServerDown = true;
    }
    throw error;
  }

  return data;
}

// ---------------- AUTH API ----------------
export const authApi = {
  login: async (email, password, role) => {
    let endpoint = "";
    let roleName = "";
    if (role === "professor") {
      endpoint = "/campus-connect/professor/login";
      roleName = "PROFESSOR";
    } else if (role === "student") {
      endpoint = "/campus-connect/student/login";
      roleName = "STUDENT";
    } else if (role === "collegeAdmin") {
      endpoint = "/campus-connect/college-admin/login";
      roleName = "COLLEGE_ADMIN";
    }

    return request(endpoint, {
      method: "POST",
      body: { email, password, role: roleName },
    });
  },

  adminLogin: (email, password) =>
    request("/campus-connect/admin/login", {
      method: "POST",
      body: { email, password },
    }),

  collegeSignup: (payload) =>
    request("/campus-connect/college-admin/signup", {
      method: "POST",
      body: payload,
    }),

  studentSignup: (formData) =>
    request("/campus-connect/student/signup", {
      method: "POST",
      body: formData,
    }),

  professorSignup: (formData) =>
    request("/campus-connect/professor/signup", {
      method: "POST",
      body: formData,
    }),
};

// ---------------- PUBLIC / COLLEGE API ----------------
export const publicApi = {
  getColleges: () => request("/campus-connect/colleges"),
  downloadBlob: (url) => request(url, { responseType: "blob" }),
};

// ---------------- SECURITY API ----------------
export const securityApi = {
  changePassword: (data) =>
    request("/campus-connect/security/change-pwd", {
      method: "PATCH",
      body: data,
    }),
  sendCode: (data) =>
    request("/campus-connect/security/send-code", {
      method: "POST",
      body: data,
    }),
  verifyCode: (data) =>
    request("/campus-connect/security/verify-code", {
      method: "POST",
      body: data,
    }),
  resetPassword: (data) =>
    request("/campus-connect/security/reset-pwd", {
      method: "PATCH",
      body: data,
    }),
};

// ---------------- STUDENT API ----------------
export const studentApi = {
  getName: () => request("/campus-connect/student/name"),
  getStats: () => request("/campus-connect/student/stats"),
  getJoinedClubs: () => request("/campus-connect/student/joined-clubs"),
  requestClub: (data) =>
    request("/campus-connect/student/request-club", {
      method: "POST",
      body: data,
    }),
  manageClub: (id) =>
    request(`/campus-connect/student/joined-clubs/${id}`, {
      method: "POST",
    }),
  getTopEvents: () => request("/campus-connect/student/top-events"),
  getTopNews: () => request("/campus-connect/student/top-news"),
  getNotifications: () => request("/campus-connect/student/notifications"),
  getProfile: () => request("/campus-connect/student/profile"),
  updateProfile: (data) =>
    request("/campus-connect/student/profile", {
      method: "PUT",
      body: data,
    }),
  subLoginJournalist: (password) =>
    request("/campus-connect/student/sub-login/journalist", {
      method: "POST",
      body: { password },
    }),
  subLoginClub: (clubId, password) =>
    request(`/campus-connect/student/sub-login/club/${clubId}`, {
      method: "POST",
      body: { password },
    }),
  getJournalistStatus: () =>
    request("/campus-connect/student/journalist-status"),
  requestBecomeJournalist: (data) =>
    request("/campus-connect/student/news-papers/become", {
      method: "POST",
      body: data,
    }),
};

// ---------------- CLUBS API ----------------
export const clubApi = {
  getAllClubs: () => request("/campus-connect/student/clubs"),
  getClub: (clubId) => request(`/campus-connect/student/clubs/${clubId}`),
  changeFollow: (clubId, follow) =>
    request(`/campus-connect/clubs/${clubId}/follow`, {
      method: "POST",
      body: { follow: Boolean(follow) },
    }),
  isFollowing: (clubId) => request(`/campus-connect/clubs/${clubId}/is-following`),
};

// ---------------- EVENTS API ----------------
export const eventApi = {
  getActiveEvents: () => request("/campus-connect/student/events/active"),
  getFinishedEvents: () => request("/campus-connect/student/events/finished"),
  getEvent: (eventId) =>
    request(`/campus-connect/student/events/active/${eventId}`),
  getFinishedEventDetails: (eventId) =>
    request(`/campus-connect/student/events/finished/${eventId}`),
  registerEvent: (eventId) =>
    request(`/campus-connect/student/events/active/${eventId}/register`, {
      method: "POST",
    }),
  unregisterEvent: (eventId) =>
    request(`/campus-connect/student/events/active/${eventId}/unregister`, {
      method: "POST",
    }),

  // Global events
  getGlobalEvents: () => request("/campus-connect/student/events/global"),
  registerGlobalEvent: (eventId) =>
    request(`/campus-connect/student/events/global/${eventId}/register`, {
      method: "POST",
    }),
  unregisterGlobalEvent: (eventId) =>
    request(`/campus-connect/student/events/global/${eventId}/unregister`, {
      method: "POST",
    }),
};

// ---------------- ANNOUNCEMENTS API ----------------
export const announcementApi = {
  getAnnouncements: () => request("/campus-connect/student/announcements"),
  getAnnouncement: (id) =>
    request(`/campus-connect/student/announcements/${id}`),
};

// ---------------- NEWSPAPER API ----------------
export const newspaperApi = {
  getCampusNews: () => request("/campus-connect/student/news-papers"),
  getGlobalNews: () => request("/campus-connect/student/news-papers/global"),
  getLatestNews: () => request("/campus-connect/student/latest-news"),
  upvoteCampus: (id) =>
    request(`/campus-connect/student/news-papers/${id}/upvote`, {
      method: "POST",
    }),
  upvoteGlobal: (id) =>
    request(`/campus-connect/student/news-papers/global/${id}/upvote`, {
      method: "POST",
    }),
};

// ---------------- RESEARCH PAPERS API ----------------
export const researchPaperApi = {
  getCampusPapers: () => request("/campus-connect/student/researches"),
  getGlobalPapers: () => request("/campus-connect/student/researches/global"),
  getMySubmissions: () => request("/campus-connect/student/researches/mine"),
  getPaper: (id) => request(`/campus-connect/student/researches/${id}`),
  submitPaper: (formData) =>
    request("/campus-connect/student/researches", {
      method: "POST",
      body: formData,
    }),
  downloadPdf: (url) =>
    request(url, {
      method: "GET",
      responseType: "blob",
    }),
  upvoteCampus: (id) =>
    request(`/campus-connect/student/researches/${id}/upvote`, {
      method: "POST",
    }),
  upvoteGlobal: (id) =>
    request(`/campus-connect/student/researches/global/${id}/upvote`, {
      method: "POST",
    }),
};

// ---------------- COLLEGE ADMIN API ----------------
export const collegeAdminApi = {
  getCollegeName: () => request("/campus-connect/college-admin/college-name"),
  getStats: () => request("/campus-connect/college-admin/stats"),
  getLatestNews: () => request("/campus-connect/college-admin/latest-news"),
  getClubs: () => request("/campus-connect/college-admin/clubs"),
  getClub: (clubId) => request(`/campus-connect/college-admin/clubs/${clubId}`),
  getClubDetails: (clubId) => request(`/campus-connect/college-admin/clubs/${clubId}`),
  changeFollow: (clubId, follow) =>
    // Uses the shared ClubFollowerController at /clubs/{id}/follow
    // (NOT the StudentController's /student/clubs/{id} endpoint)
    request(`/campus-connect/clubs/${clubId}/follow`, {
      method: "POST",
      body: { follow: Boolean(follow) },
    }),
  deleteClub: (clubId) =>
    request(`/campus-connect/college-admin/clubs/${clubId}`, {
      method: "DELETE",
    }),
  getClubRequests: () =>
    request("/campus-connect/college-admin/club-request"),
  acceptClubRequest: (clubReqId, mentorId) =>
    request(`/campus-connect/college-admin/club-request/${clubReqId}`, {
      method: "POST",
      body: { mentorId },
    }),
  rejectClubRequest: (clubReqId) =>
    request(`/campus-connect/college-admin/club-request/${clubReqId}`, {
      method: "DELETE",
    }),
  getAnnouncements: () =>
    request("/campus-connect/college-admin/announcements"),
  getAnnouncement: (id) =>
    request(`/campus-connect/college-admin/announcements/${id}`),
  getActiveEvents: () =>
    request("/campus-connect/college-admin/events/active"),
  getFinishedEvents: () =>
    request("/campus-connect/college-admin/events/finished"),
  getEvent: (eventId) =>
    request(`/campus-connect/college-admin/events/active/${eventId}`),
  getFinishedEventDetails: (eventId) =>
    request(`/campus-connect/college-admin/events/finished/${eventId}`),

  // Users
  getJournalistRequests: () =>
    request("/campus-connect/college-admin/users/journalist-req"),
  getJournalistRequest: (id) =>
    request(`/campus-connect/college-admin/users/journalist-req/${id}`),
  acceptJournalistRequest: (id) =>
    request(`/campus-connect/college-admin/users/journalist-req/${id}`, {
      method: "POST",
    }),
  rejectJournalistRequest: (id) =>
    request(`/campus-connect/college-admin/users/journalist-req/${id}`, {
      method: "DELETE",
    }),
  getJournalists: () =>
    request("/campus-connect/college-admin/users/journalist"),
  addJournalist: (data) =>
    request("/campus-connect/college-admin/users/journalist", {
      method: "POST",
      body: data,
    }),
  removeJournalist: (journalistId) =>
    request(`/campus-connect/college-admin/users/journalist/${journalistId}`, {
      method: "DELETE",
    }),
  toggleJournalistActive: (journalistId) =>
    request(`/campus-connect/college-admin/users/journalist/${journalistId}/toggle-active`, {
      method: "PUT",
    }),
  getProfessors: () =>
    request("/campus-connect/college-admin/users/professor"),
  addProfessor: (requestDto) =>
    request("/campus-connect/college-admin/users/professor", {
      method: "POST",
      body: requestDto,
    }),
  removeProfessor: (professorId) =>
    request(`/campus-connect/college-admin/users/professor/${professorId}`, {
      method: "DELETE",
    }),
  getStudents: () =>
    request("/campus-connect/college-admin/users/student"),
  uploadStudentsExcel: (formData) =>
    request("/campus-connect/college-admin/users/student/add-multiple", {
      method: "POST",
      body: formData,
    }),
  uploadStudent: (requestDto) =>
    request("/campus-connect/college-admin/users/student/add-one", {
      method: "POST",
      body: requestDto,
    }),
  deleteStudent: (studentId) =>
    request(`/campus-connect/college-admin/users/students/delete/${studentId}`, {
      method: "DELETE",
    }),
  toggleStudentStatus: (studentId) =>
    request(`/campus-connect/college-admin/users/students/${studentId}/toggle-status`, {
      method: "PUT",
    }),

  // Newspapers
  getNewsPapers: () =>
    request("/campus-connect/college-admin/news-papers"),
  getCampusNewsPapers: () =>
    request("/campus-connect/college-admin/news-papers/campus"),
  getGlobalNewsPapers: () =>
    request("/campus-connect/college-admin/news-papers/global"),
  getGlobalNewsRequests: () =>
    request("/campus-connect/college-admin/news-papers/global-requests"),
  approveGlobalNewsPaper: (newsId) =>
    request(`/campus-connect/college-admin/news-papers/global-requests/${newsId}/approve`, {
      method: "POST",
    }),
  rejectGlobalNewsPaper: (newsId) =>
    request(`/campus-connect/college-admin/news-papers/global-requests/${newsId}/reject`, {
      method: "DELETE",
    }),
  requestGlobalNewsPaper: (newsId) =>
    request(`/campus-connect/college-admin/news-papers/${newsId}/request-global`, {
      method: "POST",
    }),
  unpublishNewsPaper: (newsId) =>
    request(`/campus-connect/college-admin/news-papers/${newsId}`, {
      method: "DELETE",
    }),

  // Researches
  getNotReviewedResearches: () =>
    request("/campus-connect/college-admin/researches/not-reviewed"),
  getCampusResearches: () =>
    request("/campus-connect/college-admin/researches/campus"),
  getGlobalResearches: () =>
    request("/campus-connect/college-admin/researches/global"),
  getGlobalResearchRequests: () =>
    request("/campus-connect/college-admin/researches/global-requests"),
  approveGlobalResearch: (researchId) =>
    request(`/campus-connect/college-admin/researches/global-requests/${researchId}/approve`, {
      method: "POST",
    }),
  rejectGlobalResearch: (researchId) =>
    request(`/campus-connect/college-admin/researches/global-requests/${researchId}/reject`, {
      method: "DELETE",
    }),
  requestGlobalResearch: (researchId) =>
    request(`/campus-connect/college-admin/researches/${researchId}/request-global`, {
      method: "POST",
    }),
  getReviewedResearches: () =>
    request("/campus-connect/college-admin/researches/reviewed"),
  getUnderReviewedResearches: () =>
    request("/campus-connect/college-admin/researches/under-reviewed"),
  getAllProfessors: () =>
    request("/campus-connect/college-admin/researches/professors"),
  assignProfessor: (researchId, professorId) =>
    request(`/campus-connect/college-admin/researches/assign-professor/${researchId}`, {
      method: "POST",
      body: professorId,
    }),

  // Settings & Subscription
  getProfile: () =>
    request("/campus-connect/college-admin/profile"),
  updateProfile: (profileDto) =>
    request("/campus-connect/college-admin/profile", {
      method: "PUT",
      body: profileDto,
    }),
  getSubscription: () =>
    request("/campus-connect/college-admin/subscription"),
  getSubscriptionHistory: () =>
    request("/campus-connect/college-admin/subscription/history"),
  createOrder: (data) =>
    request("/campus-connect/college-admin/create-order", {
      method: "POST",
      body: data,
    }),
  verifyPayment: (data) =>
    request("/campus-connect/college-admin/verify", {
      method: "POST",
      body: data,
    }),
};

// ---------------- JOURNALIST API ----------------
export const journalistApi = {
  returnToStudent: (password) =>
    request("/campus-connect/journalist/return-to-student", {
      method: "POST",
      body: { password },
    }),
  getDetails: () => request("/campus-connect/journalist/journalist-detail"),
  getStats: () => request("/campus-connect/journalist/stats"),
  getLatestNewspapers: () =>
    request("/campus-connect/journalist/newspapers/latest"),
  getPublishedNewspapers: () =>
    request("/campus-connect/journalist/newspapers/published"),
  getPublishedNewspaper: (paperId) =>
    request(`/campus-connect/journalist/newspapers/published/${paperId}`),
  deleteNewsPaper: (paperId) =>
    request(`/campus-connect/journalist/newspapers/published/${paperId}`, {
      method: "DELETE",
    }),
  getDrafts: () =>
    request("/campus-connect/journalist/newspapers/drafts"),
  deleteDraft: (draftId) =>
    request(`/campus-connect/journalist/newspapers/drafts/${draftId}`, {
      method: "DELETE",
    }),
  saveDraft: (formData) =>
    request("/campus-connect/journalist/write/draft", {
      method: "POST",
      body: formData,
    }),
  updateDraft: (draftId, formData) =>
    request(`/campus-connect/journalist/write/drafts/${draftId}`, {
      method: "PATCH",
      body: formData,
    }),
  publishDraft: (draftId) =>
    request(`/campus-connect/journalist/write/drafts/${draftId}`, {
      method: "POST",
    }),
  publishNewsPaper: (formData) =>
    request("/campus-connect/journalist/write/publish", {
      method: "POST",
      body: formData,
    }),
  upvoteArticle: (paperId) =>
    request(`/campus-connect/journalist/newspapers/${paperId}/upvote`, {
      method: "POST",
    }),
  requestGlobal: (paperId) =>
    request(`/campus-connect/journalist/newspapers/${paperId}/request-global`, {
      method: "POST",
    }),
  getProfile: () => request("/campus-connect/journalist/profile"),
  updateProfile: (data) =>
    request("/campus-connect/journalist/profile", {
      method: "PUT",
      body: data,
    }),
};

// ---------------- PROFESSOR API ----------------
export const professorApi = {
  getDetails: () => request("/campus-connect/professor/professor-detail"),
  getStats: () => request("/campus-connect/professor/stats"),

  // Clubs & Mentoring
  getActiveClubs: () => request("/campus-connect/professor/clubs/active"),
  getMentoredClubs: () => request("/campus-connect/professor/clubs/mentored"),
  getClubDetail: (clubId) =>
    request(`/campus-connect/professor/clubs/${clubId}/detail`),
  changeFollow: (clubId, follow) =>
    request(`/campus-connect/clubs/${clubId}/follow`, {
      method: "POST",
      body: { follow: Boolean(follow) },
    }),
  getClubMentorDashboard: (clubId) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard`),

  // Club Mentor Dashboard Operations
  getMentorDashboardData: (clubId) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard`),
  getMentorPublishedAnnouncements: (clubId) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/announcements/published`),
  getMentorDraftAnnouncements: (clubId) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/announcements/drafts`),
  getMentorPendingAnnouncements: (clubId) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/announcements/pending`),
  saveMentorAnnouncementDraft: (clubId, data) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/announcements/draft`, {
      method: "POST",
      body: data,
    }),
  publishMentorAnnouncementDraft: (clubId, id) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/announcements/drafts/${id}/publish`, {
      method: "POST",
    }),
  deleteMentorAnnouncementDraft: (clubId, id) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/announcements/drafts/${id}`, {
      method: "DELETE",
    }),
  approveMentorAnnouncement: (clubId, id) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/announcements/${id}/approve`, {
      method: "POST",
    }),
  rejectMentorAnnouncement: (clubId, id) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/announcements/${id}/reject`, {
      method: "POST",
    }),

  getMentorPublishedEvents: (clubId) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/events/published`),
  getMentorFinishedEvents: (clubId) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/events/finished`),
  getMentorDraftEvents: (clubId) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/events/drafts`),
  getMentorPendingEvents: (clubId) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/events/pending`),
  saveMentorEventDraft: (clubId, data) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/events/draft`, {
      method: "POST",
      body: data,
    }),
  publishMentorEventDraft: (clubId, id) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/events/drafts/${id}/publish`, {
      method: "POST",
    }),
  deleteMentorEventDraft: (clubId, id) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/events/drafts/${id}`, {
      method: "DELETE",
    }),
  approveMentorEvent: (clubId, id) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/events/${id}/approve`, {
      method: "POST",
    }),
  rejectMentorEvent: (clubId, id) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/events/${id}/reject`, {
      method: "POST",
    }),

  getMentorClubMembers: (clubId) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/members`),
  getMentorClubTeams: (clubId) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/teams`),

  getMentorClubSettings: (clubId) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/settings`),
  updateMentorClubSettings: (clubId, data) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/settings`, {
      method: "PUT",
      body: data,
    }),
  deleteClubByMentor: (clubId) =>
    request(`/campus-connect/professor/clubs/${clubId}/mentor-dashboard/delete-club`, {
      method: "DELETE",
    }),

  // Sub-login to Club Mentor Dashboard and Return to Professor Dashboard
  subLoginMentor: (clubId, password) =>
    request(`/campus-connect/professor/clubs/${clubId}/sub-login/mentor`, {
      method: "POST",
      body: { password },
    }),
  returnToProfessor: (clubId, password) =>
    request(
      clubId
        ? `/campus-connect/professor/clubs/${clubId}/mentor/return-to-professor`
        : "/campus-connect/professor/return-to-professor",
      {
        method: "POST",
        body: { password },
      }
    ),

  // Dashboard Feeds
  getRecentAnnouncements: () =>
    request("/campus-connect/professor/dashboard/recent-announcements"),
  getRecentEvents: () =>
    request("/campus-connect/professor/dashboard/recent-events"),

  // Events
  getCampusEvents: () => request("/campus-connect/professor/events/campus"),
  getGlobalEvents: () => request("/campus-connect/professor/events/global"),
  getFinishedEvents: () => request("/campus-connect/professor/events/finished"),

  // Announcements
  getAnnouncements: () => request("/campus-connect/professor/announcements"),

  // Newspaper
  getCampusNewspapers: () =>
    request("/campus-connect/professor/newspapers/campus"),
  getGlobalNewspapers: () =>
    request("/campus-connect/professor/newspapers/global"),
  upvoteCampusNewspaper: (id) =>
    request(`/campus-connect/professor/newspapers/${id}/upvote`, {
      method: "POST",
    }),
  upvoteGlobalNewspaper: (id) =>
    request(`/campus-connect/professor/newspapers/global/${id}/upvote`, {
      method: "POST",
    }),

  // Research
  getCampusResearches: () =>
    request("/campus-connect/professor/researches/campus"),
  getGlobalResearches: () =>
    request("/campus-connect/professor/researches/global"),
  getMyResearches: () =>
    request("/campus-connect/professor/researches/my"),
  submitResearchPaper: (formData) =>
    request("/campus-connect/professor/researches/submit", {
      method: "POST",
      body: formData,
    }),
  requestGlobalResearch: (id) =>
    request(`/campus-connect/professor/researches/${id}/request-global`, {
      method: "POST",
    }),
  upvoteCampusResearch: (id) =>
    request(`/campus-connect/professor/researches/${id}/upvote`, {
      method: "POST",
    }),
  upvoteGlobalResearch: (id) =>
    request(`/campus-connect/professor/researches/global/${id}/upvote`, {
      method: "POST",
    }),

  // Peer Review
  getPendingResearches: () =>
    request("/campus-connect/professor/pending"),
  acceptResearch: (researchId, requestDto) =>
    request(`/campus-connect/professor/pending/${researchId}/accept`, {
      method: "POST",
      body: requestDto,
    }),
  rejectResearch: (researchId, requestDto) =>
    request(`/campus-connect/professor/pending/${researchId}/reject`, {
      method: "POST",
      body: requestDto,
    }),
  getReviewedResearches: () =>
    request("/campus-connect/professor/reviewed"),
  getResearch: (researchId) =>
    request(`/campus-connect/professor/researches/${researchId}`),

  // Settings & Profile
  getProfile: () => request("/campus-connect/professor/profile"),
  updateProfile: (data) =>
    request("/campus-connect/professor/profile", {
      method: "PUT",
      body: data,
    }),
};

// ---------------- CLUB MEMBER API ----------------
export const clubMemberApi = {
  returnToStudent: (clubId, password) =>
    request(`/campus-connect/clubs/${clubId}/member/return-to-student`, {
      method: "POST",
      body: { password },
    }),
  getRole: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/check-role`),
  getClubName: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/club-name`),
  getStats: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/stats`),
  getTopEvents: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/top-events`),
  getLatestAnnouncements: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/top-announcements`),
  getActiveEvents: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/events/active`),
  getPublishedEvents: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/events/published`),
  getPendingEvents: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/events/pending`),
  getDraftEvents: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/events/drafts`),
  saveEventDraft: (clubId, data) =>
    request(`/campus-connect/clubs/${clubId}/member/events/draft`, {
      method: "POST",
      body: data,
    }),
  publishEventDraft: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/member/events/drafts/${eventId}/publish`, {
      method: "POST",
    }),
  deleteEventDraft: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/member/events/drafts/${eventId}`, {
      method: "DELETE",
    }),
  getFinishedEvents: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/events/finished`),
  getEvent: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/member/events/active/${eventId}`),
  getEventDetails: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/member/events/finished/${eventId}`),
  createEvent: (clubId, formData) =>
    request(`/campus-connect/clubs/${clubId}/member/events/active`, {
      method: "POST",
      body: formData,
    }),
  updateEvent: (clubId, eventId, formData) =>
    request(`/campus-connect/clubs/${clubId}/member/events/active/${eventId}`, {
      method: "PATCH",
      body: formData,
    }),
  deleteEvent: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/member/events/active/${eventId}`, {
      method: "DELETE",
    }),
  downloadRegistrations: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/member/events/${eventId}/registrations/download`, {
      responseType: "blob",
    }),
  generateOverview: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/member/events/finished/${eventId}/generate-overview`, {
      method: "POST",
    }),
  saveOverview: (clubId, eventId, formData) =>
    request(`/campus-connect/clubs/${clubId}/member/events/finished/${eventId}/save-overview`, {
      method: "PATCH",
      body: formData,
    }),
  getAnnouncements: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/announcements`),
  getPublishedAnnouncements: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/announcements/published`),
  getPendingAnnouncements: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/announcements/pending`),
  getDraftAnnouncements: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/announcements/drafts`),
  saveAnnouncementDraft: (clubId, data) =>
    request(`/campus-connect/clubs/${clubId}/member/announcements/draft`, {
      method: "POST",
      body: data,
    }),
  publishAnnouncementDraft: (clubId, annId) =>
    request(`/campus-connect/clubs/${clubId}/member/announcements/drafts/${annId}/publish`, {
      method: "POST",
    }),
  deleteAnnouncementDraft: (clubId, annId) =>
    request(`/campus-connect/clubs/${clubId}/member/announcements/drafts/${annId}`, {
      method: "DELETE",
    }),
  createAnnouncement: (clubId, data) =>
    request(`/campus-connect/clubs/${clubId}/member/announcements`, {
      method: "POST",
      body: data,
    }),
  updateAnnouncement: (clubId, annId, data) =>
    request(`/campus-connect/clubs/${clubId}/member/announcements/${annId}`, {
      method: "PATCH",
      body: data,
    }),
  deleteAnnouncement: (clubId, annId) =>
    request(`/campus-connect/clubs/${clubId}/member/announcements/${annId}`, {
      method: "DELETE",
    }),
  getMembers: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/members`),
  getTeams: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/teams`),
  getTeamCount: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/member/team-cnt`),
};

// ---------------- CLUB ADMIN API ----------------
export const clubAdminApi = {
  returnToStudent: (clubId, password) =>
    request(`/campus-connect/clubs/${clubId}/admin/return-to-student`, {
      method: "POST",
      body: { password },
    }),
  getRole: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/check-role`),
  getClubName: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/club-name`),
  getStats: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/stats`),
  getLatestAnnouncements: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/top-announcements`),
  getTeamNames: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/team-names`),
  getAnnouncements: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/announcements`),
  getPublishedAnnouncements: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/announcements/published`),
  getDraftAnnouncements: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/announcements/drafts`),
  getPendingAnnouncements: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/announcements/pending`),
  saveAnnouncementDraft: (clubId, data) =>
    request(`/campus-connect/clubs/${clubId}/admin/announcements/drafts`, {
      method: "POST",
      body: data,
    }),
  publishAnnouncementDraft: (clubId, annId) =>
    request(`/campus-connect/clubs/${clubId}/admin/announcements/drafts/${annId}/publish`, {
      method: "POST",
    }),
  deleteAnnouncementDraft: (clubId, annId) =>
    request(`/campus-connect/clubs/${clubId}/admin/announcements/drafts/${annId}`, {
      method: "DELETE",
    }),
  approveAnnouncement: (clubId, annId) =>
    request(`/campus-connect/clubs/${clubId}/admin/announcements/${annId}/approve`, {
      method: "POST",
    }),
  rejectAnnouncement: (clubId, annId) =>
    request(`/campus-connect/clubs/${clubId}/admin/announcements/${annId}/reject`, {
      method: "POST",
    }),
  createAnnouncement: (clubId, data) =>
    request(`/campus-connect/clubs/${clubId}/admin/announcements`, {
      method: "POST",
      body: data,
    }),
  updateAnnouncement: (clubId, annId, data) =>
    request(`/campus-connect/clubs/${clubId}/admin/announcements/${annId}`, {
      method: "PATCH",
      body: data,
    }),
  deleteAnnouncement: (clubId, annId) =>
    request(`/campus-connect/clubs/${clubId}/admin/announcements/${annId}`, {
      method: "DELETE",
    }),
  getActiveEvents: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/active`),
  getPublishedEvents: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/published`),
  getDraftEvents: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/drafts`),
  getPendingEvents: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/pending`),
  saveEventDraft: (clubId, data) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/drafts`, {
      method: "POST",
      body: data,
    }),
  publishEventDraft: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/drafts/${eventId}/publish`, {
      method: "POST",
    }),
  deleteEventDraft: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/drafts/${eventId}`, {
      method: "DELETE",
    }),
  approveEvent: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/${eventId}/approve`, {
      method: "POST",
    }),
  rejectEvent: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/${eventId}/reject`, {
      method: "POST",
    }),
  getFinishedEvents: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/finished`),
  getEvent: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/active/${eventId}`),
  getEventDetails: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/finished/${eventId}`),
  createEvent: (clubId, formData) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/active`, {
      method: "POST",
      body: formData,
    }),
  updateEvent: (clubId, eventId, formData) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/active/${eventId}`, {
      method: "PATCH",
      body: formData,
    }),
  deleteEvent: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/active/${eventId}`, {
      method: "DELETE",
    }),
  downloadRegistrations: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/${eventId}/registrations/download`, {
      responseType: "blob",
    }),
  generateOverview: (clubId, eventId) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/finished/${eventId}/generate-overview`, {
      method: "POST",
    }),
  saveOverview: (clubId, eventId, formData) =>
    request(`/campus-connect/clubs/${clubId}/admin/events/finished/${eventId}/save-overview`, {
      method: "PATCH",
      body: formData,
    }),
  getTeamCount: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/team-cnt`),
  getTeams: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/teams`),
  createTeam: (clubId, data) =>
    request(`/campus-connect/clubs/${clubId}/admin/teams`, {
      method: "POST",
      body: data,
    }),
  updateTeam: (clubId, teamId, data) =>
    request(`/campus-connect/clubs/${clubId}/admin/teams/${teamId}`, {
      method: "PUT",
      body: data,
    }),
  deleteTeam: (clubId, teamId) =>
    request(`/campus-connect/clubs/${clubId}/admin/teams/${teamId}`, {
      method: "DELETE",
    }),
  addTeamMember: (clubId, teamId, studentId) =>
    request(`/campus-connect/clubs/${clubId}/admin/teams/${teamId}/${studentId}`, {
      method: "POST",
    }),
  deleteTeamMember: (clubId, teamId, studentId) =>
    request(`/campus-connect/clubs/${clubId}/admin/teams/${teamId}/${studentId}`, {
      method: "DELETE",
    }),
  getMembers: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/members`),
  addMember: (clubId, data) =>
    request(`/campus-connect/clubs/${clubId}/admin/members/add`, {
      method: "POST",
      body: data,
    }),
  removeMember: (clubId, studentId) =>
    request(`/campus-connect/clubs/${clubId}/admin/members/remove/${studentId}`, {
      method: "DELETE",
    }),
  getClubProfile: (clubId) =>
    request(`/campus-connect/clubs/${clubId}/admin/details`),
  modifyClubProfile: (clubId, formData) =>
    request(`/campus-connect/clubs/${clubId}/admin/details`, {
      method: "PUT",
      body: formData,
    }),
  handOver: (clubId, data) =>
    request(`/campus-connect/clubs/${clubId}/admin/details/handover`, {
      method: "PATCH",
      body: data,
    }),
};

// Event Registration & Payment (Razorpay)
export const eventPaymentApi = {
  createOrder: (eventId, planId) =>
    request(`/campus-connect/events/${eventId}/payment/create-order`, {
      method: "POST",
      body: { planId },
    }),
  verifyPayment: (eventId, data) =>
    request(`/campus-connect/events/${eventId}/payment/verify`, {
      method: "POST",
      body: data,
    }),
  registerFree: (eventId, registrationData) =>
    request(`/campus-connect/events/${eventId}/register-free`, {
      method: "POST",
      body: registrationData || {},
    }),
};

// Department Management
export const departmentApi = {
  getByCollegeId: (collegeId) =>
    request(`/campus-connect/colleges/${collegeId}/departments`),
  getMyCollegeDepartments: () =>
    request(`/campus-connect/departments`),
  create: (data) =>
    request(`/campus-connect/departments`, {
      method: "POST",
      body: data,
    }),
  update: (departmentId, data) =>
    request(`/campus-connect/departments/${departmentId}`, {
      method: "PUT",
      body: data,
    }),
  delete: (departmentId) =>
    request(`/campus-connect/departments/${departmentId}`, {
      method: "DELETE",
    }),
};

export default {
  auth: authApi,
  public: publicApi,
  student: studentApi,
  club: clubApi,
  event: eventApi,
  announcement: announcementApi,
  newspaper: newspaperApi,
  researchPaper: researchPaperApi,
  collegeAdmin: collegeAdminApi,
  journalist: journalistApi,
  professor: professorApi,
  clubAdmin: clubAdminApi,
  clubMember: clubMemberApi,
  security: securityApi,
  eventPayment: eventPaymentApi,
  department: departmentApi,
};
