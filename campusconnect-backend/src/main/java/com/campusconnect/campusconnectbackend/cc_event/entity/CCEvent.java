package com.campusconnect.campusconnectbackend.cc_event.entity;


import com.campusconnect.campusconnectbackend.cc_event.entity.enums.CCEventRegistrationPayment;
import com.campusconnect.campusconnectbackend.cc_event.entity.enums.CCEventStatus;
import com.campusconnect.campusconnectbackend.cc_event.entity.enums.CCEventType;
import com.campusconnect.campusconnectbackend.common.location.entity.Location;
import com.campusconnect.campusconnectbackend.system_admin.entity.SystemAdmin;
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
        name = "global_events",
        indexes = {
                @Index(
                        name = "global_events_status_created_idx",
                        columnList = "status, created_at"
                )
        }
)
public class CCEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private SystemAdmin createdBy;

    @Column(name = "hosted_by", nullable = false)
    private String hostedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "registration_payment", nullable = false)
    private CCEventRegistrationPayment ccEventRegistrationPayment;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private CCEventType ccEventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status",  nullable = false)
    private CCEventStatus status;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "registration_start", nullable = false)
    private LocalDateTime registrationStart;

    @Column(name = "registration_end", nullable = false)
    private LocalDateTime registrationEnd;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "selected_registration_fields", columnDefinition = "jsonb")
    private JsonNode selectedRegistrationFields;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "custom_registration_fields", columnDefinition = "jsonb")
    private JsonNode customRegistrationFields;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "cover_image")
    private String coverImage;

    @Column(name = "eligibility", columnDefinition = "TEXT")
    private String eligibility;

    @Column(name = "criteria", columnDefinition = "TEXT")
    private String criteria;

    @Column(name = "prize_money")
    private Integer prizeMoney;

    @Column(name = "overview", columnDefinition = "TEXT")
    private String overview;

    @Column(name = "participation")
    private int participation;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private User deleteBy;
}
