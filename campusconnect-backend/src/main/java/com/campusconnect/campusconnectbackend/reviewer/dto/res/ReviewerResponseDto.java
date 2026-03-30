package com.campusconnect.campusconnectbackend.reviewer.dto.res;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewerResponseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull
    private Long id;

    @NotBlank
    private String fullName;

    @NotBlank
    private String email;

    @NotNull
    private LocalDateTime createdAt;

    @NotNull
    private Long collegeId;
}
