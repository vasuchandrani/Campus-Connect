package com.campusconnect.campusconnectbackend.club.club_follower.entity;

import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.user.entity.User;
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
        name = "club_user_followers",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "club_user_followers_uk",
                        columnNames = {"club_id", "user_id"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_club_user_follower_user",
                        columnList = "user_id"
                ),
                @Index(
                        name = "idx_club_user_follower_club",
                        columnList = "club_id"
                )
        }
)
public class ClubUserFollower {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "role")
    private String role;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ClubUserFollower(Club club, User user, String role) {
        this.club = club;
        this.user = user;
        this.role = role;
    }
}
