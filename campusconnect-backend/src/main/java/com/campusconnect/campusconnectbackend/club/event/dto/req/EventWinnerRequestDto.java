package com.campusconnect.campusconnectbackend.club.event.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventWinnerRequestDto {

    @NotBlank
    private String name;

    @Email
    private String email;
}
