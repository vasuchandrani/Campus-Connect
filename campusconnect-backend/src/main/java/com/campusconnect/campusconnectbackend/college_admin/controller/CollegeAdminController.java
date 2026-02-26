package com.campusconnect.campusconnectbackend.college_admin.controller;

import com.campusconnect.campusconnectbackend.club.announcement.AnnouncementService;
import com.campusconnect.campusconnectbackend.club.club_request.ClubRequestService;
import com.campusconnect.campusconnectbackend.club.ClubService;
import com.campusconnect.campusconnectbackend.college_admin.service.CollegeAdminService;
import com.campusconnect.campusconnectbackend.mail_service.dto.reviewer.ReviewerAssignmentDto;
import com.campusconnect.campusconnectbackend.reseach_paper.ResearchPaperService;
import com.campusconnect.campusconnectbackend.reseach_paper.dto.res.ResearchesResponseDto;
import com.campusconnect.campusconnectbackend.reviewer.dto.req.AddReviewerRequestDto;
import com.campusconnect.campusconnectbackend.student.dto.req.StudentRegisterRequestDto;
import com.campusconnect.campusconnectbackend.club.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.club.dto.res.ClubListDto;
import com.campusconnect.campusconnectbackend.club.dto.res.ClubRequestResponseDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_card.ClubDetailsResponseDto;
import com.campusconnect.campusconnectbackend.college_admin.dto.res.CollegeAdminDashboardStatsDto;
import com.campusconnect.campusconnectbackend.club.event.dto.res.EventResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistReqResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistResponseDto;
import com.campusconnect.campusconnectbackend.news_paper.dto.res.NewsPaperResponseDto;
import com.campusconnect.campusconnectbackend.club.event.service.EventService;
import com.campusconnect.campusconnectbackend.reviewer.dto.res.ReviewerResponseDto;
import com.campusconnect.campusconnectbackend.student.dto.res.StudentResponseDto;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistRequestService;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistService;
import com.campusconnect.campusconnectbackend.news_paper.NewsPaperService;
import com.campusconnect.campusconnectbackend.reviewer.service.ReviewerService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import lombok.RequiredArgsConstructor;
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
    private final ReviewerService reviewerService;
    private final StudentRepoService studentRepoService;
    private final ResearchPaperService researchPaperService;

    /* Home */

    // get college-name
    @GetMapping("/college-name")
    public String collegeName() {
        return collegeAdminService.getCollegeName();
    }

    // stats -section
    @GetMapping("/stats")
    public CollegeAdminDashboardStatsDto getStats() {
        return collegeAdminService.getStats();
    }

    // latest-newspaper
    @GetMapping("/latest-news")
    public NewsPaperResponseDto getLatestNews() {
        return newsPaperService.getLatestOne();
    }


    /* Club Management */

    // get all clubs of college
    @GetMapping("/clubs")
    public List<ClubListDto> getAllClubs() {
        return clubService.getClubsByCollege();
    }
    // get particular club
    @GetMapping("/clubs/{id}")
    public ClubDetailsResponseDto getClub(@PathVariable Long id) {
        return clubService.getClub(id);
    }

    // get all pending approvals
    @GetMapping("/club-request")
    public List<ClubRequestResponseDto> getClubRequests() {

        Long collegeId = authService.getCurrentCollegeId();
        return clubRequestService.getClubRequests(collegeId);
    }
    // accept the club-request
    @PostMapping("/club-request/{clubReqId}")
    public boolean acceptClubRequest(@PathVariable Long clubReqId) {
        return clubRequestService.acceptRequest(clubReqId);
    }
    // reject the club-request
    @DeleteMapping("/club-request/{clubReqId}")
    public boolean rejectClubRequest(@PathVariable Long clubReqId) {
        return clubRequestService.rejectClubRequest(clubReqId);
    }

    // get all announcements of college
    @GetMapping("/announcements")
    public List<AnnouncementResponseDto> getAnnouncements() {
        return announcementService.getAnnouncementsByCollege();
    }
    // get particular announcement
    @GetMapping("/announcements/{id}")
    public AnnouncementResponseDto getAnnouncement(@PathVariable Long id) {
        return announcementService.getAnnouncementById(id);
    }

    // get all live & upcoming events of college
    @GetMapping("/events/active")
    public List<EventResponseDto> getActiveEventsByCollege() {
        return eventService.getActiveEventsByCollege();
    }

    // get all finished events of college
    @GetMapping("/events/finished")
    public List<EventResponseDto> getFinishedEventsByCollege() {
        return eventService.getFinishedEventsByCollege();
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
        return journalistRequestService.getJournalistRequests();
    }

    // get particular journalist request
    @GetMapping("/users/journalist-req/{id}")
    public JournalistReqResponseDto getJournalistRequestById(@PathVariable Long id) {
        return journalistRequestService.getJournalistRequest(id);
    }

    // accept journalist request
    @PostMapping("/users/journalist-req/{id}")
    public boolean acceptJournalistRequest(@PathVariable Long id) {
        return journalistRequestService.acceptJournalistRequest(id);
    }

    // reject journalist request
    @DeleteMapping("/users/journalist-req/{id}")
    public boolean rejectJournalistRequest(@PathVariable Long id) {
        return journalistRequestService.rejectJournalistRequest(id);
    }

    /* journalist */

    // get all journalist of college
    @GetMapping("/users/journalist")
    public List<JournalistResponseDto> getJournalists() {
        return journalistService.getJournalists();
    }
    // remove journalist
    @DeleteMapping("/users/journalist/{journalistId}")
    public boolean removeJournalist(@PathVariable Long journalistId) {
        return journalistService.removeJournalist(journalistId);
    }

    /* reviewer */

    // get all reviewers of college
    @GetMapping("/users/reviewer")
    public List<ReviewerResponseDto> getReviewers() {
        return reviewerService.getReviewers();
    }

    // add new reviewer
    @PostMapping("/users/reviewer")
    public boolean addReviewer(@RequestBody AddReviewerRequestDto request) {
        return reviewerService.store(request);
    }
    // remove reviewer
    @DeleteMapping("/users/reviewer/{reviewerId}")
    public boolean removeReviewer(@PathVariable Long reviewerId) {
        return reviewerService.removeReviewer(reviewerId);
    }


    /* students */

    // get all students
    @GetMapping("/users/student")
    public List<StudentResponseDto> getStudents() {
        return studentRepoService.getAllStudents();
    }

    // add multiple students
    @PostMapping("/users/student/add-multiple")
    public String uploadStudents(@RequestParam("file") MultipartFile file) {

        Long collegeId = authService.getCurrentCollegeId();
        return studentRepoService.processExcel(file, collegeId);
    }

    // add one student
    @PostMapping("/users/student/add-one")
    public String uploadStudent(@RequestBody StudentRegisterRequestDto request) {

        Long collegeId = authService.getCurrentCollegeId();
        return studentRepoService.registerStudent(request, collegeId);
    }

    /* News-paper */

    // get all newspapers
    @GetMapping("/news-papers")
    public List<NewsPaperResponseDto> getNewsPapers() {
        return newsPaperService.getNewsPapersByCollege();
    }

    // unpublish newspaper
    @DeleteMapping("/news-papers/{newsId}")
    public String unpublishNewsPaper(@PathVariable Long newsId) {
        return newsPaperService.unpublishNewsPaper(newsId);
    }

    /* Research */

    // get all not-reviewed researches
    @GetMapping("/researches")
    public List<ResearchesResponseDto> getNotReviewedResearches() {
        return researchPaperService.getNotReviewedResearches();
    }

    // get particular research-paper
    @GetMapping("/researches/{id}")
    public ResearchesResponseDto getResearchPaper(@PathVariable Long id) {
        return researchPaperService.getResearchPaper(id);
    }

    // assign reviewer
    // get all reviewer
    @GetMapping("/researches/review/{id}")
    public List<ReviewerResponseDto> getReviewers(@PathVariable Long id) {
        return reviewerService.getReviewers();
    }

    @PostMapping("/researches/review/{id}")
    public String assignReviewer(@PathVariable Long id, @RequestBody AddReviewerRequestDto request) {
        return reviewerService.assignReviewer(id, request);
    }

}
