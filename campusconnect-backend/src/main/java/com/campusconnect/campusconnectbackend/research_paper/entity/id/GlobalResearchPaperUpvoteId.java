package com.campusconnect.campusconnectbackend.research_paper.entity.id;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GlobalResearchPaperUpvoteId implements Serializable {

    private Long globalResearchPaperId;
    private Long userId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        GlobalResearchPaperUpvoteId that = (GlobalResearchPaperUpvoteId) o;
        return Objects.equals(globalResearchPaperId, that.globalResearchPaperId) && Objects.equals(userId, that.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(globalResearchPaperId, userId);
    }
}
