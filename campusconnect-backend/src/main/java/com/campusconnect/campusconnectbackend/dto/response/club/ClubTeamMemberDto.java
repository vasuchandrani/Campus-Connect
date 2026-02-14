package com.campusconnect.campusconnectbackend.dto.response.club;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClubTeamMemberDto {

    @NotBlank
    private String studentName;

    @NotNull
    private Long studentId;
}
