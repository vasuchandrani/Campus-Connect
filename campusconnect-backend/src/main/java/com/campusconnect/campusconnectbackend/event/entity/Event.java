package com.campusconnect.campusconnectbackend.event.entity;

import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college.entity.Department;
import com.campusconnect.campusconnectbackend.common.location.entity.Location;
import com.campusconnect.campusconnectbackend.event.entity.enums.EventHost;
import com.campusconnect.campusconnectbackend.event.entity.enums.EventRegistrationPayment;
import com.campusconnect.campusconnectbackend.event.entity.enums.EventStatus;
import com.campusconnect.campusconnectbackend.event.entity.enums.EventType;
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
        name = "events",
        indexes = {
                @Index(
                        name = "event_college_status_created_idx",
                        columnList = "college_id, status, created_at"
                ),
                @Index(
                        name = "event_club_status_created_idx",
                        columnList = "club_id, status, created_at"
                ),
                @Index(
                        name = "event_is_public_created_idx",
                        columnList = "is_public, created_at"
                )
        }
)
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id")
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Enumerated(EnumType.STRING)
    @Column(name = "hosted_by", nullable = false)
    private EventHost hostedBy = EventHost.CLUB;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType = EventType.OFFLINE;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "cover_image")
    private String coverImage;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_payment", nullable = false)
    private EventRegistrationPayment registrationPayment = EventRegistrationPayment.FREE;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "selected_registration_fields", columnDefinition = "jsonb")
    private JsonNode selectedRegistrationFields;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "custom_registration_fields", columnDefinition = "jsonb")
    private JsonNode customRegistrationFields;

    @Column(name = "registration_start", nullable = false)
    private LocalDateTime registrationStart;

    @Column(name = "registration_end", nullable = false)
    private LocalDateTime registrationEnd;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(name = "batch_year")
    private Integer batchYear;

    @Column(name = "criteria", columnDefinition = "TEXT")
    private String criteria;

    @Column(name = "eligibility", columnDefinition = "TEXT")
    private String eligibility;

    @Column(name = "prize_money")
    private Integer prizeMoney;

    @Column(name = "overview", columnDefinition = "TEXT")
    private String overview;

    @Column(name = "participation")
    private int participation;

    @Column(name = "state", nullable = false)
    private int state = 0;
    // 0 - created by club-member
    // 1 - created or approved by club-admin
    // 2 - approved by mentor
    // 3 - approved by college-admin, means published within college
    // 4 - request for globalize
    // 5 - approved and globalize by college-admin

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private EventStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private User deletedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
