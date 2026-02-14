package com.campusconnect.campusconnectbackend.dto.response.club.club_card;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class AnnouncementSummaryDto {

    private Long id;
    private String title;
    private String content;
    private LocalDateTime createdAt;
}
