package com.campusconnect.campusconnectbackend.dto.response.club;

import com.campusconnect.campusconnectbackend.dto.response.club.club_card.ClubMemberDto;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.util.*;

@Getter
@Setter
public class ClubTeamDto {

    private Long id;

    private Long clubId;

    private int membersCount;

    private List<ClubTeamMemberDto> members;

    private List<ClubMemberDto> clubMembers;

    @NotBlank
    private String name;

    @NotBlank
    private String description;
}
