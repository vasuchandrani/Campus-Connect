package com.campusconnect.campusconnectbackend.club.event.service;

import com.campusconnect.campusconnectbackend.club.Club;
import com.campusconnect.campusconnectbackend.club.ClubService;
import com.campusconnect.campusconnectbackend.club.event.dto.req.EventRequestDto;
import com.campusconnect.campusconnectbackend.club.event.dto.req.EventSpeakerRequestDto;
import com.campusconnect.campusconnectbackend.club.event.dto.req.EventSponsorRequestDto;
import com.campusconnect.campusconnectbackend.club.event.dto.res.*;
import com.campusconnect.campusconnectbackend.club.event.entity.*;
import com.campusconnect.campusconnectbackend.club.event.repository.*;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

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

    // check is student registered?
    private boolean isRegistered(Long eventId){
        Long studentId = authService.getCurrentUserId();
        return eventRegistrationRepository
                .existsByEvent_IdAndStudent_Id(eventId, studentId);
    }

    // is registration open?
    private boolean isRegistrationOpen(Event event) {
        return !event.getRegistrationEnd().isBefore(LocalDateTime.now()); // registration closed
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
        dto.setClubName(event.getClub().getName());
        dto.setId(event.getId());
        dto.setEventDate(event.getEventDate());
        dto.setEndDate(event.getEndDate());
        dto.setLocation(event.getLocation());
        dto.setDescription(event.getDescription());
        dto.setTitle(event.getTitle());
        dto.setImage(event.getImage());
        dto.setRegistrationEnd(event.getRegistrationEnd());

        boolean isRegistrationOpen = isRegistrationOpen(event);
        dto.setRegistrationOpen(isRegistrationOpen);

        boolean isRegister = isRegistered(event.getId());
        dto.setRegister(isRegister);

        dto.setStatus(event.getStatus());
        dto.setCreateAt(event.getCreatedAt());
        dto.setRegistrationsCount(registrations(event.getId()));

        dto.setSponsors(getSponsors(event.getId()));
        dto.setSpeakers(getSpeakers(event.getId()));
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

    // save sponsors
    private boolean saveSponsors(List<EventSponsorRequestDto> sponsors, Event event) {
        try {
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
        catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    // save speakers
    private boolean saveSpeakers(List<EventSpeakerRequestDto> speakers, Event event) {
        try {
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
        catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    // get all active events of college (live & upcoming)
    public List<EventResponseDto> getActiveEventsByCollege() {

        // find all clubs of college
        List<Club> clubs = clubService.getAllClubsByCollege();
        List<String> statuses = List.of("UPCOMING", "LIVE");

        // find all live and upcoming events
        List<Event> events = eventRepository.findByStatusInAndClubIn(statuses, clubs);

        return getDtoList(events);
    }

    // get all finished events of college
    public List<EventResponseDto> getFinishedEventsByCollege() {
        // find all clubs of college
        List<Club> clubs = clubService.getAllClubsByCollege();
        List<String> statuses = List.of("FINISHED");

        // find all finished events
        List<Event> events = eventRepository.findByStatusInAndClubIn(statuses, clubs);

        return getDtoList(events);
    }

    // get particular active event
    public EventResponseDto getEvent(Long eventId) {
        // find event
        Event e = eventRepository.findEventById(eventId).orElseThrow(
                () -> new RuntimeException("Event with id " + eventId + " not found")
        );

        return getDto(e);
    }

    // get finished event details
    public EventDetailsResponseDto getEventDetails(Long eventId) {
        // find event
        Event event = eventRepository.findEventById(eventId).orElseThrow(
                () -> new RuntimeException("Event with id " + eventId + " not found")
        );

        // find images of event
        List<EventImages> images = eventImagesRepository.findAllByEvent_Id(eventId);
        List<String> imageUrls = new ArrayList<>();
        for (EventImages img : images) {
            imageUrls.add(img.getImageUrl());
        }

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

        // fins all sponsors of event
        List<EventSponsorResponseDto> sponsors = getSponsors(eventId);

        // find all speakers of event
        List<EventSpeakerResponseDto> speakers = getSpeakers(eventId);

        // create response
        EventDetailsResponseDto response = new EventDetailsResponseDto();
        // map all data
        response.setId(event.getId());
        response.setImage(event.getImage());
        response.setTitle(event.getTitle());
        response.setClubName(event.getClub().getName());
        response.setDescription(event.getDescription());
        response.setEventDate(event.getEventDate());
        response.setEndDate(event.getEndDate());
        response.setLocation(event.getLocation());
        response.setStatus(event.getStatus());
        response.setRegistrationsCount(registrations(eventId));
        response.setOverview(event.getOverview());
        response.setImages(imageUrls);
        response.setSponsors(sponsors);
        response.setSpeakers(speakers);
        response.setWinners(winners);

        return response;
    }

    // get count of events by status
    public int getEventsCountByStatus(String status) {

        // get all clubs of college
        List<Club> clubs = clubService.getAllClubsByCollege();

        return eventRepository.countEventsByClubsAndStatus(clubs, status);
    }

    // get top events of college (live & upcoming)
    public List<EventResponseDto> getTopEvents() {
        // find all clubs of college
        List<Club> clubs = clubService.getAllClubsByCollege();

        // find live events
        Pageable livePage = PageRequest.of(0, 3);
        List<Event> liveEvents = eventRepository.findLiveEvents(clubs, livePage);
        List<EventResponseDto> response = new ArrayList<>();

        for (Event event : liveEvents) {
            EventResponseDto dto = getDto(event);
            response.add(dto);
        }

        if (response.size() < 3) {
            int remaining = 3 - response.size();

            // find upcoming events
            Pageable upcomingPage = PageRequest.of(0, remaining);
            List<Event> upcomingEvents = eventRepository.findUpcomingEvents(clubs, upcomingPage);

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
        List<Event> liveEvents = eventRepository.findLiveEventsByClub(clubId, livePage);
        List<EventResponseDto> response = new ArrayList<>();

        for (Event event : liveEvents) {
            EventResponseDto dto = getDto(event);
            response.add(dto);
        }

        if (response.size() < 3) {
            int remaining = 3 - response.size();

            // find upcoming events
            Pageable upcomingPage = PageRequest.of(0, remaining);
            List<Event> upcomingEvents = eventRepository.findUpcomingEventsByClub(clubId, upcomingPage);

            for (Event event : upcomingEvents) {
                EventResponseDto dto = getDto(event);
                response.add(dto);
            }
        }

        return response;
    }

    // create new events
    @Transactional
    public boolean createEvent(EventRequestDto request, Long clubId) {
        try {
            // create event
            Event event = new Event();
            event.setTitle(request.getTitle());
            event.setDescription(request.getDescription());
            event.setRegistrationEnd(request.getRegistrationEnd());
            event.setImage(request.getImageUrl());
            event.setEventDate(request.getEventDate());
            event.setEndDate(request.getEndDate());
            event.setLocation(request.getLocation());
            event.setClub(clubService.getClubById(clubId));

            // save in db
            eventRepository.save(event);

            // save sponsors
            boolean sponsorsSaved = saveSponsors(request.getSponsors(), event);

            // save speakers
            boolean speakersSaved = saveSpeakers(request.getSpeakers(), event);

            return sponsorsSaved && speakersSaved;
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }

    // modify the event
    @Transactional
    public boolean updateEvent(EventRequestDto request, Long eventId) {

        // get event
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        eventSponsorRepository.deleteAllByEvent_Id(eventId);
        eventSpeakerRepository.deleteAllByEvent_Id(eventId);
        // update
        if(request.getTitle() != null) {
            event.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            event.setDescription(request.getDescription());
        }
        if (request.getEventDate() != null) {
            event.setEventDate(request.getEventDate());
        }
        if (request.getEndDate() != null) {
            event.setEndDate(request.getEndDate());
        }
        if (request.getRegistrationEnd() != null) {
            event.setRegistrationEnd(request.getRegistrationEnd());
        }
        if (request.getLocation() != null) {
            event.setLocation(request.getLocation());
        }
        if (request.getImageUrl() != null) {
            event.setImage(request.getImageUrl());
        }
        if (request.getSponsors() != null) {
            saveSponsors(request.getSponsors(), event);
        }
        if (request.getSpeakers() != null) {
            saveSpeakers(request.getSpeakers(), event);
        }

        // save in db
        eventRepository.save(event);
        return true;
    }

    // delete the event
    @Transactional
    public boolean deleteEvent(Long eventId) {

        // find if exist
        if (!eventRepository.existsById(eventId)) {
            throw new RuntimeException("Event not found");
        }

        // delete
        eventRepository.deleteById(eventId);
        return true;
    }

    // get all active events of club (live & upcoming)
    public List<EventResponseDto> getActiveEventsByClub(Long clubId) {

        // find club
        Club club = clubService.getClubById(clubId);
        List<String> statuses = List.of("UPCOMING", "LIVE");

        // find all live and upcoming events
        List<Event> events = eventRepository.findByClubAndStatusIn(club, statuses);

        return getDtoList(events);
    }

    // get all finished events of college
    public List<EventResponseDto> getFinishedEventsByClub(Long clubId) {

        // find club
        Club club = clubService.getClubById(clubId);
        List<String> statuses = List.of("FINISHED");

        // find all finished events
        List<Event> events = eventRepository.findByClubAndStatusIn(club, statuses);

        return getDtoList(events);
    }
}
