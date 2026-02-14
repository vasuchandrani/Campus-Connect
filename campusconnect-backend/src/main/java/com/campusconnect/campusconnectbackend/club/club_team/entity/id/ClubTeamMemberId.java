package com.campusconnect.campusconnectbackend.club.club_team.entity.id;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
public class ClubTeamMemberId implements Serializable {

    private Long teamId;
    private Long studentId;
}

