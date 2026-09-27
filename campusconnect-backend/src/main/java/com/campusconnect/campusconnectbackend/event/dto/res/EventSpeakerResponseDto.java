package com.campusconnect.campusconnectbackend.event.dto.res;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EventSpeakerResponseDto {

    @NotNull
    private Long id;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String name;

    @NotBlank
    private String tagline;

    public String getDescription() {
        return tagline != null ? tagline : "";
    }

    public void setDescription(String description) {
        this.tagline = description;
    }
}
