package com.campusconnect.campusconnectbackend.event.entity;

import com.campusconnect.campusconnectbackend.event.entity.enums.RegistrationStatus;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(
        name = "event_registrations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "event_student_uk",
                        columnNames = {"event_id", "student_id"}
                )
        },
        indexes = {
                @Index(name = "registration_student_idx", columnList = "student_id")
        }
)
public class EventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "registration_data", columnDefinition = "JSONB")
    private JsonNode registrationData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_plan_id")
    private EventRegistrationPlan eventRegistrationPlan;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RegistrationStatus status = RegistrationStatus.REGISTERED;

    @CreationTimestamp
    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;
}
