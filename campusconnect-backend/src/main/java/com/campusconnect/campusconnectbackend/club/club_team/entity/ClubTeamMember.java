package com.campusconnect.campusconnectbackend.club.club_team.entity;

import com.campusconnect.campusconnectbackend.club.club_member.entity.ClubMember;
import com.campusconnect.campusconnectbackend.club.club_team.entity.enums.TeamMemberRole;
import com.campusconnect.campusconnectbackend.club.club_team.entity.id.ClubTeamMemberId;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(
        name = "club_team_members",
        indexes = {
                @Index(
                        name = "team_member_member_idx",
                        columnList = "member_id"
                )
        }
)
public class ClubTeamMember {

    @EmbeddedId
    private ClubTeamMemberId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("teamId")
    @JoinColumn(name = "team_id", nullable = false)
    private ClubTeam team;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("memberId")
    @JoinColumn(name = "member_id", nullable = false)
    private ClubMember clubMember;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private TeamMemberRole role;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    public Student getStudent() {
        return clubMember != null ? clubMember.getStudent() : null;
    }

    public void setStudent(Student student) {
        // convenience
    }

    public String getImage() {
        return clubMember != null ? clubMember.getImage() : null;
    }

    public void setImage(String image) {
        if (clubMember != null) {
            clubMember.setImage(image);
        }
    }
}