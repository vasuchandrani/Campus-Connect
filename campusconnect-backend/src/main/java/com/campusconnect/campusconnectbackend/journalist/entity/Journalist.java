package com.campusconnect.campusconnectbackend.journalist.entity;

import com.campusconnect.campusconnectbackend.college.entity.College;
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
        name = "journalists",
        indexes = {
                @Index(
                        name = "journalists_college_idx",
                        columnList = "college_id"
                ),
                @Index(
                        name = "journalists_accepted_by_idx",
                        columnList = "accepted_by"
                )
        }
)
public class Journalist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_by")
    private User acceptedBy;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "about")
    private String about;

    @Column(name = "portfolio_link")
    private String portfolioLink;

    public String getPortfolio() {
        return portfolioLink;
    }

    public void setPortfolio(String portfolio) {
        this.portfolioLink = portfolio;
    }

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    public LocalDateTime getCreatedAt() {
        return joinedAt;
    }
}

