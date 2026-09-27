package com.campusconnect.campusconnectbackend.research_paper.entity;

import com.campusconnect.campusconnectbackend.college_admin.entity.CollegeAdmin;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(
        name = "global_research_papers",
        indexes = {
                @Index(name = "global_research_papers_paper_idx", columnList = "research_paper_id")
        }
)
public class GlobalResearchPaper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "research_paper_id", nullable = false, unique = true)
    private ResearchPaper researchPaper;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "published_by", nullable = false)
    private CollegeAdmin publishedBy;

    @CreationTimestamp
    @Column(name = "published_at", nullable = false, updatable = false)
    private LocalDateTime publishedAt;

    public String getTitle() {
        return researchPaper != null ? researchPaper.getTitle() : null;
    }

    public String getOverview() {
        return researchPaper != null ? researchPaper.getOverview() : null;
    }

    public String getPdfUrl() {
        return researchPaper != null ? researchPaper.getPdfUrl() : null;
    }

    public String getSubject() {
        return researchPaper != null ? researchPaper.getSubject() : null;
    }

    public String getDepartment() {
        return researchPaper != null ? researchPaper.getDepartment() : null;
    }

    public com.campusconnect.campusconnectbackend.user.entity.User getUser() {
        return researchPaper != null ? researchPaper.getUser() : null;
    }

    public com.campusconnect.campusconnectbackend.college.entity.College getCollege() {
        if (researchPaper != null && researchPaper.getCollege() != null) {
            return researchPaper.getCollege();
        }
        return publishedBy != null ? publishedBy.getCollege() : null;
    }

    public LocalDateTime getCreatedAt() {
        return researchPaper != null ? researchPaper.getCreatedAt() : publishedAt;
    }
}
