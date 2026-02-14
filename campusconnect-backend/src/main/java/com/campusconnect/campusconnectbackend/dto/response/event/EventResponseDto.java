package com.campusconnect.campusconnectbackend.dto.response.event;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

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

    private LocalDateTime eventDate;

    private LocalDateTime registrationEnd;

    private String location;

    @NotBlank
    private String status;

    @NotBlank
    private String clubName;

    private boolean isRegister;

    private boolean isRegistrationOpen;

    private LocalDateTime createAt;

    private int registrationsCount;

}
