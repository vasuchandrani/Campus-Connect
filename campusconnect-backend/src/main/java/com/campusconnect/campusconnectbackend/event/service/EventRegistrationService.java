package com.campusconnect.campusconnectbackend.event.service;

import com.campusconnect.campusconnectbackend.event.entity.Event;
import com.campusconnect.campusconnectbackend.event.entity.EventRegistration;
import com.campusconnect.campusconnectbackend.event.entity.id.EventRegistrationId;
import com.campusconnect.campusconnectbackend.event.repository.EventRegistrationRepository;
import com.campusconnect.campusconnectbackend.event.repository.EventRepository;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
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

import java.util.*;
import java.io.ByteArrayOutputStream;
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
    @Caching(evict = {
            @CacheEvict(value = "active_events", key = "'college_' + @authService.getCurrentCollegeId()"),
    })
    public MessageResponseDto registerStudent(Long eventId) {

        // fins student
        Long studentId = authService.getCurrentUserId();
        // find event
        Event event =  eventRepository.findEventById(eventId).orElseThrow(
                () -> new RuntimeException("Event with id " + eventId + " not found")
        );

        // prevent duplicate registration
        if (eventRegistrationRepository
            .existsByEvent_IdAndStudent_Id(eventId, studentId)) {
            return new MessageResponseDto("You are already registered for this event");
        }

        if (event.getRegistrationEnd().isBefore(LocalDateTime.now())) {
            return new MessageResponseDto("Registration has been closed for this event"); // registration closed
        }

        EventRegistrationId id = new EventRegistrationId();
        id.setEventId(eventId);
        id.setStudentId(studentId);

        EventRegistration registration = new EventRegistration();
        registration.setEventRegistrationId(id);
        registration.setEvent(event);
        registration.setStudent(studentRepoService.getStudent(studentId));

        eventRegistrationRepository.save(registration);

        return new MessageResponseDto("You are registered successfully");
    }

    // unregister student from event
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "active_events", key = "'college_' + @authService.getCurrentCollegeId()"),
    })
    public MessageResponseDto unRegisterStudent(Long eventId) {

        // find student
        Long studentId = authService.getCurrentUserId();
        // find event
        Event event =  eventRepository.findById(eventId).orElseThrow(
                () -> new RuntimeException("Event with id " + eventId + " not found")
        );

        // check if registered or not
        if (!eventRegistrationRepository
                .existsByEvent_IdAndStudent_Id(eventId, studentId)) {
            return new MessageResponseDto("You are already unregistered for this event");
        }

        if (event.getRegistrationEnd().isBefore(LocalDateTime.now())) {
            return new MessageResponseDto("Registration change has been closed"); // registration closed
        }

        eventRegistrationRepository
                .deleteByEvent_IdAndStudent_Id(eventId, studentId);

        return new MessageResponseDto("You are unregistered successfully");
    }

    public byte[] generateExcel(Long eventId) {
        List<EventRegistration> registrations =
                eventRegistrationRepository.findByEventIdWithStudent(eventId);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Registrations");

            // Header
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Student ID");
            header.createCell(1).setCellValue("Name");
            header.createCell(2).setCellValue("Email");
            header.createCell(3).setCellValue("Branch");
            header.createCell(4).setCellValue("Year");

            int rowNum = 1;

            for (EventRegistration reg : registrations) {
                Student s = reg.getStudent();

                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(s.getStudentId());
                row.createCell(1).setCellValue(s.getFullName());
                row.createCell(2).setCellValue(s.getEmail());
                row.createCell(3).setCellValue(s.getDepartment());
                row.createCell(4).setCellValue(s.getYear());
            }

            // Auto size columns
            for (int i = 0; i < 5; i++) {
                sheet.autoSizeColumn(i);
            }

            ByteArrayOutputStream out = new ByteArrayOutputStream();
            workbook.write(out);

            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel", e);
        }
    }
}