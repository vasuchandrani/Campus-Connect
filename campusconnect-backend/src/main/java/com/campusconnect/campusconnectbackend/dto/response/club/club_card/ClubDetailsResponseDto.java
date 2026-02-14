package com.campusconnect.campusconnectbackend.dto.response.club.club_card;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.*;

@Getter
@Setter
public class ClubDetailsResponseDto {

    @NotBlank
    private String clubName;

    private String description;

    @Min(0)
    private int memberCount;

    @Min(0)
    private int teamCount;

    @Min(0)
    private int eventCount;

    @Min(0)
    private int followerCount;

    private String logoUrl;

    private ClubAdminDto clubAdmin;

    private List<TeamCardDto> teams;

    private List<ClubMemberDto> members;

    private List<EventSummaryDto> events;

    private List<AnnouncementSummaryDto> announcements;

    private Boolean isFollowed;

    public void setFollowed(Boolean isFollowed) {
        this.isFollowed = isFollowed;
    }
}
