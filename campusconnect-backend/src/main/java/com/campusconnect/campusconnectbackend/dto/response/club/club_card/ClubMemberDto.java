package com.campusconnect.campusconnectbackend.dto.response.club.club_card;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClubMemberDto {

    @NotBlank
    private String studentName;

    @NotNull
    private Long studentId;

    @NotBlank
    private String role;
}

