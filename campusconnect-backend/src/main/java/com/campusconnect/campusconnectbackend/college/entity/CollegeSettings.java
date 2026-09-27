package com.campusconnect.campusconnectbackend.college.entity;

import com.campusconnect.campusconnectbackend.college.entity.enums.GeneralPublishingSettings;
import com.campusconnect.campusconnectbackend.college.entity.enums.NewspaperPublishingSettings;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "college_settings")
public class CollegeSettings {

    @Id
    @Column(name = "college_id")
    private Long collegeId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "college_id")
    private College college;

    @Enumerated(EnumType.STRING)
    @Column(name = "club_publishing_settings", nullable = false)
    private GeneralPublishingSettings clubPublishingSettings = GeneralPublishingSettings.APPROVAL_NEEDED;

    @Enumerated(EnumType.STRING)
    @Column(name = "college_announcement_publishing_settings", nullable = false)
    private GeneralPublishingSettings collegeAnnouncementPublishingSettings = GeneralPublishingSettings.APPROVAL_NEEDED;

    @Enumerated(EnumType.STRING)
    @Column(name = "college_event_publishing_settings", nullable = false)
    private GeneralPublishingSettings collegeEventPublishingSettings = GeneralPublishingSettings.APPROVAL_NEEDED;

    @Enumerated(EnumType.STRING)
    @Column(name = "newspaper_publishing_settings", nullable = false)
    private NewspaperPublishingSettings newspaperPublishingSettings = NewspaperPublishingSettings.MENTOR_APPROVAL_NEEDED;

    @Column(name = "journalist_re_request_minimum_time", nullable = false)
    private int journalistReRequestMinimumTime;

    @Column(name = "club_re_request_minimum_time", nullable = false)
    private int clubReRequestMinimumTime;
}
