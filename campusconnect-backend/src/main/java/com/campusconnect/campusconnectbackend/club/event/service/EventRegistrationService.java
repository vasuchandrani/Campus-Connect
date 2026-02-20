package com.campusconnect.campusconnectbackend.club.event.service;

import com.campusconnect.campusconnectbackend.club.event.entity.Event;
import com.campusconnect.campusconnectbackend.club.event.entity.EventRegistration;
import com.campusconnect.campusconnectbackend.club.event.entity.id.EventRegistrationId;
import com.campusconnect.campusconnectbackend.club.event.repository.EventRegistrationRepository;
import com.campusconnect.campusconnectbackend.club.event.repository.EventRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EventRegistrationService {

    private final AuthService authService;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventRepository eventRepository;
    private final StudentRepoService studentRepoService;

    // register student in event
    @Transactional
    public boolean registerStudent(Long eventId) {

        // fins student
        Long studentId = authService.getCurrentUserId();
        // find event
        Event event =  eventRepository.findEventById(eventId).orElseThrow(
                () -> new RuntimeException("Event with id " + eventId + " not found")
        );

        // prevent duplicate registration
        if (eventRegistrationRepository
            .existsByEvent_IdAndStudent_Id(eventId, studentId)) {
            return false;
        }

        if (event.getRegistrationEnd().isBefore(LocalDateTime.now())) {
            return false; // registration closed
        }

        EventRegistrationId id = new EventRegistrationId();
        id.setEventId(eventId);
        id.setStudentId(studentId);

        EventRegistration registration = new EventRegistration();
        registration.setEventRegistrationId(id);
        registration.setEvent(event);
        registration.setStudent(studentRepoService.getStudent(studentId));

        eventRegistrationRepository.save(registration);
        return true;
    }

    // unregister student from event
    @Transactional
    public boolean unRegisterStudent(Long eventId) {

        // find student
        Long studentId = authService.getCurrentUserId();
        // find event
        Event event =  eventRepository.findById(eventId).orElseThrow(
                () -> new RuntimeException("Event with id " + eventId + " not found")
        );

        // check if registered or not
        if (!eventRegistrationRepository
                .existsByEvent_IdAndStudent_Id(eventId, studentId)) {
            return false;
        }

        if (event.getRegistrationEnd().isBefore(LocalDateTime.now())) {
            return false; // registration closed
        }

        eventRegistrationRepository
                .deleteByEvent_IdAndStudent_Id(eventId, studentId);

        return true;
    }
}
