package com.campusconnect.campusconnectbackend.club.event.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class EventRequestDto {

    @NotBlank(message = "Event title is required")
    private String title;

    private String description;

    private String imageUrl;

    private LocalDateTime registrationEnd;

    private LocalDateTime eventDate;

    private String location;
}
