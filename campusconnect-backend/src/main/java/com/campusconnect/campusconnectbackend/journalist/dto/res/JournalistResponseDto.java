package com.campusconnect.campusconnectbackend.journalist.dto.res;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class JournalistResponseDto {

    @NotNull
    private Long id;

    @NotBlank
    private String fullName;

    @NotNull
    private LocalDateTime createdAt;

    @NotNull
    private boolean isActive;

    @NotNull
    private Long studentId;

    @NotNull
    private Long collegeId;
}

