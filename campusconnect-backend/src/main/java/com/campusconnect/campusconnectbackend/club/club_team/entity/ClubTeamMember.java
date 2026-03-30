package com.campusconnect.campusconnectbackend.club.club_team.entity;

import com.campusconnect.campusconnectbackend.club.club_team.entity.id.ClubTeamMemberId;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "club_team_members")
public class ClubTeamMember {

    @EmbeddedId
    private ClubTeamMemberId id;

    private String role;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("teamId")
    @JoinColumn(name = "team_id")
    private ClubTeam team;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentId")
    @JoinColumn(name = "student_id")
    private Student student;

    @CreationTimestamp
    @Column(name = "joined_at")
    private LocalDateTime joinedAt;
    
    private String image;
}