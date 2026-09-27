package com.campusconnect.campusconnectbackend.event.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(
        name = "finished_event_images",
        indexes = {
                @Index(name = "finished_event_images_idx", columnList = "finished_event_id")
        }
)
public class FinishedEventImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finished_event_id", nullable = false)
    private FinishedEvent finishedEvent;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;
}
