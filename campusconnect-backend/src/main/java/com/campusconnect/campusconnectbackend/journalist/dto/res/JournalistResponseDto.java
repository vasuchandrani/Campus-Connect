package com.campusconnect.campusconnectbackend.journalist.dto.res;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
public class JournalistResponseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull
    private Long id;

    @NotBlank
    private String fullName;

    @NotNull
    private LocalDateTime createdAt;

    @NotNull
    private boolean isActive;

    @NotNull
    private String studentId;

    @NotNull
    private Long collegeId;
}

