package com.campusconnect.campusconnectbackend.dto.response.student;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class StudentResponseDto {

    @NotNull
    private Long id;

    @NotBlank
    private String studentId;

    @NotBlank
    private String fullName;

    @NotBlank
    private String email;

    @NotBlank
    private String gender;

    @NotBlank
    private String department;

    @NotNull
    private int year;

    @NotNull
    private LocalDateTime createdAt;

    private boolean isVerified;

    @NotNull
    private Long collegeId;
}
