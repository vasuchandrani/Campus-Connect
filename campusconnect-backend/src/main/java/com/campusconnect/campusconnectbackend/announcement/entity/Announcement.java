package com.campusconnect.campusconnectbackend.announcement.entity;

import com.campusconnect.campusconnectbackend.announcement.entity.enums.AnnouncementStatus;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.college.entity.College;
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
        name = "club_announcements",
        indexes = {
                @Index(
                        name = "club_announcements_college_status_idx",
                        columnList = "college_id, status, created_at"
                ),
                @Index(
                        name = "club_announcements_club_status_idx",
                        columnList = "club_id, status, created_at"
                )
        }
)
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "club_id", nullable = false)
    private Club club;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private User deletedBy;

    @Column(name = "state", nullable = false)
    private int state = 0;
    // 0 - created by club-member
    // 1 - created or approved by club-admin
    // 2 - approved by mentor
    // 3 - approved by college-admin, means published

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private AnnouncementStatus status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
