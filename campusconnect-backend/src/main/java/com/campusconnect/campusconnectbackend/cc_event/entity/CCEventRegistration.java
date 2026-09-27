package com.campusconnect.campusconnectbackend.cc_event.entity;

import com.campusconnect.campusconnectbackend.cc_event.entity.enums.CCEventRegistrationStatus;
import com.campusconnect.campusconnectbackend.user.entity.User;
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
        name = "global_event_registrations",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "global_event_registrations_user_uk",
                        columnNames = {"cc_event_id", "user_id"}
                )
        },
        indexes = {
                @Index(name = "global_event_registrations_user_idx", columnList = "user_id")
        }
)
public class CCEventRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cc_event_id", nullable = false)
    private CCEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "registration_data", columnDefinition = "JSONB")
    private JsonNode registrationData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_plan_id")
    private CCEventRegistrationPlan eventRegistrationPlan;

    @CreationTimestamp
    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private CCEventRegistrationStatus status = CCEventRegistrationStatus.REGISTERED;
}
