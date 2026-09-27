package com.campusconnect.campusconnectbackend.college_admin.controller;

import com.campusconnect.campusconnectbackend.announcement.service.AnnouncementService;
import com.campusconnect.campusconnectbackend.club.club_request.service.ClubRequestService;
import com.campusconnect.campusconnectbackend.club.service.ClubService;
import com.campusconnect.campusconnectbackend.college.dto.res.CollegeSubscriptionResponseDto;
import com.campusconnect.campusconnectbackend.college.service.CollegeSubscriptionService;
import com.campusconnect.campusconnectbackend.college_admin.service.CollegeAdminAuth;
import com.campusconnect.campusconnectbackend.college_admin.service.CollegeAdminService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.research_paper.service.ResearchPaperService;
import com.campusconnect.campusconnectbackend.research_paper.dto.res.ResearchesResponseDto;
import com.campusconnect.campusconnectbackend.professor.dto.req.AddProfRequestDto;
import com.campusconnect.campusconnectbackend.security.security_management.dto.res.CollegeAdminProfileDto;
import com.campusconnect.campusconnectbackend.student.dto.req.StudentRegisterRequestDto;
import com.campusconnect.campusconnectbackend.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.club.dto.res.ClubListDto;
import com.campusconnect.campusconnectbackend.club.dto.res.ClubRequestResponseDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_card.ClubDetailsResponseDto;
import com.campusconnect.campusconnectbackend.college_admin.dto.res.CollegeAdminDashboardStatsDto;
import com.campusconnect.campusconnectbackend.event.dto.res.EventResponseDto;
import com.campusconnect.campusconnectbackend.club.dto.req.ApproveClubReqDto;
import com.campusconnect.campusconnectbackend.journalist.dto.req.AddJournalistRequestDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistReqResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistResponseDto;
import jakarta.validation.Valid;
import com.campusconnect.campusconnectbackend.newspaper.dto.res.NewsPaperResponseDto;
import com.campusconnect.campusconnectbackend.event.service.EventService;
import com.campusconnect.campusconnectbackend.professor.dto.res.ProfResponseDto;
import com.campusconnect.campusconnectbackend.student.dto.res.StudentResponseDto;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistRequestService;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistService;
import com.campusconnect.campusconnectbackend.newspaper.service.NewsPaperService;
import com.campusconnect.campusconnectbackend.professor.service.ProfessorService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/campus-connect/college-admin")
@RequiredArgsConstructor
public class CollegeAdminController {

    private final CollegeAdminService collegeAdminService;
    private final NewsPaperService newsPaperService;
    private final ClubRequestService clubRequestService;
    private final AuthService authService;
    private final AnnouncementService announcementService;
    private final EventService eventService;
    private final ClubService clubService;
    private final JournalistRequestService journalistRequestService;
    private final JournalistService journalistService;
    private final ProfessorService professorService;
    private final StudentRepoService studentRepoService;
    private final ResearchPaperService researchPaperService;
    private final CollegeAdminAuth collegeAdminAuth;
    private final CollegeSubscriptionService collegeSubscriptionService;
    private final com.campusconnect.campusconnectbackend.club.club_follower.service.ClubFollowerService clubFollowerService;

    /* Home */

    // get college-name
    @GetMapping("/college-name")
    public String collegeName() {
        return collegeAdminService.getCollegeName(authService.getCurrentCollegeId());
    }

    // stats -section
    @GetMapping("/stats")
    public CollegeAdminDashboardStatsDto getStats() {
        return collegeAdminService.getStats(authService.getCurrentCollegeId());
    }

    // latest-newspaper
    @GetMapping("/latest-news")
    public NewsPaperResponseDto getLatestNews() {
        return newsPaperService.getLatestOne(authService.getCurrentCollegeId());
    }


    /* Club Management */

    // get all clubs of college
    @GetMapping("/clubs")
    public List<ClubListDto> getAllClubs() {
        return clubService.getClubsByCollege(authService.getCurrentCollegeId());
    }

    // get particular club
    @GetMapping("/clubs/{id}")
    public ClubDetailsResponseDto getClub(@PathVariable Long id) {
        return clubService.getClub(id);
    }

    // follow-unfollow
    @PostMapping(value = "/clubs/{clubId}/follow", consumes = {MediaType.APPLICATION_JSON_VALUE, MediaType.ALL_VALUE})
    public MessageResponseDto changeFollow(
            @PathVariable Long clubId,
            @RequestBody(required = false) String rawBody
    ) {
        boolean follow = true;
        if (rawBody != null) {
            String trimmed = rawBody.trim();
            if ("false".equalsIgnoreCase(trimmed) || trimmed.contains("\"follow\":false") || trimmed.contains("\"follow\": false")) {
                follow = false;
            } else if ("true".equalsIgnoreCase(trimmed) || trimmed.contains("\"follow\":true") || trimmed.contains("\"follow\": true")) {
                follow = true;
            }
        }
        return clubFollowerService.changeFollow(clubId, follow);
    }

    // remove club
    @DeleteMapping("/clubs/{clubId}")
    public MessageResponseDto deleteClub(@PathVariable Long clubId) {
        return clubService.deleteClub(clubId, authService.getCurrentCollegeId());
    }

    // get all pending approvals
    @GetMapping("/club-request")
    public List<ClubRequestResponseDto> getClubRequests() {

        Long collegeId = authService.getCurrentCollegeId();
        return clubRequestService.getClubRequests(collegeId);
    }

    // accept the club-request with faculty mentor selection
    @PostMapping("/club-request/{clubReqId}")
    public MessageResponseDto acceptClubRequest(
            @PathVariable Long clubReqId,
            @RequestBody(required = false) ApproveClubReqDto request,
            @RequestParam(name = "mentorId", required = false) Long mentorIdParam
    ) {
        Long mentorId = request != null && request.getMentorId() != null ? request.getMentorId() : mentorIdParam;
        return clubRequestService.acceptRequest(clubReqId, mentorId);
    }

    // reject the club-request
    @DeleteMapping("/club-request/{clubReqId}")
    public MessageResponseDto rejectClubRequest(@PathVariable Long clubReqId) {
        return clubRequestService.rejectClubRequest(clubReqId);
    }

    // get all announcements of college
    @GetMapping("/announcements")
    public List<AnnouncementResponseDto> getAnnouncements() {
        return announcementService.getAnnouncementsByCollege(authService.getCurrentCollegeId());
    }

    // get particular announcement
    @GetMapping("/announcements/{id}")
    public AnnouncementResponseDto getAnnouncement(@PathVariable Long id) {
        return announcementService.getAnnouncementById(id);
    }

    // get all live & upcoming events of college
    @GetMapping("/events/active")
    public List<EventResponseDto> getActiveEventsByCollege() {
        return eventService.getActiveEventsByCollege(authService.getCurrentCollegeId());
    }

    // get all finished events of college
    @GetMapping("/events/finished")
    public List<EventResponseDto> getFinishedEventsByCollege() {
        return eventService.getFinishedEventsByCollege(authService.getCurrentCollegeId());
    }

    // get particular active event
    @GetMapping("/events/active/{eventId}")
    public EventResponseDto getEvent(@PathVariable Long eventId) {
        return eventService.getEvent(eventId);
    }

    // view details of finished-events
    @GetMapping("/events/finished/{eventId}")
    public EventResponseDto getEventDetails(@PathVariable Long eventId) {
        return eventService.getEvent(eventId);
    }

    /* Users */

    /* journalist-request */

    // get all journalist request
    @GetMapping("/users/journalist-req")
    public List<JournalistReqResponseDto>  getJournalistRequests() {
        return journalistRequestService.getJournalistRequests(authService.getCurrentCollegeId());
    }

    // get particular journalist request
    @GetMapping("/users/journalist-req/{id}")
    public JournalistReqResponseDto getJournalistRequestById(@PathVariable Long id) {
        return journalistRequestService.getJournalistRequest(id);
    }

    // accept journalist request
    @PostMapping("/users/journalist-req/{id}")
    public MessageResponseDto acceptJournalistRequest(@PathVariable Long id) {
        return journalistRequestService.acceptJournalistRequest(id);
    }

    // reject journalist request
    @DeleteMapping("/users/journalist-req/{id}")
    public MessageResponseDto rejectJournalistRequest(@PathVariable Long id) {
        return journalistRequestService.rejectJournalistRequest(id);
    }

    /* journalist */

    // get all journalist of college
    @GetMapping("/users/journalist")
    public List<JournalistResponseDto> getJournalists() {
        return journalistService.getJournalists(authService.getCurrentCollegeId());
    }

    // add journalist by student email
    @PostMapping("/users/journalist")
    public MessageResponseDto addJournalist(@Valid @RequestBody AddJournalistRequestDto request) {
        return journalistService.addJournalistByEmail(
                request.getEmail(),
                authService.getCurrentCollegeId(),
                authService.getCurrentUserId()
        );
    }

    // remove journalist
    @DeleteMapping("/users/journalist/{journalistId}")
    public MessageResponseDto removeJournalist(@PathVariable Long journalistId) {
        return journalistService.removeJournalist(journalistId);
    }

    // toggle journalist active/deactivated
    @PutMapping("/users/journalist/{journalistId}/toggle-active")
    public MessageResponseDto toggleJournalistActive(@PathVariable Long journalistId) {
        return journalistService.toggleJournalistActive(journalistId);
    }

    /* professor */

    // get all professors of college
    @GetMapping("/users/professor")
    public List<ProfResponseDto> getProfessors() {
        return professorService.getProfessors(authService.getCurrentCollegeId());
    }

    // add new professor
    @PostMapping("/users/professor")
    public MessageResponseDto addProfessor(@Valid @RequestBody AddProfRequestDto request) {
        return professorService.store(request);
    }
    // remove professor
    @DeleteMapping("/users/professor/{professorId}")
    public MessageResponseDto removeProfessor(@PathVariable Long professorId) {
        return professorService.removeProfessor(professorId);
    }


    /* students */

    // get all students
    @GetMapping("/users/student")
    public List<StudentResponseDto> getStudents() {
        return studentRepoService.getAllStudents(authService.getCurrentCollegeId());
    }

    // add multiple students
    @PostMapping("/users/student/add-multiple")
    public MessageResponseDto uploadStudents(@RequestParam("file") MultipartFile file) {

        Long collegeId = authService.getCurrentCollegeId();
        return studentRepoService.processExcel(file, collegeId);
    }

    // add one student
    @PostMapping("/users/student/add-one")
    public MessageResponseDto uploadStudent(@RequestBody StudentRegisterRequestDto request) {

        Long collegeId = authService.getCurrentCollegeId();
        return studentRepoService.registerStudent(request, collegeId);
    }

    // delete student
    @DeleteMapping("/users/students/delete/{studentId}")
    public MessageResponseDto deleteStudent(@PathVariable Long studentId) {
        return studentRepoService.removeStudent(studentId);
    }

    // toggle student active/suspended
    @PutMapping("/users/students/{studentId}/toggle-status")
    public MessageResponseDto toggleStudentStatus(@PathVariable Long studentId) {
        return studentRepoService.toggleStudentStatus(studentId, authService.getCurrentCollegeId());
    }

    /* News-paper */

    // get campus published newspapers of college
    @GetMapping("/news-papers")
    public List<NewsPaperResponseDto> getNewsPapers() {
        return newsPaperService.getCampusNewspapers(authService.getCurrentCollegeId());
    }

    @GetMapping("/news-papers/campus")
    public List<NewsPaperResponseDto> getCampusNewsPapers() {
        return newsPaperService.getCampusNewspapers(authService.getCurrentCollegeId());
    }

    // get global newspapers across all colleges
    @GetMapping("/news-papers/global")
    public List<NewsPaperResponseDto> getGlobalNewsPapers() {
        return newsPaperService.getGlobalNewsPapers();
    }

    // get pending globalization requests
    @GetMapping("/news-papers/global-requests")
    public List<NewsPaperResponseDto> getGlobalNewsRequests() {
        return newsPaperService.getPendingGlobalRequests();
    }

    // approve globalization request
    @PostMapping("/news-papers/global-requests/{newsId}/approve")
    public MessageResponseDto approveGlobalNewsPaper(@PathVariable Long newsId) {
        return newsPaperService.approveGlobalNewsPaper(newsId, authService.getCurrentUserId());
    }

    // reject globalization request
    @DeleteMapping("/news-papers/global-requests/{newsId}/reject")
    public MessageResponseDto rejectGlobalNewsPaper(@PathVariable Long newsId) {
        return newsPaperService.rejectGlobalNewsPaper(newsId);
    }

    // request globalization for a campus newspaper
    @PostMapping("/news-papers/{newsId}/request-global")
    public MessageResponseDto requestGlobalNewsPaper(@PathVariable Long newsId) {
        return newsPaperService.requestGlobalNewsPaper(newsId);
    }

    // unpublish newspaper
    @DeleteMapping("/news-papers/{newsId}")
    public MessageResponseDto unpublishNewsPaper(@PathVariable Long newsId) {
        return newsPaperService.unpublishNewsPaper(newsId);
    }

    /* Research */

    // 1. Not reviewed (unassigned student research papers)
    @GetMapping("/researches/not-reviewed")
    public List<ResearchesResponseDto> getNotReviewedResearches() {
        return researchPaperService.getNotReviewedResearches(authService.getCurrentCollegeId());
    }

    // 2. Campus published researches
    @GetMapping("/researches/campus")
    public List<ResearchesResponseDto> getCampusResearches() {
        return researchPaperService.getCampusResearches(authService.getCurrentCollegeId());
    }

    // 3. Global published researches
    @GetMapping("/researches/global")
    public List<ResearchesResponseDto> getGlobalResearches() {
        return researchPaperService.getGlobalResearchPapers();
    }

    // 4. Pending globalization requests
    @GetMapping("/researches/global-requests")
    public List<ResearchesResponseDto> getGlobalResearchRequests() {
        return researchPaperService.getPendingGlobalRequests();
    }

    // approve research globalization
    @PostMapping("/researches/global-requests/{researchId}/approve")
    public MessageResponseDto approveGlobalResearch(@PathVariable Long researchId) {
        return researchPaperService.approveGlobalResearch(researchId, authService.getCurrentUserId());
    }

    // reject research globalization
    @DeleteMapping("/researches/global-requests/{researchId}/reject")
    public MessageResponseDto rejectGlobalResearch(@PathVariable Long researchId) {
        return researchPaperService.rejectGlobalResearch(researchId);
    }

    // request globalization for campus research
    @PostMapping("/researches/{researchId}/request-global")
    public MessageResponseDto requestGlobalResearch(@PathVariable Long researchId) {
        return researchPaperService.requestGlobalResearch(researchId);
    }

    // get reviewed researches
    @GetMapping("/researches/reviewed")
    public List<ResearchesResponseDto> getReviewedResearches() {
        return researchPaperService.getReviewedResearches(authService.getCurrentCollegeId());
    }

    // get under-reviewed researches
    @GetMapping("/researches/under-reviewed")
    public List<ResearchesResponseDto> getUnderReviewedResearches() {
        return researchPaperService.getUnderReviewedResearches(authService.getCurrentCollegeId());
    }

    // assign professor
    @GetMapping("/researches/professors")
    public List<ProfResponseDto> getAllProfessors() {
        return professorService.getProfessors(authService.getCurrentCollegeId());
    }

    @PostMapping("/researches/assign-professor/{researchId}")
    public MessageResponseDto assignProfessor(@PathVariable Long researchId, @RequestBody Long professorId) {
        return professorService.assignProfessor(researchId, professorId);
    }


    /* Settings */

    // get college-admin profile
    @GetMapping("/profile")
    public CollegeAdminProfileDto getCollegeAdmin() {
        return collegeAdminAuth.getProfile(authService.getCurrentUserId());
    }

    // update college-admin profile
    @PutMapping("/profile")
    public MessageResponseDto updateCollegeAdmin(@RequestBody CollegeAdminProfileDto request) {
        return collegeAdminAuth.updateProfile(authService.getCurrentUserId(), request);
    }

    @GetMapping("/subscription")
    public CollegeSubscriptionResponseDto getSubscription() {
        return collegeSubscriptionService.getSubscription(authService.getCurrentCollegeId());
    }

    @GetMapping("/subscription/history")
    public List<CollegeSubscriptionResponseDto> getSubscriptionHistory() {
        return collegeSubscriptionService.getSubscriptionHistory(authService.getCurrentCollegeId());
    }
}
