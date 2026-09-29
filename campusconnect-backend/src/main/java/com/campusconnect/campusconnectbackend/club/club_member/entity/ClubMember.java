package com.campusconnect.campusconnectbackend.club.club_member.entity;

import com.campusconnect.campusconnectbackend.club.club_member.entity.enums.ClubRoles;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(
        name = "club_members",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "club_members_student_uk",
                        columnNames = {"club_id", "student_id"}
                )
        },
        indexes = {
                @Index(
                        name = "club_member_student_idx",
                        columnList = "student_id"
                )
        }
)
public class ClubMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private ClubRoles role;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @Column(name = "password_hash")
    private String passwordHash;


    public void setRole(String roleName) {
        try {
            this.role = ClubRoles.valueOf(roleName.toUpperCase());
        } catch (Exception e) {
            this.role = ClubRoles.MEMBER;
        }
    }

    public void setRole(ClubRoles role) {
        this.role = role;
    }

    public User getUser() {
        return student != null ? student.getUser() : null;
    }

    public void setUser(User user) {
        // convenience
    }

    public String getImage() {
        return student != null && student.getUser() != null ? student.getUser().getProfilePic() : null;
    }

    public void setImage(String image) {
        if (student != null && student.getUser() != null) {
            student.getUser().setProfilePic(image);
        }
    }
}
