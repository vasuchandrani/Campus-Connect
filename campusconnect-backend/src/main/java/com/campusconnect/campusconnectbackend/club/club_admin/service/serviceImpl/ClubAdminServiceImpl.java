package com.campusconnect.campusconnectbackend.club.club_admin.service.serviceImpl;

import com.campusconnect.campusconnectbackend.announcement.dto.req.AnnouncementRequestDto;
import com.campusconnect.campusconnectbackend.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.announcement.entity.Announcement;
import com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus;
import com.campusconnect.campusconnectbackend.announcement.repository.AnnouncementRepository;
import com.campusconnect.campusconnectbackend.club.club_admin.service.ClubAdminService;
import com.campusconnect.campusconnectbackend.club.dto.req.AddMemberRequestDto;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.club.service.ClubMemberManagementService;
import com.campusconnect.campusconnectbackend.club.service.ClubService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.res.EventResponseDto;
import com.campusconnect.campusconnectbackend.event.entity.Event;
import com.campusconnect.campusconnectbackend.event.entity.enums.EventStatus;
import com.campusconnect.campusconnectbackend.event.repository.EventRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClubAdminServiceImpl implements ClubAdminService {
    private final ClubService clubService;
    private final StudentRepoService studentRepoService;
    private final ClubMemberManagementService clubMemberManagementService;
    private final ClubRepository clubRepository;
    private final AnnouncementRepository announcementRepository;
    private final EventRepository eventRepository;
    private final AuthService authService;

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_dashboard_stats", key = "#clubId"),
            @CacheEvict(value = "club_member_count", key = "#clubId"),
            @CacheEvict(value = "club_members", key = "#clubId")
    })
    public MessageResponseDto addMember(Long clubId, AddMemberRequestDto request) {
        Student student = studentRepoService.getStudentByEmail(request.getEmail());
        Club club = clubService.getClubById(clubId);

        return clubMemberManagementService.addClubMember(club, student, request.getRole());
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_dashboard_stats", key = "#clubId"),
            @CacheEvict(value = "club_member_count", key = "#clubId"),
            @CacheEvict(value = "club_members", key = "#clubId")
    })
    public MessageResponseDto removeMember(Long clubId, Long studentId) {
        return clubMemberManagementService.removeClubMember(clubId, studentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponseDto> getPublishedAnnouncements(Long clubId) {
        List<Announcement> list = announcementRepository.findPublishedByClubId(clubId);
        return mapAnnouncementList(list);
    }

    private Long resolveUserId() {
        try {
            com.campusconnect.campusconnectbackend.user.entity.User currentUser = authService.getCurrentUser();
            if (currentUser != null) {
                return currentUser.getId();
            }
        } catch (Exception ignored) {}
        return authService.getCurrentUserId();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponseDto> getDraftAnnouncements(Long clubId) {
        Long userId = resolveUserId();
        List<Announcement> list = announcementRepository.findDraftsByClubIdAndUserId(clubId, userId);
        return mapAnnouncementList(list);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponseDto> getPendingAnnouncements(Long clubId) {
        List<Announcement> list = announcementRepository.findPendingForClubAdmin(clubId);
        return mapAnnouncementList(list);
    }

    @Override
    @Transactional
    public MessageResponseDto saveAnnouncementDraft(Long clubId, AnnouncementRequestDto request) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

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
    public MessageResponseDto publishAnnouncementDraft(Long clubId, Long annId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        Announcement ann = announcementRepository.findById(annId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));

        if ("MENTOR_REQUIRED".equalsIgnoreCase(club.getAnnouncementPermission())) {
            ann.setStatus(AnnouncementStatus.APPROVED_BY_CLUB_ADMIN);
            ann.setState(1);
            announcementRepository.save(ann);
            return new MessageResponseDto("Draft submitted for Mentor Approval");
        } else {
            ann.setStatus(AnnouncementStatus.PUBLISHED);
            ann.setState(3);
            announcementRepository.save(ann);
            return new MessageResponseDto("Announcement published successfully");
        }
    }

    @Override
    @Transactional
    public MessageResponseDto deleteAnnouncementDraft(Long clubId, Long annId) {
        Announcement ann = announcementRepository.findById(annId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        announcementRepository.delete(ann);
        return new MessageResponseDto("Draft deleted successfully");
    }

    @Override
    @Transactional
    public MessageResponseDto approveAnnouncement(Long clubId, Long annId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        Announcement ann = announcementRepository.findById(annId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));

        if ("MENTOR_REQUIRED".equalsIgnoreCase(club.getAnnouncementPermission())) {
            ann.setStatus(AnnouncementStatus.APPROVED_BY_CLUB_ADMIN);
            ann.setState(1);
            announcementRepository.save(ann);
            return new MessageResponseDto("Announcement approved and forwarded for Mentor Review");
        } else {
            ann.setStatus(AnnouncementStatus.PUBLISHED);
            ann.setState(3);
            announcementRepository.save(ann);
            return new MessageResponseDto("Announcement approved and published successfully");
        }
    }

    @Override
    @Transactional
    public MessageResponseDto rejectAnnouncement(Long clubId, Long annId) {
        Announcement ann = announcementRepository.findById(annId)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        ann.setStatus(AnnouncementStatus.REJECTED);
        ann.setState(-1);
        announcementRepository.save(ann);
        return new MessageResponseDto("Announcement rejected");
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
    public List<EventResponseDto> getDraftEvents(Long clubId) {
        Long userId = resolveUserId();
        List<Event> list = eventRepository.findDraftsByClubIdAndUserId(clubId, userId);
        return mapEventList(list);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponseDto> getPendingEvents(Long clubId) {
        List<Event> list = eventRepository.findPendingForClubAdmin(clubId);
        return mapEventList(list);
    }

    @Override
    @Transactional
    public MessageResponseDto saveEventDraft(Long clubId, EventRequestDto request) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription() != null ? request.getDescription() : "Event draft");
        event.setRegistrationEnd(request.getRegistrationEnd() != null ? request.getRegistrationEnd() : LocalDateTime.now().plusDays(7));
        event.setStartTime(request.getStartTime() != null ? request.getStartTime() : LocalDateTime.now().plusDays(8));
        event.setEndTime(request.getEndTime() != null ? request.getEndTime() : LocalDateTime.now().plusDays(8).plusHours(2));
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
    public MessageResponseDto publishEventDraft(Long clubId, Long eventId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if ("MENTOR_REQUIRED".equalsIgnoreCase(club.getEventPermission())) {
            event.setStatus(EventStatus.APPROVED_BY_CLUB_ADMIN);
            event.setState(1);
            eventRepository.save(event);
            return new MessageResponseDto("Event draft submitted for Mentor Approval");
        } else {
            event.setStatus(EventStatus.PUBLISHED);
            event.setState(3);
            eventRepository.save(event);
            return new MessageResponseDto("Event published successfully");
        }
    }

    @Override
    @Transactional
    public MessageResponseDto deleteEventDraft(Long clubId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        eventRepository.delete(event);
        return new MessageResponseDto("Event draft deleted");
    }

    @Override
    @Transactional
    public MessageResponseDto approveEvent(Long clubId, Long eventId) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new RuntimeException("Club not found"));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if ("MENTOR_REQUIRED".equalsIgnoreCase(club.getEventPermission())) {
            event.setStatus(EventStatus.APPROVED_BY_CLUB_ADMIN);
            event.setState(1);
            eventRepository.save(event);
            return new MessageResponseDto("Event approved and forwarded for Mentor Review");
        } else {
            event.setStatus(EventStatus.PUBLISHED);
            event.setState(3);
            eventRepository.save(event);
            return new MessageResponseDto("Event approved and published successfully");
        }
    }

    @Override
    @Transactional
    public MessageResponseDto rejectEvent(Long clubId, Long eventId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setStatus(EventStatus.REJECTED);
        event.setState(-1);
        eventRepository.save(event);
        return new MessageResponseDto("Event proposal rejected");
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
