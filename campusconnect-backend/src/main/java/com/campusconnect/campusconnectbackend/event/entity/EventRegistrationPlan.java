package com.campusconnect.campusconnectbackend.event.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(
        name = "event_registration_plans",
        indexes = {
                @Index(
                        name = "event_registration_plan_event_idx",
                        columnList = "event_id"
                )
        }
)
public class EventRegistrationPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(name = "plan_name", nullable = false)
    private String planName;

    @Column(name = "plan_description")
    private String planDescription;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "max_seats")
    private Integer maxSeats;

    // Backward compatibility helpers
    public String getName() {
        return planName;
    }

    public void setName(String name) {
        this.planName = name;
    }

    public BigDecimal getPrice() {
        return amount;
    }

    public void setPrice(BigDecimal price) {
        this.amount = price;
    }

    public String getDescription() {
        return planDescription;
    }

    public void setDescription(String description) {
        this.planDescription = description;
    }
}
