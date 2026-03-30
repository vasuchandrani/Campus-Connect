package com.campusconnect.campusconnectbackend.journalist.dto.res;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class JournalistReqResponseDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull
    private Long id;

    @NotBlank
    private String journalistName;

    @NotBlank
    private String why;

    @NotBlank
    private String experience;

    @NotBlank
    private String portfolioLink;

    @NotNull
    private String studentId;

    @NotNull
    private Long collegeId;
}
