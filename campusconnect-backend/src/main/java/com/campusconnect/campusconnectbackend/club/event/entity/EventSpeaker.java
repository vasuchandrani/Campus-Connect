package com.campusconnect.campusconnectbackend.club.event.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "event_speaker")
public class EventSpeaker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email
    private String email;

    @Column(name = "speaker_name", nullable = false)
    private String name;

    @Column(nullable = false)
    private String tagline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;
}
