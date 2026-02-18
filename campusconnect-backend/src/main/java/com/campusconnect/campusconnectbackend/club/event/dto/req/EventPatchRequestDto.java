package com.campusconnect.campusconnectbackend.club.event.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class EventPatchRequestDto {

    @NotBlank
    private String description;

    @NotBlank
    private String imageUrl;

    @NotNull
    private LocalDateTime registrationEnd;

    @NotNull
    private LocalDateTime eventDate;

    @NotBlank
    private String location;
}
