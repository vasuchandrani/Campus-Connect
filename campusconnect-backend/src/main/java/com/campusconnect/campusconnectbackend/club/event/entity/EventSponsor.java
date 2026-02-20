package com.campusconnect.campusconnectbackend.club.event.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "event_sponsors")
public class EventSponsor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sponsor_name", nullable = false)
    private String name;

    @Column(nullable = false)
    private String tagline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;
}
