package com.campusconnect.campusconnectbackend.newspaper.entity;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college_admin.entity.CollegeAdmin;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.newspaper.entity.enums.NewsPapersStatus;
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
        name = "news_papers",
        indexes = {
                @Index(
                        name = "news_status_created_idx",
                        columnList = "status, created_at"
                ),
                @Index(
                        name = "news_college_status_created_idx",
                        columnList = "college_id, status, created_at"
                ),
                @Index(
                        name = "news_journalist_created_idx",
                        columnList = "journalist_id, created_at"
                ),
                @Index(
                        name = "news_accepted_by_created_idx",
                        columnList = "accepted_by, created_at"
                )
        }
)
public class NewsPaper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    private College college;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "journalist_id", nullable = false)
    private Journalist journalist;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_by")
    private User acceptedBy;

    @Column(name = "state", nullable = false)
    private int state = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private NewsPapersStatus status;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "cover_image", nullable = false, columnDefinition = "TEXT")
    private String coverImage;

    @Column(name = "abstract_text", columnDefinition = "TEXT")
    private String abstractText;

    @Column(name = "pdf_url", columnDefinition = "TEXT")
    private String pdfUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deleted_by")
    private CollegeAdmin deleteBy;

    public String getImageUrl() {
        return coverImage;
    }

    public void setImageUrl(String imageUrl) {
        this.coverImage = imageUrl;
    }

    public void setStatus(String statusStr) {
        try {
            this.status = NewsPapersStatus.valueOf(statusStr);
        } catch (Exception e) {
            // default or ignore
        }
    }
}