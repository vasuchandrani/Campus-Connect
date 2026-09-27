package com.campusconnect.campusconnectbackend.journalist.entity;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.journalist.entity.enums.JournalistRequestStatus;
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
        name = "journalist_requests",
        indexes = {
                @Index(
                        name = "journalist_req_college_created_idx",
                        columnList = "college_id, created_at"
                )
        }
)
public class JournalistRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private Student student;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String why;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String experience;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private JournalistRequestStatus status = JournalistRequestStatus.PENDING;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String portfolioLink;

    @CreationTimestamp
    @Column(name = "created_at",  nullable = false, updatable = false)
    private LocalDateTime createdAt;
}