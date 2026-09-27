package com.campusconnect.campusconnectbackend.cc_event.entity;

import com.campusconnect.campusconnectbackend.cc_event.entity.enums.CCEventType;
import com.campusconnect.campusconnectbackend.common.location.entity.Location;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "finished_global_events")
public class FinishedGlobalEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private CCEventType eventType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "cover_image")
    private String coverImage;

    @Column(name = "overview", columnDefinition = "TEXT")
    private String overview;

    @Column(name = "event_details", nullable = false, columnDefinition = "TEXT")
    private String eventDetails;

    @Column(name = "college_details", columnDefinition = "TEXT")
    private String collegeDetails;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
