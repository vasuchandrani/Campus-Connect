package com.campusconnect.campusconnectbackend.club.club_member.entity;

import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.club_member.entity.id.ClubMemberId;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "club_member")
public class ClubMember {

    @EmbeddedId
    private ClubMemberId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("clubId")
    @JoinColumn(name = "club_id")
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentId")
    @JoinColumn(name = "student_id")
    private Student student;

    private String image;

    @Column(name = "role", nullable = false)
    private String role;
}
