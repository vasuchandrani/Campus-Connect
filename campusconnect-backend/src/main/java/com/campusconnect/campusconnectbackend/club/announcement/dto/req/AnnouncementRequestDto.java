package com.campusconnect.campusconnectbackend.club.announcement.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AnnouncementRequestDto {

    @NotBlank(message = "Announcement title is missing")
    private String title;

    @NotBlank(message = "Announcement content is missing")
    private String content;
}
