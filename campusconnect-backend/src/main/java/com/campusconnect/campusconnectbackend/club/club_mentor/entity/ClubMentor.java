package com.campusconnect.campusconnectbackend.club.club_mentor.entity;

import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.professor.entity.Professor;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(
        name = "club_mentors",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "club_mentor_professor_uk",
                        columnNames = {"club_id", "professor_id"}
                )
        },
        indexes = {
                @Index(
                        name = "club_mentor_prof_idx",
                        columnList = "professor_id"
                ),
                @Index(
                        name = "club_mentor_club_idx",
                        columnList = "club_id"
                )
        }
)
public class ClubMentor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id", nullable = false)
    private Professor professor;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "role")
    private String role = "MENTOR";

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @CreationTimestamp
    @Column(name = "assigned_at", nullable = false, updatable = false)
    private LocalDateTime assignedAt;

    public ClubMentor(Club club, Professor professor, String passwordHash, String role) {
        this.club = club;
        this.professor = professor;
        this.passwordHash = passwordHash;
        this.role = role != null ? role : "MENTOR";
        this.isActive = true;
    }
}
