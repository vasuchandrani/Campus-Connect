package com.campusconnect.campusconnectbackend.event.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(
        name = "finished_event_winners",
        indexes = {
                @Index(name = "finished_event_winner_idx", columnList = "finished_event_id")
        }
)
public class FinishedEventWinner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finished_event_id", nullable = false)
    private FinishedEvent finishedEvent;

    @Column(name = "winner_name", nullable = false)
    private String winnerName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    private EventRegistration registration;

    @Column(name = "prize", columnDefinition = "TEXT")
    private String prize;
}
