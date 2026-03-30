package com.campusconnect.campusconnectbackend.announcement.dto.res;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
public class AnnouncementResponseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull
    private Long id;

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    @NotBlank
    private String clubName;

    private LocalDateTime createdAt;
}