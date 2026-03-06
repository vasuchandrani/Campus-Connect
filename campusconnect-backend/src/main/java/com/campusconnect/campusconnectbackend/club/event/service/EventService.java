package com.campusconnect.campusconnectbackend.club.event.service;

import com.campusconnect.campusconnectbackend.integrations.cloudinary.service.CloudinaryService;
import com.campusconnect.campusconnectbackend.club.Club;
import com.campusconnect.campusconnectbackend.club.ClubService;
import com.campusconnect.campusconnectbackend.club.event.dto.req.EventRequestDto;
import com.campusconnect.campusconnectbackend.club.event.dto.req.EventSpeakerRequestDto;
import com.campusconnect.campusconnectbackend.club.event.dto.req.EventSponsorRequestDto;
import com.campusconnect.campusconnectbackend.club.event.dto.res.*;
import com.campusconnect.campusconnectbackend.club.event.entity.*;
import com.campusconnect.campusconnectbackend.club.event.repository.*;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
        // create response dto
        EventResponseDto dto = new EventResponseDto();
        // map the data
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

    // get events of club -(get DTO list)
    private List<EventResponseDto> getDtoList(List<Event> events) {
        // create response
        List<EventResponseDto> response = new ArrayList<>();

        for (Event event : events) {
            EventResponseDto dto = getDto(event);
            response.add(dto);
        }
        return response;
    }

    // get event sponsors list
    private List<EventSponsorResponseDto> getSponsors(Long eventId) {
        // find sponsors
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

    // get event speakers list
    private List<EventSpeakerResponseDto> getSpeakers(Long eventId) {
        // find speakers
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

    // get event winner list
    private List<EventWinnerResponseDto> getWinners(Long eventId) {
        // find all winners of event
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

    // get images of event
    private List<String> getImages(Long eventId) {
        // find images of event
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
            // create sponsor
            EventSponsor sponsor = new EventSponsor();
            sponsor.setName(s.getName());
            sponsor.setTagline(s.getTagline());
            sponsor.setEvent(event);
            // save in db
            eventSponsorRepository.save(sponsor);
        }
        return true;
    }

    // save speakers
    private boolean saveSpeakers(List<EventSpeakerRequestDto> speakers, Event event) {
        for (EventSpeakerRequestDto s : speakers) {
            // create speaker
            EventSpeaker speaker = new EventSpeaker();
            speaker.setName(s.getName());
            speaker.setTagline(s.getTagline());
            speaker.setEvent(event);
            // save in db
            eventSpeakerRepository.save(speaker);
        }
        return true;
    }

    // get all active events of college (live & upcoming)
    public List<EventResponseDto> getActiveEventsByCollege() {

        // find all clubs of college
        List<Club> clubs = clubService.getAllClubsByCollege();

        // find all live and upcoming events
        List<Event> events = eventRepository.findActiveEventsByCollege(clubs, LocalDateTime.now());

        return getDtoList(events);
    }

    // get all finished events of college
    public List<EventResponseDto> getFinishedEventsByCollege() {
        // find all clubs of college
        List<Club> clubs = clubService.getAllClubsByCollege();

        // find all finished events
        List<Event> events = eventRepository.findFinishedEventsByCollege(clubs, LocalDateTime.now());

        return getDtoList(events);
    }

    // get particular event
    public EventResponseDto getEvent(Long eventId) {
        // find event
        Event e = eventRepository.findEventById(eventId).orElseThrow(
                () -> new RuntimeException("Event with id " + eventId + " not found")
        );

        return getDto(e);
    }

    // get count of events by status
    public int getUpcomingEventsCountByCollege() {

        // get all clubs of college
        List<Club> clubs = clubService.getAllClubsByCollege();

        return eventRepository.countUpcomingEventsByClubs(clubs, LocalDateTime.now());
    }

    // get top events of college (live & upcoming)
    public List<EventResponseDto> getTopEvents() {
        // find all clubs of college
        List<Club> clubs = clubService.getAllClubsByCollege();

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
        String imageUrl = cloudinaryService.uploadImage(image, savedEvent.getId());
        // save in db
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
    public MessageResponseDto updateEvent(EventRequestDto request, Long eventId, MultipartFile image) {

        // get event
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (eventSponsorRepository.existsById(eventId)) {
            eventSponsorRepository.deleteAllByEvent_Id(eventId);
        }
        if (eventSpeakerRepository.existsById(eventId)) {
            eventSpeakerRepository.deleteAllByEvent_Id(eventId);
        }

        // update new image
        event.setImage(cloudinaryService.uploadImage(image, eventId));

        // update
        if(request.getTitle() != null) {
            event.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            event.setDescription(request.getDescription());
        }
        if (request.getStartTime() != null) {
            event.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            event.setEndTime(request.getEndTime());
        }
        if (request.getRegistrationEnd() != null) {
            event.setRegistrationEnd(request.getRegistrationEnd());
        }
        if (request.getLocation() != null) {
            event.setLocation(request.getLocation());
        }
        if (request.getSponsors() != null) {
            saveSponsors(request.getSponsors(), event);
        }
        if (request.getSpeakers() != null) {
            saveSpeakers(request.getSpeakers(), event);
        }

        // save in db
        eventRepository.save(event);
        return new MessageResponseDto("Event updated successfully");
    }

    // delete the event
    @Transactional
    public MessageResponseDto deleteEvent(Long eventId) {

        // find if exist
        if (!eventRepository.existsById(eventId)) {
            throw new RuntimeException("Event not found");
        }

        // delete
        eventRepository.deleteById(eventId);
        return new MessageResponseDto("Event deleted successfully");
    }

    // get all active events of club (live & upcoming)
    public List<EventResponseDto> getActiveEventsByClub(Long clubId) {

        // find all live and upcoming events
        List<Event> events = eventRepository.findActiveEventsByClub(clubId, LocalDateTime.now());

        return getDtoList(events);
    }

    // get all finished events of college
    public List<EventResponseDto> getFinishedEventsByClub(Long clubId) {

        // find all finished events
        List<Event> events = eventRepository.findFinishedEventsByClub(clubId, LocalDateTime.now());

        return getDtoList(events);
    }
}
