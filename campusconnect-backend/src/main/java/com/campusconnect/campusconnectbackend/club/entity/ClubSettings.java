package com.campusconnect.campusconnectbackend.club.entity;

import com.campusconnect.campusconnectbackend.club.entity.enums.ClubPublishSettings;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "club_settings")
public class ClubSettings {

    @Id
    @Column(name = "club_id")
    private Long clubId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "club_id")
    private Club club;

    @Enumerated(EnumType.STRING)
    @Column(name = "announcement_publish_settings", nullable = false)
    private ClubPublishSettings announcementPublishSettings = ClubPublishSettings.MENTOR_APPROVAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_publish_settings", nullable = false)
    private ClubPublishSettings eventPublishSettings = ClubPublishSettings.MENTOR_APPROVAL;
}
