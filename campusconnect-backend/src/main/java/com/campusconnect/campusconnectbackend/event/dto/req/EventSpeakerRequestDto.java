package com.campusconnect.campusconnectbackend.event.dto.req;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventSpeakerRequestDto {

    private String email;

    @NotBlank
    private String name;

    private String tagline;
    private String description;
    private String position;

    public String getEffectiveTagline() {
        if (tagline != null && !tagline.trim().isEmpty()) return tagline.trim();
        if (description != null && !description.trim().isEmpty()) return description.trim();
        if (position != null && !position.trim().isEmpty()) return position.trim();
        return null;
    }
}
