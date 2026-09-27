package com.campusconnect.campusconnectbackend.cc_event.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(
        name = "global_event_registration_plans",
        indexes = {
                @Index(
                        name = "global_event_registration_plans_event_idx",
                        columnList = "cc_event_id"
                )
        }
)
public class CCEventRegistrationPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cc_event_id", nullable = false)
    private CCEvent event;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "description")
    private String description;

    @Column(name = "max_seats")
    private Integer maxSeats;
}
