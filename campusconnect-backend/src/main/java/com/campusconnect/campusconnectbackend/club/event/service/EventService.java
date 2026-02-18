package com.campusconnect.campusconnectbackend.club.event.service;

import com.campusconnect.campusconnectbackend.club.Club;
import com.campusconnect.campusconnectbackend.club.ClubService;
import com.campusconnect.campusconnectbackend.club.event.dto.req.EventPatchRequestDto;
import com.campusconnect.campusconnectbackend.club.event.dto.req.EventRequestDto;
import com.campusconnect.campusconnectbackend.club.event.dto.res.EventResponseDto;
import com.campusconnect.campusconnectbackend.club.event.entity.Event;
import com.campusconnect.campusconnectbackend.club.event.repository.EventRegistrationRepository;
import com.campusconnect.campusconnectbackend.club.event.repository.EventRepository;
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

    // get all events of college
    public List<EventResponseDto> getAllEventsByCollege() {

        // find all clubs of college
        List<Club> clubs = clubService.getAllClubsByCollege();

        List<Event> events = eventRepository.findAllByClubs(clubs);

        return getDtoList(events);
    }

    // get all events of club
    public List<EventResponseDto> getAllEvents(Long clubId) {
        // find events of club
        List<Event> events = eventRepository.findEventByClub_Id(clubId);

        return getDtoList(events);
    }

    // get particular event
    public EventResponseDto getEvent(Long eventId) {
        // find event
        Event e = eventRepository.findEventById(eventId);

        return getDto(e);
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
            // create
            Event event = new Event();
            event.setTitle(request.getTitle());
            event.setDescription(request.getDescription());
            event.setRegistrationEnd(request.getRegistrationEnd());
            event.setImage(request.getImageUrl());
            event.setEventDate(request.getEventDate());
            event.setLocation(request.getLocation());
            event.setClub(clubService.getClubById(clubId));

            // save in db
            eventRepository.save(event);
            return true;
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }

    // modify the event
    @Transactional
    public boolean updateEvent(EventPatchRequestDto request, Long eventId) {

        // get event
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // update
        if (request.getDescription() != null) {
            event.setDescription(request.getDescription());
        }
        if (request.getEventDate() != null) {
            event.setEventDate(request.getEventDate());
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
}
