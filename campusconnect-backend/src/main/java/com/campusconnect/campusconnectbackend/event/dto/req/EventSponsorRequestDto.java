package com.campusconnect.campusconnectbackend.event.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventSponsorRequestDto {

    @NotBlank
    private String name;

    @NotBlank
    private String tagline;
}
