package com.campusconnect.campusconnectbackend.event.service.serviceImpl;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.event.entity.Event;
import com.campusconnect.campusconnectbackend.event.entity.EventRegistration;
import com.campusconnect.campusconnectbackend.event.repository.EventRegistrationRepository;
import com.campusconnect.campusconnectbackend.event.repository.EventRepository;
import com.campusconnect.campusconnectbackend.event.service.EventRegistrationService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EventRegistrationServiceImpl implements EventRegistrationService {

    private final AuthService authService;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final EventRepository eventRepository;
    private final StudentRepoService studentRepoService;

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "active_events", key = "'college_' + @authService.getCurrentCollegeId()"),
    })
    public MessageResponseDto registerStudent(Long eventId) {
        Long studentId = authService.getCurrentUserId();
        Event event = eventRepository.findEventById(eventId).orElseThrow(
                () -> new RuntimeException("Event with id " + eventId + " not found")
        );

        if (eventRegistrationRepository.existsByEvent_IdAndStudent_Id(eventId, studentId)) {
            return new MessageResponseDto("You are already registered for this event");
        }

        if (event.getRegistrationStart() != null && event.getRegistrationStart().isAfter(LocalDateTime.now())) {
            return new MessageResponseDto("Registration has not started yet for this event");
        }

        if (event.getRegistrationEnd() != null && event.getRegistrationEnd().isBefore(LocalDateTime.now())) {
            return new MessageResponseDto("Registration has been closed for this event");
        }

        EventRegistration registration = new EventRegistration();
        registration.setEvent(event);
        registration.setStudent(studentRepoService.getStudent(studentId));

        eventRegistrationRepository.save(registration);

        return new MessageResponseDto("You are registered successfully");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "active_events", key = "'college_' + @authService.getCurrentCollegeId()"),
    })
    public MessageResponseDto unRegisterStudent(Long eventId) {
        Long studentId = authService.getCurrentUserId();
        Event event = eventRepository.findById(eventId).orElseThrow(
                () -> new RuntimeException("Event with id " + eventId + " not found")
        );

        if (!eventRegistrationRepository.existsByEvent_IdAndStudent_Id(eventId, studentId)) {
            return new MessageResponseDto("You are already unregistered for this event");
        }

        if (event.getRegistrationEnd().isBefore(LocalDateTime.now())) {
            return new MessageResponseDto("Registration change has been closed");
        }

        eventRegistrationRepository.deleteByEvent_IdAndStudent_Id(eventId, studentId);

        return new MessageResponseDto("You are unregistered successfully");
    }

    @Override
    public byte[] generateExcel(Long eventId) {
        List<EventRegistration> registrations =
                eventRegistrationRepository.findByEventIdWithStudent(eventId);

        java.time.format.DateTimeFormatter dateFormatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd");
        java.time.format.DateTimeFormatter timeFormatter = java.time.format.DateTimeFormatter.ofPattern("HH:mm:ss");

        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append("Student ID,Name,Email,Branch,Year,Date,Time\n");

        for (EventRegistration reg : registrations) {
            Student s = reg.getStudent();
            csvBuilder.append(s.getStudentId() != null ? s.getStudentId() : "").append(",");
            csvBuilder.append(s.getFullName() != null ? s.getFullName().replace(",", " ") : "").append(",");
            csvBuilder.append(s.getEmail() != null ? s.getEmail() : "").append(",");
            csvBuilder.append(s.getDepartment() != null ? s.getDepartment() : "").append(",");
            csvBuilder.append(s.getYear()).append(",");
            
            if (reg.getRegisteredAt() != null) {
                csvBuilder.append(reg.getRegisteredAt().format(dateFormatter)).append(",");
                csvBuilder.append(reg.getRegisteredAt().format(timeFormatter)).append("\n");
            } else {
                csvBuilder.append(",\n");
            }
        }

        return csvBuilder.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    @Override
    public List<Long> getMyRegisteredEventIds() {
        Long studentId = authService.getCurrentUserId();
        return eventRegistrationRepository.findEventIdsByStudentId(studentId);
    }
}
