package com.campusconnect.campusconnectbackend.research_paper.entity;

import com.campusconnect.campusconnectbackend.research_paper.entity.id.ResearchUpvoteId;
import com.campusconnect.campusconnectbackend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "research_papers_upvotes")
public class ResearchUpvote {

    @EmbeddedId
    private ResearchUpvoteId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "research_id", nullable = false)
    @MapsId("researchId")
    private ResearchPaper researchPaper;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @MapsId("userId")
    private User user;
}
