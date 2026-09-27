package com.campusconnect.campusconnectbackend.newspaper.entity.id;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class NewsUpvoteId implements Serializable {

    private Long newsId;
    private Long userId;
}
