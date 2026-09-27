package com.campusconnect.campusconnectbackend.club.entity;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.professor.entity.Professor;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(
        name = "clubs",
        indexes = {
                @Index(
                        name = "club_college_idx",
                        columnList = "college_id"
                ),
                @Index(
                        name = "club_mentor_idx",
                        columnList = "mentor_id"
                ),
                @Index(
                        name = "club_admin_idx",
                        columnList = "admin_id"
                )
        }
)
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private Professor mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private Student admin;

    @Column(name = "club_name", nullable = false)
    private String name;

    @Column(name = "tagline_1", length = 60)
    private String tagline1;

    @Column(name = "tagline_2", length = 60)
    private String tagline2;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "website")
    private String website;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "founded_by", nullable = false, updatable = false)
    private String foundedBy;

    @Column(name = "announcement_permission", nullable = false)
    private String announcementPermission = "ADMIN_ONLY";

    @Column(name = "event_permission", nullable = false)
    private String eventPermission = "ADMIN_ONLY";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}