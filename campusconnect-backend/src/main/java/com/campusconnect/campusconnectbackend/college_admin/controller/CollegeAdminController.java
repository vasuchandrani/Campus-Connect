package com.campusconnect.campusconnectbackend.college_admin.controller;

import com.campusconnect.campusconnectbackend.club.announcement.AnnouncementService;
import com.campusconnect.campusconnectbackend.club.club_request.ClubRequestService;
import com.campusconnect.campusconnectbackend.club.ClubService;
import com.campusconnect.campusconnectbackend.college_admin.service.CollegeAdminService;
import com.campusconnect.campusconnectbackend.dto.request.reviewer.AddReviewerRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.announcement.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.dto.response.club.ClubListDto;
import com.campusconnect.campusconnectbackend.dto.response.club.ClubRequestResponseDto;
import com.campusconnect.campusconnectbackend.dto.response.club.club_card.ClubDetailsResponseDto;
import com.campusconnect.campusconnectbackend.dto.response.college_admin.CollegeAdminDashboardStatsDto;
import com.campusconnect.campusconnectbackend.dto.response.event.EventResponseDto;
import com.campusconnect.campusconnectbackend.dto.response.news_paper.NewsPaperResponseDto;
import com.campusconnect.campusconnectbackend.club.event.service.EventService;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.entity.JournalistRequest;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistRequestService;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistService;
import com.campusconnect.campusconnectbackend.news_paper.NewsPaperService;
import com.campusconnect.campusconnectbackend.reviewer.Reviewer;
import com.campusconnect.campusconnectbackend.reviewer.service.ReviewerService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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
    private final StudentService studentService;
    private final JournalistRequestService journalistRequestService;
    private final JournalistService journalistService;
    private final ReviewerService reviewerService;

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

    // get all events of college
    @GetMapping("/events")
    public List<EventResponseDto> getEvents() {
        return eventService.getAllEventsByCollege();
    }
    // get particular event
    @GetMapping("/events/{id}")
    public EventResponseDto getEventById(@PathVariable Long id) {
        return eventService.getEvent(id);
    }


    /* Users */

    // get all journalist request
    @GetMapping("/journalist-req")
    public List<JournalistRequest>  getJournalistRequests() {
        return journalistRequestService.getJournalistRequests();
    }
    // get particular journalist request
    @GetMapping("/journalist-req/{id}")
    public JournalistRequest getJournalistRequestById(@PathVariable Long id) {
        return journalistRequestService.getJournalistRequest(id);
    }

    // accept journalist request
    @PostMapping("/journalist-req/{id}")
    public boolean acceptJournalistRequest(@PathVariable Long id, @RequestBody String password) {
        return journalistRequestService.acceptJournalistRequest(id, password);
    }
    // reject journalist request
    @DeleteMapping("/journalist-req/{id}")
    public boolean rejectJournalistRequest(@PathVariable Long id) {
        return journalistRequestService.rejectJournalistRequest(id);
    }

    // get all journalist of college
    @GetMapping("/journalists")
    public List<Journalist> getJournalists() {
        return journalistService.getJournalists();
    }

    // get all reviewers of college
    @GetMapping("/reviewers")
    public List<Reviewer> getReviewers() {
        return reviewerService.getReviewers();
    }

    // add new reviewer
    @PostMapping("/reviewers")
    public boolean addReviewer(@RequestBody AddReviewerRequestDto request) {
        return reviewerService.store(request);
    }
}
