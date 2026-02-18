package com.campusconnect.campusconnectbackend.dto.response.journalist;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JournalistReqResponseDto {

    @NotNull
    private Long id;

    @NotBlank
    private String why;

    @NotBlank
    private String experience;

    @NotBlank
    private String portfolioLink;

    @NotNull
    private Long studentId;

    @NotNull
    private Long collegeId;
}
