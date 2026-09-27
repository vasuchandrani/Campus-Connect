package com.campusconnect.campusconnectbackend.club.club_request.entity;

import com.campusconnect.campusconnectbackend.club.club_request.entity.enums.ClubRequestStatus;
import com.campusconnect.campusconnectbackend.college.entity.College;
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
        name = "club_requests",
        indexes = {
                @Index(
                        name = "club_request_college_idx",
                        columnList = "college_id"
                ),
                @Index(
                        name = "club_request_college_student_idx",
                        columnList = "college_id, student_id"
                ),
                @Index(
                        name = "club_request_student_idx",
                        columnList = "student_id"
                )
        }
)
public class ClubRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ClubRequestStatus status;

    @Column(name = "club_name", nullable = false)
    private String clubName;

    @Column(name = "club_description", nullable = false, columnDefinition = "TEXT")
    private String clubDescription;

    @Column(name = "proposal", nullable = false, columnDefinition = "TEXT")
    private String proposal;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}