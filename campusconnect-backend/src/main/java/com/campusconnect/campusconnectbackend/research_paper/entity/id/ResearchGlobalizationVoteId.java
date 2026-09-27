package com.campusconnect.campusconnectbackend.research_paper.entity.id;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ResearchGlobalizationVoteId implements Serializable {

    private Long researchId;
    private Long adminId;
}
