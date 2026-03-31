package com.campusconnect.campusconnectbackend.event.service;

import com.campusconnect.campusconnectbackend.event.dto.res.EventResponseDto;
import com.campusconnect.campusconnectbackend.event.dto.res.EventSpeakerResponseDto;
import com.campusconnect.campusconnectbackend.event.dto.res.EventSponsorResponseDto;
import com.campusconnect.campusconnectbackend.event.dto.res.EventWinnerResponseDto;
import com.campusconnect.campusconnectbackend.event.entity.*;
import com.campusconnect.campusconnectbackend.event.repository.*;
import com.campusconnect.campusconnectbackend.integrations.cloudinary.service.CloudinaryService;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.service.ClubService;
import com.campusconnect.campusconnectbackend.event.dto.req.EventRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventSpeakerRequestDto;
import com.campusconnect.campusconnectbackend.event.dto.req.EventSponsorRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;

import lombok.RequiredArgsConstructor;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final ClubService clubService;
    private final AuthService authService;
    private final EventImagesRepository eventImagesRepository;
    private final EventSponsorRepository eventSponsorRepository;
    private final EventSpeakerRepository eventSpeakerRepository;
    private final EventWinnerRepository eventWinnerRepository;
    private final CloudinaryService cloudinaryService;

    // check is student registered?
    private boolean isRegistered(Long eventId){
        Long studentId = authService.getCurrentUserId();
        return eventRegistrationRepository
                .existsByEvent_IdAndStudent_Id(eventId, studentId);
    }

    // get registrations of an event
    private int registrations(Long eventId){
        return eventRegistrationRepository.countByEvent_Id(eventId);
    }

    // get DTO
    private EventResponseDto getDto(Event event) {
        EventResponseDto dto = new EventResponseDto();
        if (event == null) return dto;

        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDescription(event.getDescription());
        dto.setClubName(event.getClub().getName());
        dto.setStartTime(event.getStartTime());
        dto.setEndTime(event.getEndTime());
        dto.setLocation(event.getLocation());
        dto.setImage(event.getImage());
        dto.setRegistrationEnd(event.getRegistrationEnd());

        boolean isRegister = isRegistered(event.getId());
        dto.setRegister(isRegister);

        dto.setCreateAt(event.getCreatedAt());
        dto.setRegistrationsCount(registrations(event.getId()));

        dto.setSponsors(getSponsors(event.getId()));
        dto.setSpeakers(getSpeakers(event.getId()));
        dto.setWinners(getWinners(event.getId()));
        dto.setImages(getImages(event.getId()));
        dto.setOverview(event.getOverview());

        return dto;
    }

    // get DTO -list
    private List<EventResponseDto> getDtoList(List<Event> events) {
        List<EventResponseDto> response = new ArrayList<>();

        for (Event event : events) {
            EventResponseDto dto = getDto(event);
            response.add(dto);
        }
        return response;
    }

    // get sponsors DTO -list
    private List<EventSponsorResponseDto> getSponsors(Long eventId) {

        List<EventSponsor> sponsors = eventSponsorRepository.findAllByEvent_Id(eventId);
        List<EventSponsorResponseDto> response = new ArrayList<>();

        for (EventSponsor sponsor : sponsors) {
            EventSponsorResponseDto dto = new EventSponsorResponseDto();
            dto.setId(sponsor.getId());
            dto.setName(sponsor.getName());
            dto.setTagline(sponsor.getTagline());
            response.add(dto);
        }
        return response;
    }

    // get speakers DTO -list
    private List<EventSpeakerResponseDto> getSpeakers(Long eventId) {

        List<EventSpeaker> speakers = eventSpeakerRepository.findAllByEvent_Id(eventId);
        List<EventSpeakerResponseDto> response = new ArrayList<>();

        for (EventSpeaker speaker : speakers) {
            EventSpeakerResponseDto dto = new EventSpeakerResponseDto();
            dto.setId(speaker.getId());
            dto.setName(speaker.getName());
            dto.setTagline(speaker.getTagline());
            dto.setEmail(speaker.getEmail());
            response.add(dto);
        }
        return response;
    }

    // get winner DTO -list
    private List<EventWinnerResponseDto> getWinners(Long eventId) {

        List<EventWinner> winnerList = eventWinnerRepository.findAllByEvent_Id(eventId);
        List<EventWinnerResponseDto> winners = new ArrayList<>();

        for (EventWinner winner : winnerList) {
            EventWinnerResponseDto dto = new EventWinnerResponseDto();
            dto.setId(winner.getId());
            dto.setName(winner.getName());
            dto.setEmail(winner.getEmail());
            dto.setEventId(winner.getEvent().getId());
            winners.add(dto);
        }
        return winners;
    }

    // get images DTO -list
    private List<String> getImages(Long eventId) {

        List<EventImages> images = eventImagesRepository.findAllByEvent_Id(eventId);
        List<String> imageUrls = new ArrayList<>();

        for (EventImages img : images) {
            imageUrls.add(img.getImageUrl());
        }

        return imageUrls;
    }

    // save sponsors
    private boolean saveSponsors(List<EventSponsorRequestDto> sponsors, Event event) {
        for (EventSponsorRequestDto s : sponsors) {

            EventSponsor sponsor = new EventSponsor();
            sponsor.setName(s.getName());
            sponsor.setTagline(s.getTagline());
            sponsor.setEvent(event);

            eventSponsorRepository.save(sponsor);
        }
        return true;
    }

    // save speakers
    private boolean saveSpeakers(List<EventSpeakerRequestDto> speakers, Event event) {
        for (EventSpeakerRequestDto s : speakers) {

            EventSpeaker speaker = new EventSpeaker();
            speaker.setName(s.getName());
            speaker.setTagline(s.getTagline());
            speaker.setEvent(event);

            eventSpeakerRepository.save(speaker);
        }
        return true;
    }

    // get all active events of college (live & upcoming)
    @Cacheable(value = "active_events", key = "'college_' + #collegeId", sync = true)
    public List<EventResponseDto> getActiveEventsByCollege(Long collegeId) {

        List<Club> clubs = clubService.getAllClubsByCollege(collegeId);

        List<Event> events = eventRepository.findActiveEventsByCollege(clubs, LocalDateTime.now());

        return getDtoList(events);
    }

    // get all finished events of college
    @Cacheable(value = "finished_events", key = "'college_'+ #collegeId", sync = true)
    public List<EventResponseDto> getFinishedEventsByCollege(Long collegeId) {

        List<Club> clubs = clubService.getAllClubsByCollege(collegeId);

        List<Event> events = eventRepository.findFinishedEventsByCollege(clubs, LocalDateTime.now());

        return getDtoList(events);
    }

    // get particular event
    @Cacheable(value = "event", key = "#eventId", sync = true)
    public EventResponseDto getEvent(Long eventId) {

        Event e = eventRepository.findEventById(eventId).orElseThrow(
                () -> new RuntimeException("Event with id " + eventId + " not found")
        );

        return getDto(e);
    }

    // get top events of college (live & upcoming)
    @Cacheable(value = "topActive_events", key = "'college_' + #collegeId", sync = true)
    public List<EventResponseDto> getTopEvents(Long collegeId) {
        // find all clubs of college
        List<Club> clubs = clubService.getAllClubsByCollege(collegeId);

        // find live events
        Pageable livePage = PageRequest.of(0, 3);
        List<Event> liveEvents = eventRepository.findLiveEvents(clubs, LocalDateTime.now(),livePage);
        List<EventResponseDto> response = new ArrayList<>();

        for (Event event : liveEvents) {
            EventResponseDto dto = getDto(event);
            response.add(dto);
        }

        if (response.size() < 3) {
            int remaining = 3 - response.size();

            // find upcoming events
            Pageable upcomingPage = PageRequest.of(0, remaining);
            List<Event> upcomingEvents = eventRepository.findUpcomingEvents(clubs, LocalDateTime.now(),upcomingPage);

            for (Event event : upcomingEvents) {
                EventResponseDto dto = getDto(event);
                response.add(dto);
            }
        }

        return response;
    }

    /* CLub-Member */

    // get top events of club (live & upcoming)
    @Cacheable(value = "topActive_clubEvents", key = "#clubId", sync = true)
    public List<EventResponseDto> getTopEventsByClub(Long clubId) {
        // find live events
        Pageable livePage = PageRequest.of(0, 3);
        List<Event> liveEvents = eventRepository.findLiveEventsByClub(clubId, LocalDateTime.now(),livePage);

        List<EventResponseDto> response = new ArrayList<>();

        for (Event event : liveEvents) {
            EventResponseDto dto = getDto(event);
            response.add(dto);
        }

        if (response.size() < 3) {
            int remaining = 3 - response.size();

            // find upcoming events
            Pageable upcomingPage = PageRequest.of(0, remaining);
            List<Event> upcomingEvents = eventRepository.findUpcomingEventsByClub(clubId, LocalDateTime.now(),upcomingPage);

            for (Event event : upcomingEvents) {
                EventResponseDto dto = getDto(event);
                response.add(dto);
            }
        }

        return response;
    }

    // create new events
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "active_events", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "active_clubEvents", key = "#clubId"),
            @CacheEvict(value = "topActive_events", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "topActive_clubEvents", key = "#clubId")
    })
    public MessageResponseDto createEvent(EventRequestDto request, Long clubId, MultipartFile image) {

        // create event
        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setRegistrationEnd(request.getRegistrationEnd());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setLocation(request.getLocation());
        event.setClub(clubService.getClubById(clubId));

        // save in db
        Event savedEvent = eventRepository.save(event);

        // upload image to cloudinary
        String path = "clubs/" + clubId + "/events/" + savedEvent.getId();
        String imageUrl = cloudinaryService.uploadImage(image, path);

        savedEvent.setImage(imageUrl);
        eventRepository.save(savedEvent);

        // save sponsors
        boolean sponsorsSaved = saveSponsors(request.getSponsors(), event);

        // save speakers
        boolean speakersSaved = saveSpeakers(request.getSpeakers(), event);

        if (!sponsorsSaved || !speakersSaved) {
            throw new RuntimeException("Sponsors and speakers are not saved");
        }

        return new  MessageResponseDto("Event created successfully");
    }

    // modify the event
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "active_events", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "topActive_events", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "topActive_clubEvents", key = "#clubId"),
            @CacheEvict(value = "active_clubEvents", key = "#clubId"),
            @CacheEvict(value = "finished_clubEvents", key = "#clubId")
    })
    public MessageResponseDto updateEvent(EventRequestDto request, Long eventId, Long clubId, MultipartFile image) {

        // get event
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (eventSponsorRepository.existsByEvent_Id(eventId)) {
            eventSponsorRepository.deleteAllByEvent_Id(eventId);
        }
        if (eventSpeakerRepository.existsByEvent_Id(eventId)) {
            eventSpeakerRepository.deleteAllByEvent_Id(eventId);
        }

        // update new image
        if (image != null && !image.isEmpty()) {
            String path = "clubs/" + clubId + "/events/" + eventId;
            event.setImage(cloudinaryService.uploadImage(image, path));
        }

        if(request.getTitle() != null) event.setTitle(request.getTitle());
        if(request.getDescription() != null) event.setDescription(request.getDescription());

        LocalDateTime startTime = request.getStartTime() != null
                ? request.getStartTime()
                : event.getStartTime();
        LocalDateTime endTime = request.getEndTime() != null
                ? request.getEndTime()
                : event.getEndTime();

        if (startTime != null && startTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Start time cannot be in the past");
        }
        if (startTime != null && endTime != null && !startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
        if (request.getStartTime() != null) event.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) event.setEndTime(request.getEndTime());

        LocalDateTime registrationEnd =  request.getRegistrationEnd() != null
                ? request.getRegistrationEnd()
                : event.getRegistrationEnd();

        if (registrationEnd != null &&  registrationEnd.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Registration end cannot be in the past");
        }
        if(request.getRegistrationEnd() != null) event.setRegistrationEnd(request.getRegistrationEnd());

        if(request.getLocation() != null) event.setLocation(request.getLocation());

        if(request.getSponsors() != null) saveSponsors(request.getSponsors(), event);
        if(request.getSpeakers() != null) saveSpeakers(request.getSpeakers(), event);

        eventRepository.save(event);

        return new MessageResponseDto("Event updated successfully");
    }

    // delete the event
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "active_events", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "finished_events", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "topActive_events", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "topActive_clubEvents", key = "#clubId"),
            @CacheEvict(value = "active_clubEvents", key = "#clubId")
    })
    public MessageResponseDto deleteEvent(Long eventId, Long clubId) {

        // find if exist
        if (!eventRepository.existsById(eventId)) {
            throw new RuntimeException("Event not found");
        }

        // delete
        eventRepository.deleteById(eventId);
        return new MessageResponseDto("Event deleted successfully");
    }

    // get all active events of club (live & upcoming)
    @Cacheable(value = "active_clubEvents", key = "#clubId", sync = true)
    public List<EventResponseDto> getActiveEventsByClub(Long clubId) {

        // find all live and upcoming events
        List<Event> events = eventRepository.findActiveEventsByClub(clubId, LocalDateTime.now());

        return getDtoList(events);
    }

    // get all finished events of college
    @Cacheable(value = "finished_clubEvents", key = "#clubId", sync = true)
    public List<EventResponseDto> getFinishedEventsByClub(Long clubId) {

        // find all finished events
        List<Event> events = eventRepository.findFinishedEventsByClub(clubId, LocalDateTime.now());

        return getDtoList(events);
    }
}
