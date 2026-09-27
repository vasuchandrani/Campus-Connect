package com.campusconnect.campusconnectbackend.club.club_team.entity.id;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ClubTeamMemberId implements Serializable {

    private Long teamId;
    private Long memberId;

    public Long getStudentId() {
        return memberId;
    }

    public void setStudentId(Long studentId) {
        this.memberId = studentId;
    }
}

