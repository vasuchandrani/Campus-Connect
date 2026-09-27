package com.campusconnect.campusconnectbackend.professor.controller;

import com.campusconnect.campusconnectbackend.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.announcement.service.AnnouncementService;
import com.campusconnect.campusconnectbackend.club.dto.res.club_card.ClubDetailsResponseDto;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.club.service.ClubService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.event.dto.res.EventResponseDto;
import com.campusconnect.campusconnectbackend.event.service.EventService;
import com.campusconnect.campusconnectbackend.newspaper.dto.res.NewsPaperResponseDto;
import com.campusconnect.campusconnectbackend.newspaper.service.NewsPaperService;
import com.campusconnect.campusconnectbackend.announcement.dto.req.AnnouncementRequestDto;
import com.campusconnect.campusconnectbackend.club.club_mentor.dto.ClubMentorDashboardDto;
import com.campusconnect.campusconnectbackend.club.club_mentor.dto.ClubPermissionSettingsDto;
import com.campusconnect.campusconnectbackend.club.club_mentor.service.ClubMentorDashboardService;
import com.campusconnect.campusconnectbackend.event.dto.req.EventRequestDto;
import com.campusconnect.campusconnectbackend.professor.dto.req.ProfRequestDto;
import com.campusconnect.campusconnectbackend.professor.dto.res.ProfDetailResponseDto;
import com.campusconnect.campusconnectbackend.professor.dto.res.ProfStatsResponseDto;
import com.campusconnect.campusconnectbackend.professor.service.ProfessorAuth;
import com.campusconnect.campusconnectbackend.professor.service.ProfessorService;
import com.campusconnect.campusconnectbackend.research_paper.dto.req.ResearchRequestDto;
import com.campusconnect.campusconnectbackend.research_paper.dto.res.ResearchesResponseDto;
import com.campusconnect.campusconnectbackend.research_paper.service.ResearchPaperService;
import com.campusconnect.campusconnectbackend.club.club_mentor.repository.ClubMentorRepository;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.security.security_management.dto.res.ProfessorProfileDto;
import com.campusconnect.campusconnectbackend.student.dto.req.SubDashboardLoginRequestDto;
import com.campusconnect.campusconnectbackend.student.service.SubDashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RequestMapping("/campus-connect/professor")
@RestController
@RequiredArgsConstructor
public class ProfController {

    private final ResearchPaperService researchPaperService;
    private final ProfessorService professorService;
    private final AuthService authService;
    private final ProfessorAuth professorAuth;
    private final ClubService clubService;
    private final ClubRepository clubRepository;
    private final EventService eventService;
    private final AnnouncementService announcementService;
    private final NewsPaperService newsPaperService;
    private final ClubMentorDashboardService clubMentorDashboardService;
    private final com.campusconnect.campusconnectbackend.club.club_follower.service.ClubFollowerService clubFollowerService;
    private final ClubMentorRepository clubMentorRepository;
    private final SubDashboardService subDashboardService;

    // get professor details
    @GetMapping("/professor-detail")
    public ProfDetailResponseDto getDetails(){
        return professorService.getDetails(authService.getCurrentUserId());
    }

    // get stats
    @GetMapping("/stats")
    public ProfStatsResponseDto getProfessorStats() {
        return professorService.getStats(authService.getCurrentUserId());
    }

    /* Clubs & Mentoring */

    // get all active clubs in college with mentor indicators
    @GetMapping("/clubs/active")
    public List<Map<String, Object>> getActiveClubs() {
        Long collegeId = authService.getCurrentCollegeId();
        Long profId = authService.getCurrentUserId();
        List<Long> mentoredClubIds = clubMentorRepository.findClubIdsByProfessorId(profId);
        Set<Long> mentoredSet = new HashSet<>(mentoredClubIds != null ? mentoredClubIds : Collections.emptyList());

        List<Club> clubs = clubRepository.findAllByCollege_Id(authService.getCurrentCollegeId());
        List<Map<String, Object>> list = new ArrayList<>();
        for (Club c : clubs) {
            if (c.isActive()) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("name", c.getName());
                map.put("tagline1", c.getTagline1());
                map.put("tagline2", c.getTagline2());
                map.put("description", c.getDescription());
                map.put("logoUrl", c.getLogoUrl());
                map.put("website", c.getWebsite());
                map.put("foundedBy", c.getFoundedBy());
                boolean isMentor = (c.getMentor() != null && Objects.equals(c.getMentor().getId(), profId)) || mentoredSet.contains(c.getId());
                map.put("isMentor", isMentor);
                map.put("mentorName", c.getMentor() != null ? c.getMentor().getFullName() : null);
                map.put("adminName", c.getAdmin() != null ? c.getAdmin().getFullName() : null);
                map.put("isFollowed", clubFollowerService.isFollowing(c.getId()));
                map.put("followerCount", clubFollowerService.getFollowerCount(c.getId()));
                list.add(map);
            }
        }
        return list;
    }

    // get clubs mentored by current professor (Position of Responsibility)
    @GetMapping("/clubs/mentored")
    public List<Map<String, Object>> getMentoredClubs() {
        Long profId = authService.getCurrentUserId();
        Set<Club> mentoredClubs = new LinkedHashSet<>(clubRepository.findAllByMentor_Id(profId));
        List<Long> extraClubIds = clubMentorRepository.findClubIdsByProfessorId(profId);
        if (extraClubIds != null && !extraClubIds.isEmpty()) {
            mentoredClubs.addAll(clubRepository.findAllById(extraClubIds));
        }

        List<Map<String, Object>> list = new ArrayList<>();
        for (Club c : mentoredClubs) {
            if (c.isActive()) {
                Map<String, Object> map = new HashMap<>();
                map.put("id", c.getId());
                map.put("name", c.getName());
                map.put("tagline1", c.getTagline1());
                map.put("tagline2", c.getTagline2());
                map.put("description", c.getDescription());
                map.put("logoUrl", c.getLogoUrl());
                map.put("website", c.getWebsite());
                map.put("isActive", c.isActive());
                map.put("foundedBy", c.getFoundedBy());
                map.put("createdAt", c.getCreatedAt());
                map.put("adminName", c.getAdmin() != null ? c.getAdmin().getFullName() : null);
                list.add(map);
            }
        }
        return list;
    }

    // Sub-login to Club Mentor Dashboard from Professor Dashboard
    @PostMapping("/clubs/{clubId}/sub-login/mentor")
    public AuthResponseDto mentorSubLogin(
            @PathVariable Long clubId,
            @Valid @RequestBody SubDashboardLoginRequestDto request
    ) {
        Long profId = authService.getCurrentUserId();
        try {
            return subDashboardService.mentorSubLogin(profId, clubId, request);
        } catch (org.springframework.web.server.ResponseStatusException ex) {
            return AuthResponseDto.failure(ex.getReason() != null ? ex.getReason() : "Invalid mentor password");
        }
    }

    // Return to Professor Dashboard from Club Mentor Dashboard session
    @PostMapping("/clubs/{clubId}/mentor/return-to-professor")
    public AuthResponseDto returnToProfessor(
            @PathVariable Long clubId,
            @Valid @RequestBody SubDashboardLoginRequestDto request
    ) {
        Long profId = authService.getCurrentUserId();
        try {
            return subDashboardService.mentorReturnToProfessor(profId, request);
        } catch (org.springframework.web.server.ResponseStatusException ex) {
            return AuthResponseDto.failure(ex.getReason() != null ? ex.getReason() : "Invalid professor password");
        }
    }

    // Direct Return endpoint for Club Mentor session
    @PostMapping("/return-to-professor")
    public AuthResponseDto returnToProfessorGeneral(
            @Valid @RequestBody SubDashboardLoginRequestDto request
    ) {
        Long profId = authService.getCurrentUserId();
        try {
            return subDashboardService.mentorReturnToProfessor(profId, request);
        } catch (org.springframework.web.server.ResponseStatusException ex) {
            return AuthResponseDto.failure(ex.getReason() != null ? ex.getReason() : "Invalid professor password");
        }
    }

    // get full details for a club (for View Details modal)
    @GetMapping("/clubs/{clubId}/detail")
    public ClubDetailsResponseDto getClubDetail(@PathVariable Long clubId) {
        return clubService.getClub(clubId);
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

    /* Club-Mentor Dashboard Routes */

    // 1. Dashboard overview (stats, 5 recent events, 5 recent announcements, metadata)
    @GetMapping("/clubs/{clubId}/mentor-dashboard")
    public ClubMentorDashboardDto getClubMentorDashboard(@PathVariable Long clubId) {
        return clubMentorDashboardService.getDashboardData(clubId, authService.getCurrentUserId());
    }

    // 2. Announcements
    @GetMapping("/clubs/{clubId}/mentor-dashboard/announcements/published")
    public List<AnnouncementResponseDto> getMentorPublishedAnnouncements(@PathVariable Long clubId) {
        return clubMentorDashboardService.getPublishedAnnouncements(clubId, authService.getCurrentUserId());
    }

    @GetMapping("/clubs/{clubId}/mentor-dashboard/announcements/drafts")
    public List<AnnouncementResponseDto> getMentorDraftAnnouncements(@PathVariable Long clubId) {
        return clubMentorDashboardService.getDraftAnnouncements(clubId, authService.getCurrentUserId());
    }

    @GetMapping("/clubs/{clubId}/mentor-dashboard/announcements/pending")
    public List<AnnouncementResponseDto> getMentorPendingAnnouncements(@PathVariable Long clubId) {
        return clubMentorDashboardService.getPendingAnnouncements(clubId, authService.getCurrentUserId());
    }

    @PostMapping("/clubs/{clubId}/mentor-dashboard/announcements/draft")
    public MessageResponseDto saveMentorAnnouncementDraft(@PathVariable Long clubId, @RequestBody AnnouncementRequestDto request) {
        return clubMentorDashboardService.saveAnnouncementDraft(clubId, request, authService.getCurrentUserId());
    }

    @PostMapping("/clubs/{clubId}/mentor-dashboard/announcements/drafts/{id}/publish")
    public MessageResponseDto publishMentorAnnouncementDraft(@PathVariable Long clubId, @PathVariable Long id) {
        return clubMentorDashboardService.publishAnnouncementDraft(clubId, id, authService.getCurrentUserId());
    }

    @DeleteMapping("/clubs/{clubId}/mentor-dashboard/announcements/drafts/{id}")
    public MessageResponseDto deleteMentorAnnouncementDraft(@PathVariable Long clubId, @PathVariable Long id) {
        return clubMentorDashboardService.deleteAnnouncementDraft(clubId, id, authService.getCurrentUserId());
    }

    @PostMapping("/clubs/{clubId}/mentor-dashboard/announcements/{id}/approve")
    public MessageResponseDto approveMentorAnnouncement(@PathVariable Long clubId, @PathVariable Long id) {
        return clubMentorDashboardService.approveAnnouncement(clubId, id, authService.getCurrentUserId());
    }

    @PostMapping("/clubs/{clubId}/mentor-dashboard/announcements/{id}/reject")
    public MessageResponseDto rejectMentorAnnouncement(@PathVariable Long clubId, @PathVariable Long id) {
        return clubMentorDashboardService.rejectAnnouncement(clubId, id, authService.getCurrentUserId());
    }

    // 3. Events
    @GetMapping("/clubs/{clubId}/mentor-dashboard/events/published")
    public List<EventResponseDto> getMentorPublishedEvents(@PathVariable Long clubId) {
        return clubMentorDashboardService.getPublishedEvents(clubId, authService.getCurrentUserId());
    }

    @GetMapping("/clubs/{clubId}/mentor-dashboard/events/finished")
    public List<EventResponseDto> getMentorFinishedEvents(@PathVariable Long clubId) {
        return clubMentorDashboardService.getFinishedEvents(clubId, authService.getCurrentUserId());
    }

    @GetMapping("/clubs/{clubId}/mentor-dashboard/events/drafts")
    public List<EventResponseDto> getMentorDraftEvents(@PathVariable Long clubId) {
        return clubMentorDashboardService.getDraftEvents(clubId, authService.getCurrentUserId());
    }

    @GetMapping("/clubs/{clubId}/mentor-dashboard/events/pending")
    public List<EventResponseDto> getMentorPendingEvents(@PathVariable Long clubId) {
        return clubMentorDashboardService.getPendingEvents(clubId, authService.getCurrentUserId());
    }

    @PostMapping("/clubs/{clubId}/mentor-dashboard/events/draft")
    public MessageResponseDto saveMentorEventDraft(@PathVariable Long clubId, @RequestBody EventRequestDto request) {
        return clubMentorDashboardService.saveEventDraft(clubId, request, authService.getCurrentUserId());
    }

    @PostMapping("/clubs/{clubId}/mentor-dashboard/events/drafts/{id}/publish")
    public MessageResponseDto publishMentorEventDraft(@PathVariable Long clubId, @PathVariable Long id) {
        return clubMentorDashboardService.publishEventDraft(clubId, id, authService.getCurrentUserId());
    }

    @DeleteMapping("/clubs/{clubId}/mentor-dashboard/events/drafts/{id}")
    public MessageResponseDto deleteMentorEventDraft(@PathVariable Long clubId, @PathVariable Long id) {
        return clubMentorDashboardService.deleteEventDraft(clubId, id, authService.getCurrentUserId());
    }

    @PostMapping("/clubs/{clubId}/mentor-dashboard/events/{id}/approve")
    public MessageResponseDto approveMentorEvent(@PathVariable Long clubId, @PathVariable Long id) {
        return clubMentorDashboardService.approveEvent(clubId, id, authService.getCurrentUserId());
    }

    @PostMapping("/clubs/{clubId}/mentor-dashboard/events/{id}/reject")
    public MessageResponseDto rejectMentorEvent(@PathVariable Long clubId, @PathVariable Long id) {
        return clubMentorDashboardService.rejectEvent(clubId, id, authService.getCurrentUserId());
    }

    // 4. Members (read-only)
    @GetMapping("/clubs/{clubId}/mentor-dashboard/members")
    public List<Map<String, Object>> getMentorClubMembers(@PathVariable Long clubId) {
        return clubMentorDashboardService.getClubMembers(clubId, authService.getCurrentUserId());
    }

    // 5. Teams (read-only)
    @GetMapping("/clubs/{clubId}/mentor-dashboard/teams")
    public List<Map<String, Object>> getMentorClubTeams(@PathVariable Long clubId) {
        return clubMentorDashboardService.getClubTeams(clubId, authService.getCurrentUserId());
    }

    // 6. Settings & Management
    @GetMapping("/clubs/{clubId}/mentor-dashboard/settings")
    public ClubPermissionSettingsDto getMentorClubSettings(@PathVariable Long clubId) {
        return clubMentorDashboardService.getSettings(clubId, authService.getCurrentUserId());
    }

    @PutMapping("/clubs/{clubId}/mentor-dashboard/settings")
    public MessageResponseDto updateMentorClubSettings(@PathVariable Long clubId, @RequestBody ClubPermissionSettingsDto request) {
        return clubMentorDashboardService.updateSettings(clubId, request, authService.getCurrentUserId());
    }

    @DeleteMapping("/clubs/{clubId}/mentor-dashboard/delete-club")
    public MessageResponseDto deleteClubByMentor(@PathVariable Long clubId) {
        return clubMentorDashboardService.deleteClubByMentor(clubId, authService.getCurrentUserId());
    }

    /* Dashboard Feeds */

    @GetMapping("/dashboard/recent-announcements")
    public List<AnnouncementResponseDto> getDashboardAnnouncements() {
        Long collegeId = authService.getCurrentCollegeId();
        List<AnnouncementResponseDto> list = announcementService.getAnnouncementsByCollege(collegeId);
        if (list.size() > 6) {
            return list.subList(0, 6);
        }
        return list;
    }

    @GetMapping("/dashboard/recent-events")
    public List<EventResponseDto> getDashboardEvents() {
        Long collegeId = authService.getCurrentCollegeId();
        List<EventResponseDto> list = eventService.getActiveEventsByCollege(collegeId);
        if (list.size() > 6) {
            return list.subList(0, 6);
        }
        return list;
    }

    /* Events */

    @GetMapping("/events/campus")
    public List<EventResponseDto> getCampusEvents() {
        return eventService.getActiveEventsByCollege(authService.getCurrentCollegeId());
    }

    @GetMapping("/events/global")
    public List<EventResponseDto> getGlobalEvents() {
        return eventService.getGlobalEvents();
    }

    @GetMapping("/events/finished")
    public List<EventResponseDto> getFinishedCampusEvents() {
        return eventService.getFinishedEventsByCollege(authService.getCurrentCollegeId());
    }

    /* Announcements */

    @GetMapping("/announcements")
    public List<AnnouncementResponseDto> getAnnouncements() {
        return announcementService.getAnnouncementsByCollege(authService.getCurrentCollegeId());
    }

    /* Newspapers */

    @GetMapping("/newspapers/campus")
    public List<NewsPaperResponseDto> getCampusNewspapers() {
        return newsPaperService.getCampusNewspapers(authService.getCurrentCollegeId());
    }

    @GetMapping("/newspapers/global")
    public List<NewsPaperResponseDto> getGlobalNewspapers() {
        return newsPaperService.getGlobalNewsPapers();
    }

    @PostMapping("/newspapers/{id}/upvote")
    public MessageResponseDto toggleNewspaperUpvote(@PathVariable Long id) {
        return newsPaperService.toggleUpvote(id, authService.getCurrentUserId());
    }

    @PostMapping("/newspapers/global/{id}/upvote")
    public MessageResponseDto toggleGlobalNewspaperUpvote(@PathVariable Long id) {
        return newsPaperService.toggleGlobalUpvote(id, authService.getCurrentUserId());
    }

    /* Research Papers */

    @GetMapping("/researches/campus")
    public List<ResearchesResponseDto> getCampusResearches() {
        return researchPaperService.getCampusResearches(authService.getCurrentCollegeId());
    }

    @GetMapping("/researches/global")
    public List<ResearchesResponseDto> getGlobalResearches() {
        return researchPaperService.getGlobalResearchPapers();
    }

    @GetMapping("/researches/my")
    public List<ResearchesResponseDto> getMyResearches() {
        return researchPaperService.getMyProfessorResearches(authService.getCurrentUserId());
    }

    @PostMapping(value = "/researches/submit", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MessageResponseDto submitProfessorPaper(
            @ModelAttribute ResearchRequestDto request,
            @RequestParam("pdf") MultipartFile pdf
    ) {
        return researchPaperService.submitProfessorPaper(request, pdf, authService.getCurrentUserId());
    }

    @PostMapping("/researches/{id}/request-global")
    public MessageResponseDto requestGlobalResearch(@PathVariable Long id) {
        return researchPaperService.requestGlobalResearch(id);
    }

    @PostMapping("/researches/{id}/upvote")
    public MessageResponseDto toggleResearchUpvote(@PathVariable Long id) {
        return researchPaperService.toggleUpvote(id, authService.getCurrentUserId());
    }

    @PostMapping("/researches/global/{id}/upvote")
    public MessageResponseDto toggleGlobalResearchUpvote(@PathVariable Long id) {
        return researchPaperService.toggleGlobalUpvote(id, authService.getCurrentUserId());
    }

    /* Peer Review */

    // get pending reviews
    @GetMapping("/pending")
    public List<ResearchesResponseDto> getPendingResearches() {
        return researchPaperService.getAllPendingByProfessor(authService.getCurrentUserId());
    }

    // accept any research-paper
    @PostMapping("/pending/{researchId}/accept")
    public MessageResponseDto acceptPendingResearch(@PathVariable Long researchId, @RequestBody ProfRequestDto request) {
        return researchPaperService.acceptResearch(researchId, request, authService.getCurrentUserId());
    }

    // reject any research-paper
    @PostMapping("/pending/{researchId}/reject")
    public MessageResponseDto rejectPendingResearch(@PathVariable Long researchId, @RequestBody ProfRequestDto request) {
        return researchPaperService.rejectResearch(researchId, request, authService.getCurrentUserId());
    }

    // get reviewed papers
    @GetMapping("/reviewed")
    public List<ResearchesResponseDto> getReviewedResearches() {
        return researchPaperService.getAllReviewedByProfessor(authService.getCurrentUserId());
    }

    // get particular research
    @GetMapping("/researches/{researchId}")
    public ResearchesResponseDto getResearch(@PathVariable Long researchId) {
        return researchPaperService.getResearchPaper(researchId);
    }

    /* Settings */

    // get professor profile
    @GetMapping("/profile")
    public ProfessorProfileDto getProfessor() {
        return professorAuth.getProfile(authService.getCurrentUserId());
    }

    // update professor profile
    @PutMapping("/profile")
    public MessageResponseDto updateProfessor(@RequestBody ProfessorProfileDto request) {
        return professorAuth.updateProfile(authService.getCurrentUserId(), request);
    }
}
