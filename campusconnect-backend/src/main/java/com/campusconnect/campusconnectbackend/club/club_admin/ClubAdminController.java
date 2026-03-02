package com.campusconnect.campusconnectbackend.club.club_admin;

import com.campusconnect.campusconnectbackend.club.announcement.AnnouncementService;
import com.campusconnect.campusconnectbackend.club.ClubService;
import com.campusconnect.campusconnectbackend.club.ClubRepository;
import com.campusconnect.campusconnectbackend.club.club_team.ClubTeamService;
import com.campusconnect.campusconnectbackend.club.announcement.dto.req.AnnouncementPatchRequestDto;
import com.campusconnect.campusconnectbackend.club.announcement.dto.req.AnnouncementRequestDto;
import com.campusconnect.campusconnectbackend.club.dto.req.AddMemberRequestDto;
import com.campusconnect.campusconnectbackend.club.dto.req.SaveOverviewRequestDto;
import com.campusconnect.campusconnectbackend.club.event.dto.req.EventRequestDto;
import com.campusconnect.campusconnectbackend.club.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubDashboardStatsDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubTeamDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_card.ClubMemberDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.TeamNameDto;
import com.campusconnect.campusconnectbackend.club.event.dto.res.EventResponseDto;
import com.campusconnect.campusconnectbackend.club.event.overview_generation.EventOverviewService;
import com.campusconnect.campusconnectbackend.club.event.service.EventService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

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

    /* Home */

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
        return clubAdminService.getStats(clubId);
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

    // create new announcement
    @PostMapping("/announcements")
    public MessageResponseDto createAnnouncement(@PathVariable Long clubId, @RequestBody AnnouncementRequestDto request) {
        return announcementService.createAnnouncement(request, clubId);
    }

    // modify any announcement
    @PatchMapping("/announcements/{annId}")
    public MessageResponseDto updateAnnouncement(@PathVariable Long annId, @RequestBody AnnouncementPatchRequestDto request) {
        return announcementService.updateAnnouncement(request, annId);
    }

    // delete any announcement
    @DeleteMapping("/announcements/{annId}")
    public MessageResponseDto deleteAnnouncement(@PathVariable Long annId) {
        return announcementService.deleteAnnouncement(annId);
    }


    /* Events */

    // get all live & upcoming events of club
    @GetMapping("/events/active")
    public List<EventResponseDto> getActiveEventsByCollege(@PathVariable Long clubId) {

        return eventService.getActiveEventsByClub(clubId);
    }

    // get all finished events of club
    @GetMapping("/events/finished")
    public List<EventResponseDto> getFinishedEventsByCollege(@PathVariable Long clubId) {
        return eventService.getFinishedEventsByClub(clubId);
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
    @PostMapping("/events/active")
    public MessageResponseDto createEvent(@PathVariable Long clubId, @RequestBody EventRequestDto request) {
        return eventService.createEvent(request, clubId);
    }

    // modify any event
    @PatchMapping("/events/active/{eventId}")
    public MessageResponseDto updateEvent(@PathVariable Long eventId, @RequestBody EventRequestDto request) {
        return eventService.updateEvent(request, eventId);
    }

    // delete any event
    @DeleteMapping("/events/active/{eventId}")
    public MessageResponseDto deleteEvent(@PathVariable Long eventId) {
        return eventService.deleteEvent(eventId);
    }


    /* Generate Overview */

    // generate overview
    @PostMapping("/events/finished/{eventId}/generate-overview")
    public String generateOverview(@PathVariable Long eventId) {
        return eventOverviewService.generateOverview(eventId);
    }

    // save overview
    @PatchMapping("/events/finished/{eventId}/save-overview")
    public MessageResponseDto saveOverview(@PathVariable Long eventId, @RequestBody SaveOverviewRequestDto request) {
        return eventOverviewService.saveOverview(eventId, request);
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

    // delete ay team
    @DeleteMapping("/teams/{teamId}")
    public MessageResponseDto deleteTeam(@PathVariable Long teamId) {
        return clubTeamService.deleteTeam(teamId);
    }

    // add member in team
    @PostMapping("/teams/{teamId}/{studentId}")
    public MessageResponseDto addTeamMember(@PathVariable Long clubId, @PathVariable Long studentId, @PathVariable Long teamId) {
        return clubTeamService.addTeamMember(clubId, teamId, studentId);
    }

    // delete member from team
    @DeleteMapping("/teams/{teamId}/{studentId}")
    public MessageResponseDto deleteTeamMember(@PathVariable Long teamId, @PathVariable Long studentId) {
        return clubTeamService.deleteTeamMember(teamId, studentId);
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
}
