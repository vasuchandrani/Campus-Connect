package com.campusconnect.campusconnectbackend.newspaper.entity;


import com.campusconnect.campusconnectbackend.college_admin.entity.CollegeAdmin;
import com.campusconnect.campusconnectbackend.newspaper.entity.id.NewsGlobalizationVoteId;
import com.campusconnect.campusconnectbackend.newspaper.entity.enums.VoteType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(
        name = "news_globalization_votes",
        indexes = {
                @Index(
                        name = "news_globalization_vote_admin_idx",
                        columnList = "admin_id"
                )
        }
)
public class NewsGlobalizationVote {

    @EmbeddedId
    private NewsGlobalizationVoteId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "research_id", nullable = false)
    @MapsId("newsId")
    private NewsPaper newsPaper;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    @MapsId("adminId")
    private CollegeAdmin collegeAdmin;

    @Enumerated(EnumType.STRING)
    @Column(name = "vote_type", nullable = false)
    private VoteType voteType;
}
