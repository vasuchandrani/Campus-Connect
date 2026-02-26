package com.campusconnect.campusconnectbackend.club.event.dto.res;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.*;
import java.time.LocalDateTime;

@Getter
@Setter
public class EventResponseDto {

    @NotNull
    private Long id;

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String image;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private LocalDateTime registrationEnd;

    private String location;

    @NotBlank
    private String clubName;

    private LocalDateTime createAt;

    private boolean isRegister;

    private int registrationsCount;

    private String overview;

    private List<String> images;

    private List<EventSponsorResponseDto> sponsors;

    private List<EventSpeakerResponseDto> speakers;

    private List<EventWinnerResponseDto> winners;
}
