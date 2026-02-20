package com.campusconnect.campusconnectbackend.club.event.dto.res;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.*;
import java.time.LocalDateTime;

@Getter
@Setter
public class EventDetailsResponseDto {

    @NotNull
    private Long id;

    @NotBlank
    private String image;

    @NotBlank
    private String title;

    @NotBlank
    private String clubName;

    @NotNull
    private LocalDateTime eventDate;

    @NotNull
    private LocalDateTime endDate;

    @NotBlank
    private String location;

    @NotBlank
    private String description;

    @NotBlank
    private String status;

    private int registrationsCount;

    private String overview;

    private List<String> images;

    private List<EventSpeakerResponseDto> speakers;

    private List<EventSponsorResponseDto> sponsors;

    private List<EventWinnerResponseDto> winners;
}
