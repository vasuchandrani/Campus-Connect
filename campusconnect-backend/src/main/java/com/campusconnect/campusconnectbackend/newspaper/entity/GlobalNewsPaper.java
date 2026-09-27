package com.campusconnect.campusconnectbackend.newspaper.entity;

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
        name = "global_news_papers",
        indexes = {
                @Index(name = "global_news_papers_paper_idx", columnList = "news_paper_id")
        }
)
public class GlobalNewsPaper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "news_paper_id", nullable = false, unique = true)
    private NewsPaper newsPaper;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "published_by", nullable = false)
    private CollegeAdmin publishedBy;

    @CreationTimestamp
    @Column(name = "published_at", nullable = false, updatable = false)
    private LocalDateTime publishedAt;

    public String getTitle() {
        return newsPaper != null ? newsPaper.getTitle() : null;
    }

    public String getContent() {
        return newsPaper != null ? newsPaper.getContent() : null;
    }

    public String getImageUrl() {
        return newsPaper != null ? newsPaper.getImageUrl() : null;
    }

    public com.campusconnect.campusconnectbackend.journalist.entity.Journalist getJournalist() {
        return newsPaper != null ? newsPaper.getJournalist() : null;
    }

    public com.campusconnect.campusconnectbackend.college.entity.College getCollege() {
        if (newsPaper != null && newsPaper.getCollege() != null) {
            return newsPaper.getCollege();
        }
        return publishedBy != null ? publishedBy.getCollege() : null;
    }

    public LocalDateTime getCreatedAt() {
        return newsPaper != null ? newsPaper.getCreatedAt() : publishedAt;
    }
}
