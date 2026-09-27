package com.campusconnect.campusconnectbackend.cc_event.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "finished_global_event_winners")
public class FinishedGlobalEventWinner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finished_global_event_id", nullable = false)
    private FinishedGlobalEvent finishedGlobalEvent;

    @Column(name = "winner_name", nullable = false)
    private String winnerName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    private CCEventRegistration registration;

    @Column(name = "prize", columnDefinition = "TEXT")
    private String prize;
}
