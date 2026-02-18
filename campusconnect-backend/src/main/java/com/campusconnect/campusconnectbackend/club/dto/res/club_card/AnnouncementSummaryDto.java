package com.campusconnect.campusconnectbackend.club.dto.res.club_card;

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
