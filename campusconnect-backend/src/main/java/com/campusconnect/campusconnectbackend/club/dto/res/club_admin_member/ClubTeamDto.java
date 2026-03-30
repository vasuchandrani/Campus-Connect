package com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member;

import com.campusconnect.campusconnectbackend.club.dto.res.club_card.ClubMemberDto;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;
import java.util.*;

@Getter
@Setter
public class ClubTeamDto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

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
