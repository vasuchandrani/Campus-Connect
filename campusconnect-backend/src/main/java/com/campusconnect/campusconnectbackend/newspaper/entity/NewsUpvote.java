package com.campusconnect.campusconnectbackend.newspaper.entity;

import com.campusconnect.campusconnectbackend.newspaper.entity.id.NewsUpvoteId;
import com.campusconnect.campusconnectbackend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "news_upvotes")
public class NewsUpvote {

    @EmbeddedId
    private NewsUpvoteId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "news_id", nullable = false)
    @MapsId("newsId")
    private NewsPaper newsPaper;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @MapsId("userId")
    private User user;
}
