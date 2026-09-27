package com.campusconnect.campusconnectbackend.event.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(
        name = "event_winners",
        indexes = {
                @Index(
                        name = "event_winner_event_idx",
                        columnList = "event_id"
                )
        }
)
public class EventWinner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id")
    private EventRegistration eventRegistration;

    @Column(name = "winner_name", nullable = false)
    private String name;

    @Column(name = "prize", columnDefinition = "TEXT")
    private String prize;

    public String getEmail() {
        return eventRegistration != null && eventRegistration.getStudent() != null ? eventRegistration.getStudent().getEmail() : null;
    }

    public void setEmail(String email) {
        // Can be mapped or stored transiently
    }
}
