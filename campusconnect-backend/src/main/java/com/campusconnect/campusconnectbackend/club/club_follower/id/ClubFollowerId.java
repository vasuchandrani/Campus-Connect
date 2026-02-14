package com.campusconnect.campusconnectbackend.club.club_follower.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
public class ClubFollowerId implements Serializable {

    @Column(name = "club_id")
    private Long clubId;

    @Column(name = "student_id")
    private Long studentId;
}

