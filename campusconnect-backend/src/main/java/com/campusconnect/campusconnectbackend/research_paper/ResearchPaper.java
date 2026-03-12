package com.campusconnect.campusconnectbackend.research_paper;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.reviewer.Reviewer;
import com.campusconnect.campusconnectbackend.student.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "research_paper")
public class ResearchPaper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "overview", nullable = false)
    private String overview;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "pdf_url")
    private String pdfUrl;

    @Column(name = "status", nullable = false)
    private String status = "NOT REVIEWED";

    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "reviewer_feedback")
    private String reviewerFeedback;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private Reviewer reviewer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;
}
