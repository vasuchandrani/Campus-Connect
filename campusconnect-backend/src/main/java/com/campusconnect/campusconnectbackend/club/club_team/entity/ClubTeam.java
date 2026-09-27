package com.campusconnect.campusconnectbackend.club.club_team.entity;

import com.campusconnect.campusconnectbackend.club.entity.Club;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(
        name = "club_teams",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "club_team_name_uk",
                        columnNames = {"club_id", "team_name"}
                )
        }
)
public class ClubTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @Column(name = "team_name", nullable = false)
    private String name;

    @Column(name = "team_description")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}