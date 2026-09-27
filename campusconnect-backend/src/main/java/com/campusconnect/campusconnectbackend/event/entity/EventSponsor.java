package com.campusconnect.campusconnectbackend.event.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(
        name = "event_sponsors",
        indexes = {
                @Index(name = "event_sponsors_event_idx", columnList = "event_id")
        }
)
public class EventSponsor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Email
    @Column(name = "email")
    private String email;

    @Column(name = "sponsor_name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
}
