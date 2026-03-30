package com.campusconnect.campusconnectbackend.club.dto.res.club_card;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
public class ClubMemberDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotBlank
    private String studentName;

    @NotNull
    private Long studentId;

    @NotBlank
    private String role;

    private String image;
}

