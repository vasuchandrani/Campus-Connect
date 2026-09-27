package com.campusconnect.campusconnectbackend.club.club_mentor.dto;

import com.campusconnect.campusconnectbackend.announcement.dto.res.AnnouncementResponseDto;
import com.campusconnect.campusconnectbackend.event.dto.res.EventResponseDto;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ClubMentorDashboardDto implements Serializable {
    private Long clubId;
    private String clubName;
    private String tagline1;
    private String tagline2;
    private String description;
    private String logoUrl;
    private String website;
    private String foundedBy;
    private LocalDateTime createdAt;

    // Student Lead Info
    private String adminName;
    private String adminEmail;
    private String adminDepartment;

    // Stats
    private int followerCount;
    private int memberCount;
    private int teamCount;
    private int activeEventCount;

    // Feeds (5 each)
    private List<EventResponseDto> recentEvents;
    private List<AnnouncementResponseDto> recentAnnouncements;

    // Governance Permissions
    private String announcementPermission;
    private String eventPermission;
}
