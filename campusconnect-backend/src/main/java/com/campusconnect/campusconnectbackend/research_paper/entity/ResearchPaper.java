package com.campusconnect.campusconnectbackend.research_paper.entity;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college_admin.entity.CollegeAdmin;
import com.campusconnect.campusconnectbackend.professor.entity.Professor;
import com.campusconnect.campusconnectbackend.research_paper.entity.enums.ResearchPaperStatus;
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
        name = "research_papers",
        indexes = {
                @Index(
                        name = "research_status_created_idx",
                        columnList = "status, created_at"
                ),
                @Index(
                        name = "research_college_status_created_idx",
                        columnList = "college_id, status, created_at"
                ),
                @Index(
                        name = "research_user_created_idx",
                        columnList = "user_id, created_at"
                ),
                @Index(
                        name = "research_professor_created_idx",
                        columnList = "professor_id, created_at"
                )
        }
)
public class ResearchPaper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id")
    private Professor professor;

    @Column(name = "prof_feedback", columnDefinition = "TEXT")
    private String profFeedback;

    @Column(name = "state", nullable = false)
    private int state = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private CollegeAdmin deletedBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ResearchPaperStatus status;

    @Column(name = "ai_score")
    private int aiScore;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "subject", nullable = false)
    private String subject;

    @Column(name = "department", nullable = false)
    private String department;

    @Column(name = "overview", nullable = false, columnDefinition = "TEXT")
    private String overview;

    @Column(name = "pdf_url", nullable = false, columnDefinition = "TEXT")
    private String pdfUrl;

    @Column(name = "website_url")
    private String websiteUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public void setStatus(String statusStr) {
        if (statusStr == null) {
            this.status = null;
            return;
        }
        String normalized = statusStr.trim().toUpperCase().replace(" ", "_");
        try {
            this.status = ResearchPaperStatus.valueOf(normalized);
        } catch (Exception e) {
            if ("ACCEPTED".equals(normalized)) {
                this.status = ResearchPaperStatus.ACCEPTED;
            } else if ("NOT_REVIEWED".equals(normalized)) {
                this.status = ResearchPaperStatus.NOT_REVIEWED;
            } else if ("UNDER_REVIEW".equals(normalized)) {
                this.status = ResearchPaperStatus.UNDER_REVIEW;
            } else {
                this.status = ResearchPaperStatus.STUDENT_SUBMITTED;
            }
        }
    }
}
