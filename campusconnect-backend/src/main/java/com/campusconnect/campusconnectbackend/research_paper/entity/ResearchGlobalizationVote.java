package com.campusconnect.campusconnectbackend.research_paper.entity;

import com.campusconnect.campusconnectbackend.college_admin.entity.CollegeAdmin;
import com.campusconnect.campusconnectbackend.research_paper.entity.enums.VoteType;
import com.campusconnect.campusconnectbackend.research_paper.entity.id.ResearchGlobalizationVoteId;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(
        name = "research_globalization_votes",
        indexes = {
                @Index(
                        name = "research_globalization_vote_admin_idx",
                        columnList = "admin_id"
                )
        }
)
public class ResearchGlobalizationVote {

    @EmbeddedId
    private ResearchGlobalizationVoteId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "research_id", nullable = false)
    @MapsId("researchId")
    private ResearchPaper researchPaper;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    @MapsId("adminId")
    private CollegeAdmin collegeAdmin;

    @Enumerated(EnumType.STRING)
    @Column(name = "vote_type", nullable = false)
    private VoteType voteType;
}
