package com.campusconnect.campusconnectbackend.newspaper.entity;

import com.campusconnect.campusconnectbackend.newspaper.entity.id.GlobalNewsUpvoteId;
import com.campusconnect.campusconnectbackend.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "global_news_upvotes")
public class GlobalNewsUpvote {

    @EmbeddedId
    private GlobalNewsUpvoteId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "global_news_id", nullable = false)
    @MapsId("globalNewsId")
    private GlobalNewsPaper globalNewsPaper;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @MapsId("userId")
    private User user;
}
