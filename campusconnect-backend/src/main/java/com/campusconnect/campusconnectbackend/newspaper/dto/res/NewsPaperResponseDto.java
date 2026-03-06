package com.campusconnect.campusconnectbackend.newspaper.dto.res;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NewsPaperResponseDto {

    @NotNull
    private Long id;

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    @NotBlank
    private String imageUrl;

    @NotNull
    private LocalDateTime createdAt;

    @NotBlank
    private String journalistName;

    @NotBlank
    private String collegeName;
}
