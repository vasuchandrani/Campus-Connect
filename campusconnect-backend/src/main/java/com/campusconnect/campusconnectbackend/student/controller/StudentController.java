package com.campusconnect.campusconnectbackend.student.controller;

import com.campusconnect.campusconnectbackend.club.announcement.AnnouncementService;
import com.campusconnect.campusconnectbackend.club.club_follower.ClubFollowerService;
import com.campusconnect.campusconnectbackend.club.ClubService;
import com.campusconnect.campusconnectbackend.club.event.dto.res.EventDetailsResponseDto;
import com.campusconnect.campusconnectbackend.student.dto.req.ClubRequestDto;
import com.campusconnect.campusconnectbackend.club.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.club.dto.res.YourClubListDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_card.ClubDetailsResponseDto;
import com.campusconnect.campusconnectbackend.club.dto.res.ClubListDto;
import com.campusconnect.campusconnectbackend.club.event.dto.res.EventResponseDto;
import com.campusconnect.campusconnectbackend.news_paper.dto.res.NewsPaperResponseDto;
import com.campusconnect.campusconnectbackend.student.dto.res.StudentDashboardStatsDto;
import com.campusconnect.campusconnectbackend.club.event.service.EventRegistrationService;
import com.campusconnect.campusconnectbackend.club.event.service.EventService;
import com.campusconnect.campusconnectbackend.news_paper.NewsPaperService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/campus-connect/student")
@RequiredArgsConstructor
public class StudentController {
    private final EventService eventService;
    private final NewsPaperService newsPaperService;
    private final ClubService clubService;
    private final StudentService studentService;
    private final EventRegistrationService eventRegistrationService;
    private final AnnouncementService announcementService;
    private final AuthService authService;
    private final ClubFollowerService clubFollowerService;


    /* Home */

    // get name of student
    @GetMapping("/name")
    public String getName() {
        Long userId = authService.getCurrentUserId();
        return studentService.getName(userId);
    }

    // stats -section
    @GetMapping("/stats")
    public StudentDashboardStatsDto getStats() {
        return studentService.getStats();
    }

    // your clubs -section
    // get all joined clubs
    @GetMapping("/joined-clubs")
    public List<YourClubListDto> getJoinedClubs() {
        return clubService.getYourClubsByCollege();
    }

    // request for a new club
    @PostMapping("/request-club")
    public boolean requestForClub(@RequestBody ClubRequestDto request) {
        return studentService.requestForClub(request);
    }

    // manage joined clubs
    @PostMapping("/joined-clubs/{id}")
    public String manageClub(@PathVariable Long id) {
        return studentService.manageClub(id);
    }

    // upcoming events -top 3 upcoming events
    @GetMapping("/top-events")
    public List<EventResponseDto> getTopEvents() {
        return eventService.getTopEvents();
    }

    // campus news -top 4 news-papers
    @GetMapping("/top-news")
    public List<NewsPaperResponseDto> getTopNews() {
        return newsPaperService.getTopNewsPaper();
    }

    /* Clubs */

    // get all clubs of college
    @GetMapping("/clubs")
    public List<ClubListDto> getAllClubs() {
        return clubService.getClubsByCollege();
    }

    // get particular club
    @GetMapping("/clubs/{clubId}")
    public ClubDetailsResponseDto getClub(@PathVariable Long clubId) {
        return clubService.getClub(clubId);
    }

    // follow-unfollow
    @PostMapping("/clubs/{clubId}")
    public void changeFollow(@PathVariable Long clubId, @RequestBody boolean follow) {
        clubFollowerService.changeFollow(clubId, follow);
    }


    /* Events */

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
    public EventDetailsResponseDto getEventDetails(@PathVariable Long eventId) {
        return eventService.getEventDetails(eventId);
    }

    // register in event
    @PostMapping("/events/active/{eventId}/register")
    public boolean registerEvent(@PathVariable Long eventId) {
        return eventRegistrationService.registerStudent(eventId);
    }

    // unregister from event
    @PostMapping("/events/active/{eventId}/unregister")
    public boolean unRegisterEvent(@PathVariable Long eventId) {
        return eventRegistrationService.unRegisterStudent(eventId);
    }


    /* Announcements */

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


    /* Notifications */

    // get all announcement of followed clubs(Notifications)
    @GetMapping("/notifications")
    public List<AnnouncementResponseDto> getNotifications() {
        return announcementService.getNotifications();
    }
}
