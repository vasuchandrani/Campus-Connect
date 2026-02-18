package com.campusconnect.campusconnectbackend.dto.response.reviewer;

import com.campusconnect.campusconnectbackend.college.College;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewerResponseDto {

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
