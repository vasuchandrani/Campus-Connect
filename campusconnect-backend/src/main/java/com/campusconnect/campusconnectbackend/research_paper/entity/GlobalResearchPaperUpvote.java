package com.campusconnect.campusconnectbackend.research_paper.entity;

import com.campusconnect.campusconnectbackend.research_paper.entity.id.GlobalResearchPaperUpvoteId;
import com.campusconnect.campusconnectbackend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "global_research_papers_upvotes")
public class GlobalResearchPaperUpvote {

    @EmbeddedId
    private GlobalResearchPaperUpvoteId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "global_research_paper_id", nullable = false)
    @MapsId("globalResearchPaperId")
    private GlobalResearchPaper globalResearchPaper;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @MapsId("userId")
    private User user;
}
