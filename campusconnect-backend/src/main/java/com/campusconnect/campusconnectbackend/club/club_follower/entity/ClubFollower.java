package com.campusconnect.campusconnectbackend.club.club_follower.entity;

import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.club_follower.entity.id.ClubFollowerId;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "club_followers")
public class ClubFollower {

    @EmbeddedId
    private ClubFollowerId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("clubId")
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentId")
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;
}

