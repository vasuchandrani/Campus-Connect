package com.campusconnect.campusconnectbackend.club.club_member.id;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
public class ClubMemberId implements Serializable {

    private Long clubId;
    private Long studentId;
}

