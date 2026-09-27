package com.campusconnect.campusconnectbackend.club.club_mentor.service.serviceImpl;

import com.campusconnect.campusconnectbackend.announcement.dto.req.AnnouncementRequestDto;
import com.campusconnect.campusconnectbackend.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.announcement.entity.Announcement;
import com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus;
import com.campusconnect.campusconnectbackend.announcement.repository.AnnouncementRepository;
import com.campusconnect.campusconnectbackend.club.club_follower.repository.ClubFollowerRepository;
import com.campusconnect.campusconnectbackend.club.club_member.entity.ClubMember;
import com.campusconnect.campusconnectbackend.club.club_member.repository.ClubMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_mentor.dto.ClubMentorDashboardDto;
import com.campusconnect.campusconnectbackend.club.club_mentor.dto.ClubPermissionSettingsDto;
import com.campusconnect.campusconnectbackend.club.club_mentor.service.ClubMentorDashboardService;
import com.campusconnect.campusconnectbackend.club.club_team.entity.ClubTeam;
import com.campusconnect.campusconnectbackend.club.club_team.entity.ClubTeamMember;
import com.campusconnect.campusconnectbackend.club.club_team.repository.ClubTeamMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_team.repository.ClubTeamRepository;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.common.location.dto.LocationResponseDto;
import com.campusconnect.campusconnectbackend.common.location.service.LocationService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventRegistrationPlanRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.res.EventRegistrationPlanResponseDto;
import com.campusconnect.campusconnectbackend.event.dto.res.EventResponseDto;
import com.campusconnect.campusconnectbackend.event.entity.Event;
import com.campusconnect.campusconnectbackend.event.entity.EventRegistrationPlan;
import com.campusconnect.campusconnectbackend.event.entity.enums.EventHost;
import com.campusconnect.campusconnectbackend.event.entity.enums.EventRegistrationPayment;
import com.campusconnect.campusconnectbackend.event.entity.enums.EventStatus;
import com.campusconnect.campusconnectbackend.event.entity.enums.EventType;
import com.campusconnect.campusconnectbackend.event.repository.EventRegistrationPlanRepository;
import com.campusconnect.campusconnectbackend.event.repository.EventRepository;
import com.campusconnect.campusconnectbackend.club.club_mentor.repository.ClubMentorRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ClubMentorDashboardServiceImpl implements ClubMentorDashboardService {

    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final ClubTeamRepository clubTeamRepository;
    private final ClubTeamMemberRepository clubTeamMemberRepository;
    private final ClubFollowerRepository clubFollowerRepository;
    private final AnnouncementRepository announcementRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationPlanRepository eventRegistrationPlanRepository;
    private final LocationService locationService;
    private final AuthService authService;
    private final ClubMentorRepository clubMentorRepository;

    private Club getMentoredClubOrThrow(Long clubId, Long profId) {
        Club club = clubRepository.findById(clubId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Club not found with id: " + clubId)
        );
        boolean isDesignated = (club.getMentor() != null && Objects.equals(club.getMentor().getId(), profId))
                || clubMentorRepository.existsByClub_IdAndProfessor_Id(clubId, profId);
        if (!isDesignated) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access Denied: You are not designated as faculty mentor for this club");
        }
        return club;
    }

    private AnnouncementResponseDto getAnnouncementDto(Announcement a) {
        AnnouncementResponseDto dto = new AnnouncementResponseDto();
        if (a == null) return dto;
        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setContent(a.getContent());
        if (a.getClub() != null) {
            dto.setClubName(a.getClub().getName());
        }
        dto.setCreatedAt(a.getCreatedAt());
        return dto;
    }

    private List<AnnouncementResponseDto> getAnnouncementDtoList(List<Announcement> announcements) {
        List<AnnouncementResponseDto> list = new ArrayList<>();
        if (announcements != null) {
            for (Announcement a : announcements) {
                list.add(getAnnouncementDto(a));
            }
        }
        return list;
    }

    private EventResponseDto getEventDto(Event event) {
        EventResponseDto dto = new EventResponseDto();
        if (event == null) return dto;
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setImage(event.getCoverImage());
        dto.setStartTime(event.getStartTime());
        dto.setEndTime(event.getEndTime());
        dto.setRegistrationStart(event.getRegistrationStart());
        dto.setRegistrationEnd(event.getRegistrationEnd());
        dto.setEventType(event.getEventType() != null ? event.getEventType().name() : "OFFLINE");
        dto.setHostedBy(event.getHostedBy() != null ? event.getHostedBy().name() : "CLUB");
        dto.setPublic(event.isPublic());
        dto.setRegistrationPayment(event.getRegistrationPayment() != null ? event.getRegistrationPayment().name() : "FREE");
        dto.setState(event.getState());
        dto.setStatus(event.getStatus() != null ? event.getStatus().name() : "UPCOMING");
        dto.setBatchYear(event.getBatchYear());
        dto.setCriteria(event.getCriteria());
        dto.setEligibility(event.getEligibility());
        dto.setPrizeMoney(event.getPrizeMoney());
        if (event.getClub() != null) {
            dto.setClubName(event.getClub().getName());
        }
        if (event.getLocation() != null) {
            dto.setLocation(event.getLocation().getAddress());
            LocationResponseDto locDto = new LocationResponseDto();
            locDto.setId(event.getLocation().getId());
            locDto.setAddress(event.getLocation().getAddress());
            locDto.setCity(event.getLocation().getCity());
            locDto.setState(event.getLocation().getState());
            locDto.setCountry(event.getLocation().getCountry());
            dto.setLocationDetails(locDto);
        }
        return dto;
    }

    private List<EventResponseDto> getEventDtoList(List<Event> events) {
        List<EventResponseDto> list = new ArrayList<>();
        if (events != null) {
            for (Event e : events) {
                list.add(getEventDto(e));
            }
        }
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public ClubMentorDashboardDto getDashboardData(Long clubId, Long profId) {
        Club club = getMentoredClubOrThrow(clubId, profId);

        ClubMentorDashboardDto dto = new ClubMentorDashboardDto();
        dto.setClubId(club.getId());
        dto.setClubName(club.getName());
        dto.setTagline1(club.getTagline1());
        dto.setTagline2(club.getTagline2());
        dto.setDescription(club.getDescription());
        dto.setLogoUrl(club.getLogoUrl());
        dto.setWebsite(club.getWebsite());
        dto.setFoundedBy(club.getFoundedBy());
        dto.setCreatedAt(club.getCreatedAt());

        if (club.getAdmin() != null) {
            dto.setAdminName(club.getAdmin().getFullName());
            if (club.getAdmin().getUser() != null) {
                dto.setAdminEmail(club.getAdmin().getUser().getEmail());
            }
            dto.setAdminDepartment(club.getAdmin().getDepartment());
        }

        dto.setFollowerCount(clubFollowerRepository.countByClub_Id(clubId));
        dto.setMemberCount(clubMemberRepository.countByClub_Id(clubId));
        dto.setTeamCount(clubTeamRepository.countByClub_Id(clubId));
        dto.setActiveEventCount(eventRepository.countActiveEventsByClub(clubId, LocalDateTime.now()));

        // 5 recent active events
        List<Event> activeEvents = eventRepository.findActiveEventsByClub(clubId, LocalDateTime.now());
        List<EventResponseDto> eventDtos = new ArrayList<>();
        for (int i = 0; i < Math.min(5, activeEvents.size()); i++) {
            eventDtos.add(getEventDto(activeEvents.get(i)));
        }
        dto.setRecentEvents(eventDtos);

        // 5 recent published announcements
        List<Announcement> publishedAnn = announcementRepository.findPublishedByClubId(clubId);
        List<AnnouncementResponseDto> annDtos = new ArrayList<>();
        for (int i = 0; i < Math.min(5, publishedAnn.size()); i++) {
            annDtos.add(getAnnouncementDto(publishedAnn.get(i)));
        }
        dto.setRecentAnnouncements(annDtos);

        dto.setAnnouncementPermission(club.getAnnouncementPermission() != null ? club.getAnnouncementPermission() : "ADMIN_ONLY");
        dto.setEventPermission(club.getEventPermission() != null ? club.getEventPermission() : "ADMIN_ONLY");

        return dto;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponseDto> getPublishedAnnouncements(Long clubId, Long profId) {
        getMentoredClubOrThrow(clubId, profId);
        return getAnnouncementDtoList(announcementRepository.findPublishedByClubId(clubId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponseDto> getDraftAnnouncements(Long clubId, Long profId) {
        Club club = getMentoredClubOrThrow(clubId, profId);
        Long userId = club.getMentor().getUser() != null ? club.getMentor().getUser().getId() : profId;
        return getAnnouncementDtoList(announcementRepository.findDraftsByClubIdAndUserId(clubId, userId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<AnnouncementResponseDto> getPendingAnnouncements(Long clubId, Long profId) {
        Club club = getMentoredClubOrThrow(clubId, profId);
        String perm = club.getAnnouncementPermission();
        if (!"MENTOR_REQUIRED".equalsIgnoreCase(perm)) {
            return Collections.emptyList();
        }
        return getAnnouncementDtoList(announcementRepository.findPendingByClubId(clubId));
    }

    @Override
    @Transactional
    public MessageResponseDto saveAnnouncementDraft(Long clubId, AnnouncementRequestDto request, Long profId) {
        Club club = getMentoredClubOrThrow(clubId, profId);
        Announcement ann = new Announcement();
        ann.setTitle(request.getTitle());
        ann.setContent(request.getContent());
        ann.setClub(club);
        ann.setCollege(club.getCollege());
        ann.setCreatedBy(club.getMentor().getUser() != null ? club.getMentor().getUser() : authService.getCurrentUser());
        ann.setStatus(AnnouncementStatus.DRAFT);
        ann.setState(0);
        announcementRepository.save(ann);
        return new MessageResponseDto("Draft announcement saved successfully");
    }

    @Override
    @Transactional
    public MessageResponseDto publishAnnouncementDraft(Long clubId, Long annId, Long profId) {
        getMentoredClubOrThrow(clubId, profId);
        Announcement ann = announcementRepository.findById(annId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Announcement not found"));
        ann.setStatus(AnnouncementStatus.PUBLISHED);
        ann.setState(2);
        announcementRepository.save(ann);
        return new MessageResponseDto("Draft announcement published successfully");
    }

    @Override
    @Transactional
    public MessageResponseDto deleteAnnouncementDraft(Long clubId, Long annId, Long profId) {
        getMentoredClubOrThrow(clubId, profId);
        Announcement ann = announcementRepository.findById(annId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Announcement not found"));
        announcementRepository.delete(ann);
        return new MessageResponseDto("Draft announcement deleted");
    }

    @Override
    @Transactional
    public MessageResponseDto approveAnnouncement(Long clubId, Long annId, Long profId) {
        getMentoredClubOrThrow(clubId, profId);
        Announcement ann = announcementRepository.findById(annId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Announcement not found"));
        if (!Objects.equals(ann.getClub().getId(), clubId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Announcement does not belong to this club");
        }
        ann.setStatus(AnnouncementStatus.PUBLISHED);
        ann.setState(2);
        announcementRepository.save(ann);
        return new MessageResponseDto("Announcement approved and published successfully");
    }

    @Override
    @Transactional
    public MessageResponseDto rejectAnnouncement(Long clubId, Long annId, Long profId) {
        getMentoredClubOrThrow(clubId, profId);
        Announcement ann = announcementRepository.findById(annId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Announcement not found"));
        if (!Objects.equals(ann.getClub().getId(), clubId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Announcement does not belong to this club");
        }
        ann.setStatus(AnnouncementStatus.DELETED);
        announcementRepository.save(ann);
        return new MessageResponseDto("Announcement rejected");
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponseDto> getPublishedEvents(Long clubId, Long profId) {
        getMentoredClubOrThrow(clubId, profId);
        return getEventDtoList(eventRepository.findActiveEventsByClub(clubId, LocalDateTime.now()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponseDto> getFinishedEvents(Long clubId, Long profId) {
        getMentoredClubOrThrow(clubId, profId);
        return getEventDtoList(eventRepository.findFinishedEventsByClub(clubId, LocalDateTime.now()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponseDto> getDraftEvents(Long clubId, Long profId) {
        Club club = getMentoredClubOrThrow(clubId, profId);
        Long userId = club.getMentor().getUser() != null ? club.getMentor().getUser().getId() : profId;
        return getEventDtoList(eventRepository.findDraftsByClubIdAndUserId(clubId, userId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventResponseDto> getPendingEvents(Long clubId, Long profId) {
        Club club = getMentoredClubOrThrow(clubId, profId);
        String perm = club.getEventPermission();
        if (!"MENTOR_REQUIRED".equalsIgnoreCase(perm)) {
            return Collections.emptyList();
        }
        return getEventDtoList(eventRepository.findPendingByClubId(clubId));
    }

    @Override
    @Transactional
    public MessageResponseDto saveEventDraft(Long clubId, EventRequestDto request, Long profId) {
        Club club = getMentoredClubOrThrow(clubId, profId);
        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription() != null ? request.getDescription() : "Draft event");
        event.setRegistrationStart(request.getRegistrationStart() != null ? request.getRegistrationStart() : LocalDateTime.now());
        event.setRegistrationEnd(request.getRegistrationEnd() != null ? request.getRegistrationEnd() : LocalDateTime.now().plusDays(7));
        event.setStartTime(request.getStartTime() != null ? request.getStartTime() : LocalDateTime.now().plusDays(8));
        event.setEndTime(request.getEndTime() != null ? request.getEndTime() : LocalDateTime.now().plusDays(8).plusHours(2));
        event.setClub(club);
        event.setCollege(club.getCollege());
        event.setCreatedBy(club.getMentor().getUser() != null ? club.getMentor().getUser() : authService.getCurrentUser());
        event.setStatus(EventStatus.DRAFT);
        event.setState(0);
        event.setHostedBy(EventHost.CLUB);
        event.setPublic(request.isPublic());

        if (request.getEventType() != null) {
            event.setEventType(EventType.valueOf(request.getEventType()));
        } else {
            event.setEventType(EventType.OFFLINE);
        }

        if (request.getRegistrationPayment() != null) {
            event.setRegistrationPayment(EventRegistrationPayment.valueOf(request.getRegistrationPayment()));
        } else {
            event.setRegistrationPayment(EventRegistrationPayment.FREE);
        }

        if (request.getLocation() != null && event.getEventType() != EventType.ONLINE) {
            event.setLocation(locationService.findOrCreateLocation(request.getLocation()));
        }

        event.setBatchYear(request.getBatchYear());
        event.setCriteria(request.getCriteria());
        event.setEligibility(request.getEligibility());
        event.setPrizeMoney(request.getPrizeMoney());

        Event savedEvent = eventRepository.save(event);

        if (request.getRegistrationPlans() != null && !request.getRegistrationPlans().isEmpty()) {
            for (EventRegistrationPlanRequestDto planDto : request.getRegistrationPlans()) {
                EventRegistrationPlan plan = new EventRegistrationPlan();
                plan.setEvent(savedEvent);
                plan.setPlanName(planDto.getPlanName());
                plan.setPlanDescription(planDto.getPlanDescription());
                plan.setAmount(planDto.getAmount());
                plan.setMaxSeats(planDto.getMaxSeats());
                eventRegistrationPlanRepository.save(plan);
            }
        }

        return new MessageResponseDto("Draft event saved successfully");
    }

    @Override
    @Transactional
    public MessageResponseDto publishEventDraft(Long clubId, Long eventId, Long profId) {
        getMentoredClubOrThrow(clubId, profId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        event.setStatus(EventStatus.PUBLISHED);
        event.setState(2);
        eventRepository.save(event);
        return new MessageResponseDto("Draft event published successfully");
    }

    @Override
    @Transactional
    public MessageResponseDto deleteEventDraft(Long clubId, Long eventId, Long profId) {
        getMentoredClubOrThrow(clubId, profId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        eventRegistrationPlanRepository.deleteAllByEvent_Id(eventId);
        eventRepository.delete(event);
        return new MessageResponseDto("Draft event deleted");
    }

    @Override
    @Transactional
    public MessageResponseDto approveEvent(Long clubId, Long eventId, Long profId) {
        getMentoredClubOrThrow(clubId, profId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        if (!Objects.equals(event.getClub().getId(), clubId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event does not belong to this club");
        }
        event.setStatus(EventStatus.PUBLISHED);
        event.setState(2);
        eventRepository.save(event);
        return new MessageResponseDto("Event approved and published successfully");
    }

    @Override
    @Transactional
    public MessageResponseDto rejectEvent(Long clubId, Long eventId, Long profId) {
        getMentoredClubOrThrow(clubId, profId);
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        if (!Objects.equals(event.getClub().getId(), clubId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Event does not belong to this club");
        }
        event.setStatus(EventStatus.DELETED);
        eventRepository.save(event);
        return new MessageResponseDto("Event rejected");
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getClubMembers(Long clubId, Long profId) {
        getMentoredClubOrThrow(clubId, profId);
        List<ClubMember> members = clubMemberRepository.findClubMemberByClub_Id(clubId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (ClubMember cm : members) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", cm.getId());
            map.put("role", cm.getRole() != null ? cm.getRole().name() : "MEMBER");
            map.put("joinedAt", cm.getJoinedAt());
            if (cm.getStudent() != null) {
                map.put("studentId", cm.getStudent().getId());
                map.put("fullName", cm.getStudent().getFullName());
                map.put("rollNumber", cm.getStudent().getStudentId());
                map.put("department", cm.getStudent().getDepartment());
                map.put("batchYear", cm.getStudent().getBatchYear());
                if (cm.getStudent().getUser() != null) {
                    map.put("email", cm.getStudent().getUser().getEmail());
                    map.put("gender", cm.getStudent().getUser().getGender() != null ? cm.getStudent().getUser().getGender().name() : null);
                    map.put("avatarUrl", cm.getStudent().getUser().getProfilePic());
                }
            }
            result.add(map);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getClubTeams(Long clubId, Long profId) {
        getMentoredClubOrThrow(clubId, profId);
        List<ClubTeam> teams = clubTeamRepository.findByClub_IdOrderByCreatedAtDesc(clubId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (ClubTeam team : teams) {
            Map<String, Object> teamMap = new HashMap<>();
            teamMap.put("id", team.getId());
            teamMap.put("name", team.getName());
            teamMap.put("description", team.getDescription());
            teamMap.put("createdAt", team.getCreatedAt());

            List<ClubTeamMember> teamMembers = clubTeamMemberRepository.findAllByTeam(team);
            teamMap.put("memberCount", teamMembers.size());

            List<Map<String, Object>> memberList = new ArrayList<>();
            for (ClubTeamMember tm : teamMembers) {
                Map<String, Object> mm = new HashMap<>();
                mm.put("teamRole", tm.getRole() != null ? tm.getRole().name() : "MEMBER");
                mm.put("joinedAt", tm.getJoinedAt());
                if (tm.getClubMember() != null && tm.getClubMember().getStudent() != null) {
                    mm.put("memberId", tm.getClubMember().getId());
                    mm.put("fullName", tm.getClubMember().getStudent().getFullName());
                    mm.put("rollNumber", tm.getClubMember().getStudent().getStudentId());
                    mm.put("department", tm.getClubMember().getStudent().getDepartment());
                    mm.put("batchYear", tm.getClubMember().getStudent().getBatchYear());
                    if (tm.getClubMember().getStudent().getUser() != null) {
                        mm.put("email", tm.getClubMember().getStudent().getUser().getEmail());
                        mm.put("avatarUrl", tm.getClubMember().getStudent().getUser().getProfilePic());
                    }
                }
                memberList.add(mm);
            }
            teamMap.put("members", memberList);
            result.add(teamMap);
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public ClubPermissionSettingsDto getSettings(Long clubId, Long profId) {
        Club club = getMentoredClubOrThrow(clubId, profId);
        ClubPermissionSettingsDto dto = new ClubPermissionSettingsDto();
        dto.setAnnouncementPermission(club.getAnnouncementPermission() != null ? club.getAnnouncementPermission() : "ADMIN_ONLY");
        dto.setEventPermission(club.getEventPermission() != null ? club.getEventPermission() : "ADMIN_ONLY");
        return dto;
    }

    @Override
    @Transactional
    public MessageResponseDto updateSettings(Long clubId, ClubPermissionSettingsDto request, Long profId) {
        Club club = getMentoredClubOrThrow(clubId, profId);
        if (request.getAnnouncementPermission() != null) {
            club.setAnnouncementPermission(request.getAnnouncementPermission().toUpperCase());
        }
        if (request.getEventPermission() != null) {
            club.setEventPermission(request.getEventPermission().toUpperCase());
        }
        clubRepository.save(club);
        return new MessageResponseDto("Club governance permissions updated successfully");
    }

    @Override
    @Transactional
    public MessageResponseDto deleteClubByMentor(Long clubId, Long profId) {
        Club club = getMentoredClubOrThrow(clubId, profId);
        clubRepository.delete(club);
        return new MessageResponseDto("Club successfully dissolved and deleted by mentor");
    }
}
