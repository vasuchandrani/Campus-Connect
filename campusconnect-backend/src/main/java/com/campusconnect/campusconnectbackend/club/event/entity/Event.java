package com.campusconnect.campusconnectbackend.club.event.entity;

import com.campusconnect.campusconnectbackend.club.Club;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.util.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "event")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url")
    private String image;

    @Column(name = "event_time", nullable = false)
    private LocalDateTime eventDate;

    @Column(name = "registration_end")
    private LocalDateTime registrationEnd;

    @Column(name = "location", nullable = false)
    private String location;

    @Column(name = "status", nullable = false)
    private String status = "UPCOMING";

    @Column(columnDefinition = "TEXT")
    private String overview;

    @ElementCollection
    @CollectionTable(
            name = "event_speakers",
            joinColumns = @JoinColumn(name = "event_id")
    )
    @Column(name = "speaker_name")
    private List<String> speakers;

    @ElementCollection
    @CollectionTable(
            name = "event_sponsors",
            joinColumns = @JoinColumn(name = "event_id")
    )
    @Column(name = "sponsor_name")
    private List<String> sponsors;

    @Column(name = "prize_money")
    private Integer prizeMoney;

    @Column(name = "participation")
    private int participation;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;
}
