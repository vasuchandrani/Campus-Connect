package com.campusconnect.campusconnectbackend.club.event.entity;

import com.campusconnect.campusconnectbackend.club.event.entity.id.EventRegistrationId;
import com.campusconnect.campusconnectbackend.student.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "event_registrations")
public class EventRegistration {

    @EmbeddedId
    private EventRegistrationId eventRegistrationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("eventId")
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentId")
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
}
