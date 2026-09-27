package com.campusconnect.campusconnectbackend.research_paper.entity.id;


import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ResearchUpvoteId implements Serializable {

    private Long researchId;
    private Long userId;
}
