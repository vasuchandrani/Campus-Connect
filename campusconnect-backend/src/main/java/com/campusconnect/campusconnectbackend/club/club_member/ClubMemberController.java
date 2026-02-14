package com.campusconnect.campusconnectbackend.club.club_member;

import com.campusconnect.campusconnectbackend.club.announcement.AnnouncementService;
import com.campusconnect.campusconnectbackend.club.ClubRepository;
import com.campusconnect.campusconnectbackend.club.ClubService;
import com.campusconnect.campusconnectbackend.club.club_team.ClubTeamService;
import com.campusconnect.campusconnectbackend.dto.request.announcement.AnnouncementPatchRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.announcement.AnnouncementRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.event.EventPatchRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.event.EventRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.announcement.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.dto.response.club.ClubDashboardStatsDto;
import com.campusconnect.campusconnectbackend.dto.response.club.ClubTeamDto;
import com.campusconnect.campusconnectbackend.dto.response.club.club_card.ClubMemberDto;
import com.campusconnect.campusconnectbackend.dto.response.event.EventResponseDto;
import com.campusconnect.campusconnectbackend.club.event.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/campus-connect/clubs/{clubId}/member")
@RequiredArgsConstructor
public class ClubMemberController {

    private final ClubMemberService clubMemberService;
    private final EventService eventService;
    private final AnnouncementService announcementService;
    private final ClubTeamService clubTeamService;
    private final ClubRepository clubRepository;
    private final ClubService clubService;

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
        return clubMemberService.getStats(clubId);
    }

    // upcoming events -top 3 upcoming events
    @GetMapping("/top-events")
    public List<EventResponseDto> getTopEvents(@PathVariable Long clubId) {
        return eventService.getTopEventsByClub(clubId);
    }

    // announcements -top 4 announcements
    @GetMapping("/top-announcements")
    public List<AnnouncementResponseDto> getLatestAnnouncements(@PathVariable Long clubId) {
        return announcementService.getLatestAnnouncements(clubId);
    }


    /* Events */

    // get all events
    @GetMapping("/events")
    public List<EventResponseDto> getEvents(@PathVariable Long clubId) {
        return eventService.getAllEvents(clubId);
    }

    // create new event
    @PostMapping("/events")
    public boolean createEvent(@PathVariable Long clubId, @RequestBody EventRequestDto request) {
        return eventService.createEvent(request, clubId);
    }

    // modify any event
    @PatchMapping("/events/{eventId}")
    public boolean updateEvent(@PathVariable Long eventId, @RequestBody EventPatchRequestDto request) {
        return eventService.updateEvent(request, eventId);
    }

    // delete any event
    @DeleteMapping("/events/{eventId}")
    public boolean deleteEvent(@PathVariable Long eventId) {
        return eventService.deleteEvent(eventId);
    }


    /* Announcements */

    // get all announcements
    @GetMapping("/announcements")
    public List<AnnouncementResponseDto> getAnnouncements(@PathVariable Long clubId) {
        return announcementService.getAnnouncements(clubId);
    }

    // create new announcement
    @PostMapping("/announcements")
    public boolean createAnnouncement(@PathVariable Long clubId, @RequestBody AnnouncementRequestDto request) {
        return announcementService.createAnnouncement(request, clubId);
    }

    // modify any announcement
    @PatchMapping("/announcements/{annId}")
    public boolean updateAnnouncement(@PathVariable Long annId, @RequestBody AnnouncementPatchRequestDto request) {
        return announcementService.updateAnnouncement(request, annId);
    }

    // delete any announcement
    @DeleteMapping("/announcements/{annId}")
    public boolean deleteAnnouncement(@PathVariable Long annId) {
        return announcementService.deleteAnnouncement(annId);
    }


    /* Members */

    // get all members of club
    @GetMapping("/members")
    public List<ClubMemberDto> getMembers(@PathVariable Long clubId) {
        return clubService.getClubMembers(clubId);
    }


    /* Teams */

    // get all team
    @GetMapping("/teams")
    public List<ClubTeamDto> getTeams(@PathVariable Long clubId) {
        return clubTeamService.getTeamsByClub(clubId);
    }

    // get team count of club
    @GetMapping("/team-cnt")
    public int getTeamCnt(@PathVariable Long clubId) {
        return clubTeamService.getTeamCount(clubId);
    }
}
