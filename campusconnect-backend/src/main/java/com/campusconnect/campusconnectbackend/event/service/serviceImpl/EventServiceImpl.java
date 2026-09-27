package com.campusconnect.campusconnectbackend.event.service.serviceImpl;

import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.service.ClubService;
import com.campusconnect.campusconnectbackend.college.service.CollegeService;
import com.campusconnect.campusconnectbackend.common.location.dto.LocationResponseDto;
import com.campusconnect.campusconnectbackend.common.location.entity.Location;
import com.campusconnect.campusconnectbackend.common.location.service.LocationService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventRegistrationPlanRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventSpeakerRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventSponsorRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.res.*;
import com.campusconnect.campusconnectbackend.event.entity.*;
import com.campusconnect.campusconnectbackend.event.entity.enums.EventHost;
import com.campusconnect.campusconnectbackend.event.entity.enums.EventRegistrationPayment;
import com.campusconnect.campusconnectbackend.event.entity.enums.EventStatus;
import com.campusconnect.campusconnectbackend.event.entity.enums.EventType;
import com.campusconnect.campusconnectbackend.event.repository.*;
import com.campusconnect.campusconnectbackend.event.service.EventService;
import com.campusconnect.campusconnectbackend.integrations.cloudinary.service.CloudinaryService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.cc_event.entity.CCEvent;
import com.campusconnect.campusconnectbackend.cc_event.entity.CCEventRegistration;
import com.campusconnect.campusconnectbackend.cc_event.entity.enums.CCEventRegistrationStatus;
import com.campusconnect.campusconnectbackend.cc_event.entity.enums.CCEventStatus;
import com.campusconnect.campusconnectbackend.cc_event.repository.CCEventRegistrationRepository;
import com.campusconnect.campusconnectbackend.cc_event.repository.CCEventRepository;
import com.campusconnect.campusconnectbackend.user.entity.User;
import com.campusconnect.campusconnectbackend.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventRegistrationPlanRepository eventRegistrationPlanRepository;
    private final ClubService clubService;
    private final CollegeService collegeService;
    private final AuthService authService;
    private final LocationService locationService;
    private final EventImagesRepository eventImagesRepository;
    private final EventSponsorRepository eventSponsorRepository;
    private final EventSpeakerRepository eventSpeakerRepository;
    private final EventWinnerRepository eventWinnerRepository;
    private final CloudinaryService cloudinaryService;
    private final CCEventRepository ccEventRepository;
    private final CCEventRegistrationRepository ccEventRegistrationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final com.campusconnect.campusconnectbackend.college.repository.DepartmentRepository departmentRepository;

    // ─── Helpers ──────────────────────────────────────────────────────

    private boolean isRegistered(Long eventId) {
        Long studentId = authService.getCurrentUserId();
        return eventRegistrationRepository.existsByEvent_IdAndStudent_Id(eventId, studentId);
    }

    private int registrations(Long eventId) {
        return eventRegistrationRepository.countByEvent_Id(eventId);
    }

    /**
     * Convert an Event entity to the full EventResponseDto.
     * Now maps ALL fields from the expanded schema.
     */
    private EventResponseDto getDto(Event event) {
        EventResponseDto dto = new EventResponseDto();
        if (event == null) return dto;

        // Core fields
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setImage(event.getCoverImage());

        // Type and hosting
        dto.setEventType(event.getEventType() != null ? event.getEventType().name() : null);
        dto.setHostedBy(event.getHostedBy() != null ? event.getHostedBy().name() : null);
        dto.setPublic(event.isPublic());

        // Payment
        dto.setRegistrationPayment(event.getRegistrationPayment() != null ? event.getRegistrationPayment().name() : null);

        // Timing
        dto.setRegistrationStart(event.getRegistrationStart());
        dto.setStartTime(event.getStartTime());
        dto.setEndTime(event.getEndTime());
        dto.setRegistrationEnd(event.getRegistrationEnd());

        // Location — backward-compatible string + full object
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

        // Club info
        if (event.getClub() != null) {
            dto.setClubName(event.getClub().getName());
        }

        // Timestamps
        dto.setCreateAt(event.getCreatedAt());

        // Registration status
        boolean isRegister = isRegistered(event.getId());
        dto.setRegister(isRegister);
        dto.setRegistrationsCount(registrations(event.getId()));

        // Approval and status
        dto.setState(event.getState());
        dto.setStatus(event.getStatus() != null ? event.getStatus().name() : null);

        // Target audience
        if (event.getDepartment() != null) {
            dto.setDepartmentId(event.getDepartment().getId());
            dto.setDepartmentName(event.getDepartment().getName());
        }
        dto.setBatchYear(event.getBatchYear());
        dto.setCriteria(event.getCriteria());
        dto.setEligibility(event.getEligibility());

        // Prize and participation
        dto.setPrizeMoney(event.getPrizeMoney());
        dto.setParticipation(event.getParticipation());

        // Overview
        dto.setOverview(event.getOverview());

        // Dynamic registration fields
        dto.setSelectedRegistrationFields(event.getSelectedRegistrationFields());
        dto.setCustomRegistrationFields(event.getCustomRegistrationFields());

        // Related entities
        dto.setSponsors(getSponsors(event.getId()));
        dto.setSpeakers(getSpeakers(event.getId()));
        dto.setWinners(getWinners(event.getId()));
        dto.setImages(getImages(event.getId()));
        dto.setRegistrationPlans(getRegistrationPlans(event.getId()));

        // Global flag based on state
        dto.setGlobal(event.getState() >= 4);

        // Created by
        if (event.getCreatedBy() != null) {
            dto.setCreatedById(event.getCreatedBy().getId());
            dto.setCreatedByName(event.getCreatedBy().getEmail());
        }

        return dto;
    }

    private List<EventResponseDto> getDtoList(List<Event> events) {
        List<EventResponseDto> response = new ArrayList<>();
        if (events != null) {
            for (Event event : events) {
                response.add(getDto(event));
            }
        }
        return response;
    }

    private List<EventSponsorResponseDto> getSponsors(Long eventId) {
        List<EventSponsor> sponsors = eventSponsorRepository.findAllByEvent_Id(eventId);
        List<EventSponsorResponseDto> response = new ArrayList<>();
        for (EventSponsor sponsor : sponsors) {
            EventSponsorResponseDto dto = new EventSponsorResponseDto();
            dto.setId(sponsor.getId());
            dto.setName(sponsor.getName());
            dto.setTagline(sponsor.getDescription());
            response.add(dto);
        }
        return response;
    }

    private List<EventSpeakerResponseDto> getSpeakers(Long eventId) {
        List<EventSpeaker> speakers = eventSpeakerRepository.findAllByEvent_Id(eventId);
        List<EventSpeakerResponseDto> response = new ArrayList<>();
        for (EventSpeaker speaker : speakers) {
            EventSpeakerResponseDto dto = new EventSpeakerResponseDto();
            dto.setId(speaker.getId());
            dto.setName(speaker.getName());
            dto.setTagline(speaker.getDescription());
            dto.setEmail(speaker.getEmail());
            response.add(dto);
        }
        return response;
    }

    private List<EventWinnerResponseDto> getWinners(Long eventId) {
        List<EventWinner> winnerList = eventWinnerRepository.findAllByEvent_Id(eventId);
        List<EventWinnerResponseDto> winners = new ArrayList<>();
        for (EventWinner winner : winnerList) {
            EventWinnerResponseDto dto = new EventWinnerResponseDto();
            dto.setId(winner.getId());
            dto.setName(winner.getName());
            dto.setPrize(winner.getPrize());
            if (winner.getEvent() != null) {
                dto.setEventId(winner.getEvent().getId());
            }
            winners.add(dto);
        }
        return winners;
    }

    private List<String> getImages(Long eventId) {
        List<EventImages> images = eventImagesRepository.findAllByEvent_Id(eventId);
        List<String> imageUrls = new ArrayList<>();
        for (EventImages img : images) {
            imageUrls.add(img.getImageUrl());
        }
        return imageUrls;
    }

    private List<EventRegistrationPlanResponseDto> getRegistrationPlans(Long eventId) {
        List<EventRegistrationPlan> plans = eventRegistrationPlanRepository.findAllByEvent_Id(eventId);
        List<EventRegistrationPlanResponseDto> response = new ArrayList<>();
        for (EventRegistrationPlan plan : plans) {
            EventRegistrationPlanResponseDto dto = new EventRegistrationPlanResponseDto();
            dto.setId(plan.getId());
            dto.setPlanName(plan.getPlanName());
            dto.setPlanDescription(plan.getPlanDescription());
            dto.setAmount(plan.getAmount());
            dto.setMaxSeats(plan.getMaxSeats());
            // Count registrations for this plan
            dto.setCurrentRegistrations(
                    eventRegistrationRepository.countByEventRegistrationPlan_Id(plan.getId())
            );
            response.add(dto);
        }
        return response;
    }

    private boolean saveSponsors(List<EventSponsorRequestDto> sponsors, Event event) {
        if (sponsors == null) return true;
        for (EventSponsorRequestDto s : sponsors) {
            EventSponsor sponsor = new EventSponsor();
            sponsor.setName(s.getName());
            sponsor.setDescription(s.getTagline());
            sponsor.setEvent(event);
            eventSponsorRepository.save(sponsor);
        }
        return true;
    }

    private boolean saveSpeakers(List<EventSpeakerRequestDto> speakers, Event event) {
        if (speakers == null) return true;
        for (EventSpeakerRequestDto s : speakers) {
            EventSpeaker speaker = new EventSpeaker();
            speaker.setName(s.getName());
            speaker.setDescription(s.getTagline());
            speaker.setEmail(s.getEmail());
            speaker.setEvent(event);
            eventSpeakerRepository.save(speaker);
        }
        return true;
    }

    private void saveRegistrationPlans(List<EventRegistrationPlanRequestDto> plans, Event event) {
        if (plans == null || plans.isEmpty()) return;
        for (EventRegistrationPlanRequestDto p : plans) {
            EventRegistrationPlan plan = new EventRegistrationPlan();
            plan.setPlanName(p.getPlanName());
            plan.setPlanDescription(p.getPlanDescription());
            plan.setAmount(p.getAmount());
            plan.setMaxSeats(p.getMaxSeats());
            plan.setEvent(event);
            eventRegistrationPlanRepository.save(plan);
        }
    }

    /**
     * Populate all new fields on the event entity from the request DTO.
     */
    private void populateEventFromRequest(Event event, EventRequestDto request) {
        // Event type
        if (request.getEventType() != null) {
            event.setEventType(EventType.valueOf(request.getEventType()));
        }

        // Visibility
        event.setPublic(request.isPublic());

        // Payment type
        if (request.getRegistrationPayment() != null) {
            event.setRegistrationPayment(EventRegistrationPayment.valueOf(request.getRegistrationPayment()));
        }

        // Registration window
        if (request.getRegistrationStart() != null) {
            event.setRegistrationStart(request.getRegistrationStart());
        }

        // Location — create or find Location entity
        if (request.getLocation() != null) {
            Location location = locationService.findOrCreateLocation(request.getLocation());
            event.setLocation(location);
        }

        // Target audience
        if (request.getDepartmentId() != null) {
            com.campusconnect.campusconnectbackend.college.entity.Department dept =
                    departmentRepository.findById(request.getDepartmentId()).orElse(null);
            event.setDepartment(dept);
        }
        event.setBatchYear(request.getBatchYear());
        event.setCriteria(request.getCriteria());
        event.setEligibility(request.getEligibility());

        // Prize
        event.setPrizeMoney(request.getPrizeMoney());

        // Dynamic registration fields (JSON)
        if (request.getSelectedRegistrationFields() != null) {
            event.setSelectedRegistrationFields(objectMapper.valueToTree(request.getSelectedRegistrationFields()));
        }
        if (request.getCustomRegistrationFields() != null) {
            event.setCustomRegistrationFields(objectMapper.valueToTree(request.getCustomRegistrationFields()));
        }
    }

    // ─── Public API ──────────────────────────────────────────────────

    @Override
    @Cacheable(value = "active_events", key = "'college_' + #collegeId", sync = true)
    public List<EventResponseDto> getActiveEventsByCollege(Long collegeId) {
        List<Club> clubs = clubService.getAllClubsByCollege(collegeId);
        List<Event> events = eventRepository.findActiveEventsByCollege(clubs, LocalDateTime.now());
        return getDtoList(events);
    }

    @Override
    @Cacheable(value = "finished_events", key = "'college_'+ #collegeId", sync = true)
    public List<EventResponseDto> getFinishedEventsByCollege(Long collegeId) {
        List<Club> clubs = clubService.getAllClubsByCollege(collegeId);
        List<Event> events = eventRepository.findFinishedEventsByCollege(clubs, LocalDateTime.now());
        return getDtoList(events);
    }

    @Override
    @Cacheable(value = "finished_event", key = "#eventId", sync = true)
    public EventResponseDto getEvent(Long eventId) {
        Event e = eventRepository.findEventById(eventId).orElseThrow(
                () -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event with id " + eventId + " not found")
        );
        return getDto(e);
    }

    @Override
    @Cacheable(value = "topActive_events", key = "'college_' + #collegeId", sync = true)
    public List<EventResponseDto> getTopEvents(Long collegeId) {
        List<Club> clubs = clubService.getAllClubsByCollege(collegeId);
        Pageable livePage = PageRequest.of(0, 5);
        List<Event> liveEvents = eventRepository.findLiveEvents(clubs, LocalDateTime.now(), livePage);
        List<EventResponseDto> response = new ArrayList<>();

        for (Event event : liveEvents) {
            response.add(getDto(event));
        }

        if (response.size() < 5) {
            int remaining = 5 - response.size();
            Pageable upcomingPage = PageRequest.of(0, remaining);
            List<Event> upcomingEvents = eventRepository.findUpcomingEvents(clubs, LocalDateTime.now(), upcomingPage);

            for (Event event : upcomingEvents) {
                response.add(getDto(event));
            }
        }
        return response;
    }

    @Override
    @Cacheable(value = "topActive_clubEvents", key = "#clubId", sync = true)
    public List<EventResponseDto> getTopEventsByClub(Long clubId) {
        Pageable livePage = PageRequest.of(0, 3);
        List<Event> liveEvents = eventRepository.findLiveEventsByClub(clubId, LocalDateTime.now(), livePage);
        List<EventResponseDto> response = new ArrayList<>();

        for (Event event : liveEvents) {
            response.add(getDto(event));
        }

        if (response.size() < 3) {
            int remaining = 3 - response.size();
            Pageable upcomingPage = PageRequest.of(0, remaining);
            List<Event> upcomingEvents = eventRepository.findUpcomingEventsByClub(clubId, LocalDateTime.now(), upcomingPage);

            for (Event event : upcomingEvents) {
                response.add(getDto(event));
            }
        }
        return response;
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "active_events", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "active_clubEvents", key = "#clubId"),
            @CacheEvict(value = "topActive_events", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "topActive_clubEvents", key = "#clubId")
    })
    public MessageResponseDto createEvent(EventRequestDto request, Long clubId, MultipartFile image) {
        Club club = clubService.getClubById(clubId);

        Event event = new Event();

        // Required fields from schema
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setRegistrationEnd(request.getRegistrationEnd());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());

        // Set college from auth context — NOT NULL in DB
        event.setCollege(collegeService.getCollegeById(authService.getCurrentCollegeId()));

        // Set club
        event.setClub(club);

        // Set created by — NOT NULL in DB
        event.setCreatedBy(authService.getCurrentUser());

        // Set status — NOT NULL in DB
        event.setStatus(EventStatus.PUBLISHED);

        // Set hosted by — defaults to CLUB for club-created events
        event.setHostedBy(EventHost.CLUB);

        // Set registration start (defaults to now if not provided)
        event.setRegistrationStart(
                request.getRegistrationStart() != null ? request.getRegistrationStart() : LocalDateTime.now()
        );

        // Populate all new fields from DTO
        populateEventFromRequest(event, request);

        // Determine state based on creator role
        String role = authService.getCurrentRole();
        if ("CLUB_ADMIN".equals(role)) {
            event.setState(1); // created by club-admin
        } else if ("PROFESSOR".equals(role)) {
            event.setState(2); // created by mentor
        } else {
            event.setState(0); // created by club-member
        }

        // Save event first to get ID for image path and related entities
        Event savedEvent = eventRepository.save(event);

        // Upload cover image
        if (image != null && !image.isEmpty()) {
            String path = "clubs/" + clubId + "/events/" + savedEvent.getId();
            String imageUrl = cloudinaryService.uploadImage(image, path);
            savedEvent.setCoverImage(imageUrl);
            eventRepository.save(savedEvent);
        }

        // Save related entities
        saveSponsors(request.getSponsors(), savedEvent);
        saveSpeakers(request.getSpeakers(), savedEvent);
        saveRegistrationPlans(request.getRegistrationPlans(), savedEvent);

        return new MessageResponseDto("Event created successfully");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "active_events", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "topActive_events", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "topActive_clubEvents", key = "#clubId"),
            @CacheEvict(value = "active_clubEvents", key = "#clubId"),
            @CacheEvict(value = "finished_clubEvents", key = "#clubId")
    })
    public MessageResponseDto updateEvent(EventRequestDto request, Long eventId, Long clubId, MultipartFile image) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));

        // Clear and re-save sponsors/speakers/plans
        if (eventSponsorRepository.existsByEvent_Id(eventId)) {
            eventSponsorRepository.deleteAllByEvent_Id(eventId);
        }
        if (eventSpeakerRepository.existsByEvent_Id(eventId)) {
            eventSpeakerRepository.deleteAllByEvent_Id(eventId);
        }
        if (eventRegistrationPlanRepository.existsByEvent_Id(eventId)) {
            eventRegistrationPlanRepository.deleteAllByEvent_Id(eventId);
        }

        // Upload new image if provided
        if (image != null && !image.isEmpty()) {
            String path = "clubs/" + clubId + "/events/" + eventId;
            event.setCoverImage(cloudinaryService.uploadImage(image, path));
        }

        // Core fields
        if (request.getTitle() != null) event.setTitle(request.getTitle());
        if (request.getDescription() != null) event.setDescription(request.getDescription());

        // Timing validation and update
        LocalDateTime startTime = request.getStartTime() != null ? request.getStartTime() : event.getStartTime();
        LocalDateTime endTime = request.getEndTime() != null ? request.getEndTime() : event.getEndTime();

        if (startTime != null && startTime.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time cannot be in the past");
        }
        if (startTime != null && endTime != null && !startTime.isBefore(endTime)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start time must be before end time");
        }
        if (request.getStartTime() != null) event.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) event.setEndTime(request.getEndTime());

        LocalDateTime registrationEnd = request.getRegistrationEnd() != null ? request.getRegistrationEnd() : event.getRegistrationEnd();
        if (registrationEnd != null && registrationEnd.isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration end cannot be in the past");
        }
        if (request.getRegistrationEnd() != null) event.setRegistrationEnd(request.getRegistrationEnd());

        // Populate all expanded fields
        populateEventFromRequest(event, request);

        // Re-save related entities
        if (request.getSponsors() != null) saveSponsors(request.getSponsors(), event);
        if (request.getSpeakers() != null) saveSpeakers(request.getSpeakers(), event);
        if (request.getRegistrationPlans() != null) saveRegistrationPlans(request.getRegistrationPlans(), event);

        eventRepository.save(event);
        return new MessageResponseDto("Event updated successfully");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "active_events", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "finished_events", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "topActive_events", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "topActive_clubEvents", key = "#clubId"),
            @CacheEvict(value = "active_clubEvents", key = "#clubId")
    })
    public MessageResponseDto deleteEvent(Long eventId, Long clubId) {
        if (!eventRepository.existsById(eventId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        }
        eventRepository.deleteById(eventId);
        return new MessageResponseDto("Event deleted successfully");
    }

    @Override
    @Cacheable(value = "active_clubEvents", key = "#clubId", sync = true)
    public List<EventResponseDto> getActiveEventsByClub(Long clubId) {
        List<Event> events = eventRepository.findActiveEventsByClub(clubId, LocalDateTime.now());
        return getDtoList(events);
    }

    @Override
    @Cacheable(value = "finished_clubEvents", key = "#clubId", sync = true)
    public List<EventResponseDto> getFinishedEventsByClub(Long clubId) {
        List<Event> events = eventRepository.findFinishedEventsByClub(clubId, LocalDateTime.now());
        return getDtoList(events);
    }

    @Override
    public List<EventResponseDto> getGlobalEvents() {
        List<CCEvent> globalEvents = ccEventRepository.findAllByStatusOrderByStartTimeAsc(CCEventStatus.PUBLISHED);
        List<EventResponseDto> dtoList = new ArrayList<>();
        Long userId = null;
        try {
            userId = authService.getCurrentUserId();
        } catch (Exception ignored) {}

        for (CCEvent ce : globalEvents) {
            EventResponseDto dto = new EventResponseDto();
            dto.setId(ce.getId());
            dto.setTitle(ce.getTitle());
            dto.setDescription(ce.getDescription());
            dto.setImage(ce.getCoverImage());
            dto.setStartTime(ce.getStartTime());
            dto.setEndTime(ce.getEndTime());
            dto.setRegistrationEnd(ce.getRegistrationEnd());
            dto.setClubName(ce.getHostedBy() != null ? ce.getHostedBy() : "CampusConnect Global");
            dto.setCreateAt(ce.getCreatedAt());
            dto.setOverview(ce.getOverview());
            dto.setGlobal(true);
            dto.setRegistrationsCount((int) ccEventRegistrationRepository.countByEventId(ce.getId()));
            if (userId != null) {
                dto.setRegister(ccEventRegistrationRepository.existsByEventIdAndUserId(ce.getId(), userId));
            }
            dtoList.add(dto);
        }
        return dtoList;
    }

    @Override
    @Transactional
    public MessageResponseDto registerGlobalEvent(Long eventId, Long userId) {
        if (ccEventRegistrationRepository.existsByEventIdAndUserId(eventId, userId)) {
            return new MessageResponseDto("Already registered for this global event");
        }
        CCEvent event = ccEventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Global event not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        CCEventRegistration reg = new CCEventRegistration();
        reg.setEvent(event);
        reg.setUser(user);
        reg.setStatus(CCEventRegistrationStatus.REGISTERED);
        ccEventRegistrationRepository.save(reg);
        return new MessageResponseDto("Successfully registered for global event");
    }

    @Override
    @Transactional
    public MessageResponseDto unregisterGlobalEvent(Long eventId, Long userId) {
        CCEventRegistration reg = ccEventRegistrationRepository.findByEventIdAndUserId(eventId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found"));
        ccEventRegistrationRepository.delete(reg);
        return new MessageResponseDto("Successfully unregistered from global event");
    }
}
