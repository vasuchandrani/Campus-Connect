package com.campusconnect.campusconnectbackend.cc_event.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "finished_global_event_images")
public class FinishedGlobalEventImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finished_global_event_id", nullable = false)
    private FinishedGlobalEvent finishedGlobalEvent;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;
}
