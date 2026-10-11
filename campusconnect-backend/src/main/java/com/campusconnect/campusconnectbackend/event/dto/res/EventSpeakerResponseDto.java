package com.campusconnect.campusconnectbackend.event.dto.res;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventSpeakerResponseDto {

    private Long id;

    private String email;

    private String name;

    private String tagline;

    public String getDescription() {
        return tagline != null ? tagline : "";
    }

    public void setDescription(String description) {
        this.tagline = description;
    }

    public String getPosition() {
        return tagline != null ? tagline : "";
    }

    public void setPosition(String position) {
        this.tagline = position;
    }
}
