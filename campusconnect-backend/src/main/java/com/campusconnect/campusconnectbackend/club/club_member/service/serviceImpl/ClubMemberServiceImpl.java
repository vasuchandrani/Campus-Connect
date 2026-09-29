package com.campusconnect.campusconnectbackend.club.club_member.service.serviceImpl;

import com.campusconnect.campusconnectbackend.announcement.dto.req.AnnouncementRequestDto;
import com.campusconnect.campusconnectbackend.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.announcement.entity.Announcement;
import com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus;
import com.campusconnect.campusconnectbackend.announcement.repository.AnnouncementRepository;
import com.campusconnect.campusconnectbackend.club.club_follower.repository.ClubFollowerRepository;
import com.campusconnect.campusconnectbackend.club.club_member.repository.ClubMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_member.service.ClubMemberService;
import com.campusconnect.campusconnectbackend.club.club_team.repository.ClubTeamRepository;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubDashboardStatsDto;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.res.EventResponseDto;
import com.campusconnect.campusconnectbackend.event.entity.Event;
import com.campusconnect.campusconnectbackend.event.entity.enums.EventStatus;
import com.campusconnect.campusconnectbackend.event.repository.EventRepository;
import com.campusconnect.campusconnectbackend.event.service.EventService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClubMemberServiceImpl implements ClubMemberService {

    private final ClubMemberRepository clubMemberRepository;
    private final EventService eventService;
    private final ClubTeamRepository clubTeamRepository;
    private final ClubFollowerRepository clubFollowerRepository;
    private final AnnouncementRepository announcementRepository;
    private final EventRepository eventRepository;
    private final ClubRepository clubRepository;
    private final AuthService authService;

    @Override
    public String getMyRole(Long clubId, Long studentId) {
        return clubMemberRepository.findRoleByClubIdAndStudentId(clubId, studentId).orElse("You are not authorized");
    }

    @Override
    @Cacheable(value = "joined_club_count", key = "#studentId")
    public int getJoinedClubCount(Long studentId) {
        return clubMemberRepository.countByStudent_Id(studentId);
    }

    @Override
    @Cacheable(
            value = "club_dashboard_stats",
            key = "#clubId",
            sync = true
    )
    public ClubDashboardStatsDto getStats(Long clubId) {
        ClubDashboardStatsDto dto = new ClubDashboardStatsDto();
        dto.setEvents(eventService.getActiveEventsByClub(clubId).size());
        dto.setMembers(clubMemberRepository.countByClub_Id(clubId));
        dto.setTeams(clubTeamRepository.countByClub_Id(clubId));
        dto.setFollowers(clubFollowerRepository.countByClub_Id(clubId));
        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponseDto> getPublishedAnnouncements(Long clubId) {
        List<Announcement> list = announcementRepository.findPublishedByClubId(clubId);
        return mapAnnouncementList(list);
    }

    private Long resolveUserId(Long passedId) {
        try {
            com.campusconnect.campusconnectbackend.user.entity.User currentUser = authService.getCurrentUser();
            if (currentUser != null) {
                return currentUser.getId();
            }
        } catch (Exception ignored) {}
        return passedId;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponseDto> getMyPendingAnnouncements(Long clubId, Long userId) {
        List<Announcement> list = announcementRepository.findMyPendingByClubIdAndUserId(clubId, resolveUserId(userId));
        return mapAnnouncementList(list);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponseDto> getMyDraftAnnouncements(Long clubId, Long userId) {
        List<Announcement> list = announcementRepository.findDraftsByClubIdAndUserId(clubId, resolveUserId(userId));
        return mapAnnouncementList(list);
    }

    @Override
    @Transactional
    public MessageResponseDto saveAnnouncementDraft(Long clubId, AnnouncementRequestDto request, Long userId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        Announcement ann = new Announcement();
        ann.setTitle(request.getTitle());
        ann.setContent(request.getContent());
        ann.setClub(club);
        ann.setCollege(club.getCollege());
        ann.setCreatedBy(authService.getCurrentUser());
        ann.setStatus(AnnouncementStatus.DRAFT);
        ann.setState(0);
        announcementRepository.save(ann);

        return new MessageResponseDto("Announcement draft saved successfully");
    }

    @Override
    @Transactional
    public MessageResponseDto publishAnnouncementDraft(Long clubId, Long annId, Long userId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        Announcement ann = announcementRepository.findById(annId)
                .orElseThrow(() -> new RuntimeException("Announcement not found with id: " + annId));

        Long actualUserId = resolveUserId(userId);
        if (!Objects.equals(ann.getCreatedBy().getId(), actualUserId)) {
            throw new RuntimeException("Access Denied: You are not the author of this draft");
        }

        if ("DIRECT".equalsIgnoreCase(club.getAnnouncementPermission())) {
            ann.setStatus(AnnouncementStatus.PUBLISHED);
            ann.setState(3);
            announcementRepository.save(ann);
            return new MessageResponseDto("Announcement published successfully");
        } else {
            ann.setStatus(AnnouncementStatus.CREATED);
            ann.setState(0);
            announcementRepository.save(ann);
            return new MessageResponseDto("Draft submitted for review");
        }
    }

    @Override
    @Transactional
    public MessageResponseDto deleteAnnouncementDraft(Long clubId, Long annId, Long userId) {
        Announcement ann = announcementRepository.findById(annId)
                .orElseThrow(() -> new RuntimeException("Announcement not found with id: " + annId));

        Long actualUserId = resolveUserId(userId);
        if (!Objects.equals(ann.getCreatedBy().getId(), actualUserId)) {
            throw new RuntimeException("Access Denied: You can only delete your own draft");
        }

        announcementRepository.delete(ann);
        return new MessageResponseDto("Draft deleted successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponseDto> getPublishedEvents(Long clubId) {
        List<Event> list = eventRepository.findActiveEventsByClub(clubId, LocalDateTime.now());
        return mapEventList(list);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponseDto> getFinishedEvents(Long clubId) {
        List<Event> list = eventRepository.findFinishedEventsByClub(clubId, LocalDateTime.now());
        return mapEventList(list);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponseDto> getMyPendingEvents(Long clubId, Long userId) {
        List<Event> list = eventRepository.findMyPendingByClubIdAndUserId(clubId, resolveUserId(userId));
        return mapEventList(list);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponseDto> getMyDraftEvents(Long clubId, Long userId) {
        List<Event> list = eventRepository.findDraftsByClubIdAndUserId(clubId, resolveUserId(userId));
        return mapEventList(list);
    }

    @Override
    @Transactional
    public MessageResponseDto saveEventDraft(Long clubId, EventRequestDto request, Long userId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription() != null ? request.getDescription() : "");
        event.setStartTime(request.getStartTime() != null ? request.getStartTime() : LocalDateTime.now().plusDays(1));
        event.setEndTime(request.getEndTime() != null ? request.getEndTime() : LocalDateTime.now().plusDays(1).plusHours(2));
        event.setRegistrationStart(LocalDateTime.now());
        event.setRegistrationEnd(request.getRegistrationEnd() != null ? request.getRegistrationEnd() : LocalDateTime.now().plusDays(1));
        event.setClub(club);
        event.setCollege(club.getCollege());
        event.setCreatedBy(authService.getCurrentUser());
        event.setStatus(EventStatus.DRAFT);
        event.setState(0);
        eventRepository.save(event);

        return new MessageResponseDto("Event draft saved successfully");
    }

    @Override
    @Transactional
    public MessageResponseDto publishEventDraft(Long clubId, Long eventId, Long userId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found with id: " + clubId));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        Long actualUserId = resolveUserId(userId);
        if (!Objects.equals(event.getCreatedBy().getId(), actualUserId)) {
            throw new RuntimeException("Access Denied: You are not the creator of this draft");
        }

        if ("DIRECT".equalsIgnoreCase(club.getEventPermission())) {
            event.setStatus(EventStatus.PUBLISHED);
            event.setState(2);
            eventRepository.save(event);
            return new MessageResponseDto("Event published successfully");
        } else {
            event.setStatus(EventStatus.CREATED);
            event.setState(0);
            eventRepository.save(event);
            return new MessageResponseDto("Draft submitted for review");
        }
    }

    @Override
    @Transactional
    public MessageResponseDto deleteEventDraft(Long clubId, Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found with id: " + eventId));

        Long actualUserId = resolveUserId(userId);
        if (!Objects.equals(event.getCreatedBy().getId(), actualUserId)) {
            throw new RuntimeException("Access Denied: You can only delete your own draft");
        }

        eventRepository.delete(event);
        return new MessageResponseDto("Draft deleted successfully");
    }

    private List<AnnouncementResponseDto> mapAnnouncementList(List<Announcement> list) {
        List<AnnouncementResponseDto> res = new ArrayList<>();
        if (list == null) return res;
        for (Announcement a : list) {
            AnnouncementResponseDto dto = new AnnouncementResponseDto();
            dto.setId(a.getId());
            dto.setTitle(a.getTitle());
            dto.setContent(a.getContent());
            if (a.getClub() != null) {
                dto.setClubName(a.getClub().getName());
            }
            dto.setCreatedAt(a.getCreatedAt());
            res.add(dto);
        }
        return res;
    }

    private List<EventResponseDto> mapEventList(List<Event> list) {
        List<EventResponseDto> res = new ArrayList<>();
        if (list == null) return res;
        for (Event e : list) {
            EventResponseDto dto = new EventResponseDto();
            dto.setId(e.getId());
            dto.setTitle(e.getTitle());
            dto.setDescription(e.getDescription());
            dto.setImage(e.getCoverImage());
            dto.setStartTime(e.getStartTime());
            dto.setEndTime(e.getEndTime());
            dto.setRegistrationEnd(e.getRegistrationEnd());
            if (e.getLocation() != null) {
                dto.setLocation(e.getLocation().getAddress());
            }
            if (e.getClub() != null) {
                dto.setClubName(e.getClub().getName());
            }
            dto.setCreateAt(e.getCreatedAt());
            dto.setGlobal(e.isPublic() || e.getState() >= 5);
            res.add(dto);
        }
        return res;
    }
}
