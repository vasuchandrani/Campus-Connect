package com.campusconnect.campusconnectbackend.club.club_admin.controller;

import com.campusconnect.campusconnectbackend.announcement.service.AnnouncementService;
import com.campusconnect.campusconnectbackend.club.club_admin.service.ClubAdminService;
import com.campusconnect.campusconnectbackend.club.club_member.service.ClubMemberService;
import com.campusconnect.campusconnectbackend.club.service.ClubMemberManagementService;
import com.campusconnect.campusconnectbackend.club.service.ClubService;
import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.club.club_team.service.ClubTeamService;
import com.campusconnect.campusconnectbackend.announcement.dto.req.AnnouncementPatchRequestDto;
import com.campusconnect.campusconnectbackend.announcement.dto.req.AnnouncementRequestDto;
import com.campusconnect.campusconnectbackend.club.dto.req.AddMemberRequestDto;
import com.campusconnect.campusconnectbackend.club.dto.req.HandOverRequestDto;
import com.campusconnect.campusconnectbackend.club.dto.req.SaveOverviewRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventRequestDto;
import com.campusconnect.campusconnectbackend.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubDashboardStatsDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubTeamDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_card.ClubMemberDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.TeamNameDto;
import com.campusconnect.campusconnectbackend.event.dto.res.EventResponseDto;
import com.campusconnect.campusconnectbackend.event.overview_generation.EventOverviewService;
import com.campusconnect.campusconnectbackend.event.service.EventRegistrationService;
import com.campusconnect.campusconnectbackend.event.service.EventService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.security.security_management.dto.res.ClubProfileDto;
import com.campusconnect.campusconnectbackend.student.dto.req.SubDashboardLoginRequestDto;
import com.campusconnect.campusconnectbackend.student.service.SubDashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/campus-connect/clubs/{clubId}/admin")
@RequiredArgsConstructor
public class ClubAdminController {
    private final ClubAdminService clubAdminService;
    private final AnnouncementService announcementService;
    private final ClubTeamService clubTeamService;
    private final EventService eventService;
    private final ClubRepository clubRepository;
    private final ClubService clubService;
    private final EventOverviewService eventOverviewService;
    private final AuthService authService;
    private final ClubMemberService clubMemberService;
    private final EventRegistrationService eventRegistrationService;
    private final ClubMemberManagementService clubMemberManagementService;
    private final SubDashboardService subDashboardService;

    // return to student dashboard from club admin session
    @PostMapping("/return-to-student")
    public AuthResponseDto returnToStudent(@Valid @RequestBody SubDashboardLoginRequestDto request) {
        Long studentId = authService.getCurrentUserId();
        try {
            return subDashboardService.clubReturnToStudent(studentId, request);
        } catch (org.springframework.web.server.ResponseStatusException ex) {
            return AuthResponseDto.failure(ex.getReason() != null ? ex.getReason() : "Invalid student password");
        }
    }

    /* Home */

    // get-role
    @GetMapping("/check-role")
    public String getRole(@PathVariable Long clubId) {
        return clubMemberManagementService.getRole(clubId);
    }

    // get club-name
    @GetMapping("/club-name")
    public String getClubName(@PathVariable Long clubId) {
        return clubRepository.findById(clubId).orElseThrow(
                () -> new RuntimeException("Club with id: " + clubId + " not found")
        ).getName();
    }

    // stats -section
    @GetMapping("/stats")
    public ClubDashboardStatsDto getStats(@PathVariable Long clubId) {
        return clubMemberService.getStats(clubId);
    }

    // announcements -top 4 announcements
    @GetMapping("/top-announcements")
    public List<AnnouncementResponseDto> getLatestAnnouncements(@PathVariable Long clubId) {
        return announcementService.getLatestAnnouncements(clubId);
    }

    // teams -section
    @GetMapping("/team-names")
    public List<TeamNameDto> getTeamNames(@PathVariable Long clubId) {
        return clubTeamService.getTeamNames(clubId);
    }

    /* Announcements */

    // get all announcements
    @GetMapping("/announcements")
    public List<AnnouncementResponseDto> getAnnouncements(@PathVariable Long clubId) {
        return announcementService.getAnnouncements(clubId);
    }

    // get published announcements
    @GetMapping("/announcements/published")
    public List<AnnouncementResponseDto> getPublishedAnnouncements(@PathVariable Long clubId) {
        return clubAdminService.getPublishedAnnouncements(clubId);
    }

    // get draft announcements
    @GetMapping("/announcements/drafts")
    public List<AnnouncementResponseDto> getDraftAnnouncements(@PathVariable Long clubId) {
        return clubAdminService.getDraftAnnouncements(clubId);
    }

    // get pending announcements
    @GetMapping("/announcements/pending")
    public List<AnnouncementResponseDto> getPendingAnnouncements(@PathVariable Long clubId) {
        return clubAdminService.getPendingAnnouncements(clubId);
    }

    // create new announcement
    @PostMapping("/announcements")
    public MessageResponseDto createAnnouncement(@PathVariable Long clubId, @RequestBody AnnouncementRequestDto request) {
        return announcementService.createAnnouncement(request, clubId);
    }

    // save announcement draft
    @PostMapping("/announcements/drafts")
    public MessageResponseDto saveAnnouncementDraft(@PathVariable Long clubId, @RequestBody AnnouncementRequestDto request) {
        return clubAdminService.saveAnnouncementDraft(clubId, request);
    }

    // publish announcement draft
    @PostMapping("/announcements/drafts/{annId}/publish")
    public MessageResponseDto publishAnnouncementDraft(@PathVariable Long clubId, @PathVariable Long annId) {
        return clubAdminService.publishAnnouncementDraft(clubId, annId);
    }

    // delete announcement draft
    @DeleteMapping("/announcements/drafts/{annId}")
    public MessageResponseDto deleteAnnouncementDraft(@PathVariable Long clubId, @PathVariable Long annId) {
        return clubAdminService.deleteAnnouncementDraft(clubId, annId);
    }

    // approve member announcement
    @PostMapping("/announcements/{annId}/approve")
    public MessageResponseDto approveAnnouncement(@PathVariable Long clubId, @PathVariable Long annId) {
        return clubAdminService.approveAnnouncement(clubId, annId);
    }

    // reject member announcement
    @PostMapping("/announcements/{annId}/reject")
    public MessageResponseDto rejectAnnouncement(@PathVariable Long clubId, @PathVariable Long annId) {
        return clubAdminService.rejectAnnouncement(clubId, annId);
    }

    // modify any announcement
    @PatchMapping("/announcements/{annId}")
    public MessageResponseDto updateAnnouncement(@PathVariable Long annId, @PathVariable Long clubId, @RequestBody AnnouncementPatchRequestDto request) {
        return announcementService.updateAnnouncement(request, annId, clubId);
    }

    // delete any announcement
    @DeleteMapping("/announcements/{annId}")
    public MessageResponseDto deleteAnnouncement(@PathVariable Long annId, @PathVariable Long clubId) {
        return announcementService.deleteAnnouncement(annId, clubId);
    }

    /* Events */

    // get all live & upcoming events of club
    @GetMapping("/events/active")
    public List<EventResponseDto> getActiveEventsByCollege(@PathVariable Long clubId) {
        return eventService.getActiveEventsByClub(clubId);
    }

    // get published events (with campus/global tag)
    @GetMapping("/events/published")
    public List<EventResponseDto> getPublishedEvents(@PathVariable Long clubId) {
        return clubAdminService.getPublishedEvents(clubId);
    }

    // get finished events of club
    @GetMapping("/events/finished")
    public List<EventResponseDto> getFinishedEventsByCollege(@PathVariable Long clubId) {
        return clubAdminService.getFinishedEvents(clubId);
    }

    // get draft events of club
    @GetMapping("/events/drafts")
    public List<EventResponseDto> getDraftEvents(@PathVariable Long clubId) {
        return clubAdminService.getDraftEvents(clubId);
    }

    // get pending events awaiting admin approval
    @GetMapping("/events/pending")
    public List<EventResponseDto> getPendingEvents(@PathVariable Long clubId) {
        return clubAdminService.getPendingEvents(clubId);
    }

    // save event draft
    @PostMapping("/events/drafts")
    public MessageResponseDto saveEventDraft(@PathVariable Long clubId, @RequestBody EventRequestDto request) {
        return clubAdminService.saveEventDraft(clubId, request);
    }

    // publish event draft
    @PostMapping("/events/drafts/{eventId}/publish")
    public MessageResponseDto publishEventDraft(@PathVariable Long clubId, @PathVariable Long eventId) {
        return clubAdminService.publishEventDraft(clubId, eventId);
    }

    // delete event draft
    @DeleteMapping("/events/drafts/{eventId}")
    public MessageResponseDto deleteEventDraft(@PathVariable Long clubId, @PathVariable Long eventId) {
        return clubAdminService.deleteEventDraft(clubId, eventId);
    }

    // approve member event
    @PostMapping("/events/{eventId}/approve")
    public MessageResponseDto approveEvent(@PathVariable Long clubId, @PathVariable Long eventId) {
        return clubAdminService.approveEvent(clubId, eventId);
    }

    // reject member event
    @PostMapping("/events/{eventId}/reject")
    public MessageResponseDto rejectEvent(@PathVariable Long clubId, @PathVariable Long eventId) {
        return clubAdminService.rejectEvent(clubId, eventId);
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

    // create new event
    @PostMapping(value = "/events/active", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MessageResponseDto createEvent(
            @PathVariable Long clubId,
            @RequestPart("event") EventRequestDto request,
            @RequestPart("image") MultipartFile image
    ) {
        return eventService.createEvent(request, clubId, image);
    }

    // modify any event
    @PatchMapping(value = "/events/active/{eventId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MessageResponseDto updateEvent(
            @PathVariable Long clubId,
            @PathVariable Long eventId,
            @RequestPart("event") EventRequestDto request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        return eventService.updateEvent(request, eventId, clubId, image);
    }

    // delete any event
    @DeleteMapping("/events/active/{eventId}")
    public MessageResponseDto deleteEvent(@PathVariable Long eventId, @PathVariable Long clubId) {
        return eventService.deleteEvent(eventId, clubId);
    }

    // download event registration
    @GetMapping("/events/{eventId}/registrations/download")
    public ResponseEntity<byte[]> downloadRegistrations(@PathVariable Long eventId) {
        byte[] excelData = eventRegistrationService.generateExcel(eventId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=event_registrations.xlsx")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelData);
    }

    /* Generate Overview */

    // generate overview
    @PostMapping("/events/finished/{eventId}/generate-overview")
    public String generateOverview(@PathVariable Long eventId) {
        return eventOverviewService.generateOverview(eventId);
    }

    // save overview
    @PatchMapping(value = "/events/finished/{eventId}/save-overview", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public MessageResponseDto saveOverview(
            @PathVariable Long clubId,
            @PathVariable Long eventId,
            @RequestPart("overview") SaveOverviewRequestDto request,
            @RequestPart(value = "images", required = false) List<MultipartFile> images
    ) {
        return eventOverviewService.saveOverview(clubId, eventId, request, images);
    }

    /* Teams */

    // get team count of club
    @GetMapping("/team-cnt")
    public int getTeamCnt(@PathVariable Long clubId) {
        return clubTeamService.getTeamCount(clubId);
    }

    // get all team
    @GetMapping("/teams")
    public List<ClubTeamDto> getTeams(@PathVariable Long clubId) {
        return clubTeamService.getTeamsByClub(clubId);
    }

    // create new team
    @PostMapping("/teams")
    public MessageResponseDto createTeam(@PathVariable Long clubId, @RequestBody TeamNameDto request) {
        return clubTeamService.createTeam(clubId, request);
    }

    // update team
    @PutMapping("/teams/{teamId}")
    public MessageResponseDto updateTeam(@PathVariable Long clubId, @PathVariable Long teamId, @RequestBody TeamNameDto request) {
        return clubTeamService.updateTeam(clubId, teamId, request);
    }

    // delete any team
    @DeleteMapping("/teams/{teamId}")
    public MessageResponseDto deleteTeam(@PathVariable Long teamId, @PathVariable Long clubId) {
        return clubTeamService.deleteTeam(teamId, clubId);
    }

    // add member in team
    @PostMapping("/teams/{teamId}/{studentId}")
    public MessageResponseDto addTeamMember(@PathVariable Long clubId, @PathVariable Long studentId, @PathVariable Long teamId) {
        return clubTeamService.addTeamMember(clubId, teamId, studentId);
    }

    // delete member from team
    @DeleteMapping("/teams/{teamId}/{studentId}")
    public MessageResponseDto deleteTeamMember(@PathVariable Long clubId, @PathVariable Long teamId, @PathVariable Long studentId) {
        return clubTeamService.deleteTeamMember(clubId, teamId, studentId);
    }

    /* Members */

    // get all members
    @GetMapping("/members")
    public List<ClubMemberDto> getMembers(@PathVariable Long clubId) {
        return clubService.getClubMembers(clubId);
    }

    // add any member
    @PostMapping("/members/add")
    public MessageResponseDto addMember(@PathVariable Long clubId, @RequestBody AddMemberRequestDto request) {
        return clubAdminService.addMember(clubId, request);
    }

    // remove any member
    @DeleteMapping("/members/remove/{studentId}")
    public MessageResponseDto removeMember(@PathVariable Long clubId, @PathVariable Long studentId) {
        return clubAdminService.removeMember(clubId, studentId);
    }

    /* Settings */

    // get club details
    @GetMapping("/details")
    public ClubProfileDto getClubProfile(@PathVariable Long clubId) {
        return clubService.getClubProfile(clubId);
    }

    // modify club details
    @PutMapping("/details")
    public MessageResponseDto modifyClubProfile(
            @PathVariable Long clubId,
            @RequestPart("profile") ClubProfileDto request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        return clubService.modifyClubProfile(clubId, request, image);
    }

    // transfer admin/ownership
    @PatchMapping("/details/handover")
    public MessageResponseDto handOver(@PathVariable Long clubId, @RequestBody HandOverRequestDto request) {
        return clubService.handOver(clubId, authService.getCurrentCollegeId(), request);
    }
}