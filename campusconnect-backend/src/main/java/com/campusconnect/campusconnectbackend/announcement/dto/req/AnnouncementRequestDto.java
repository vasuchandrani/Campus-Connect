package com.campusconnect.campusconnectbackend.announcement.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class AnnouncementRequestDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Announcement title is missing")
    private String title;

    @NotBlank(message = "Announcement content is missing")
    private String content;
}
