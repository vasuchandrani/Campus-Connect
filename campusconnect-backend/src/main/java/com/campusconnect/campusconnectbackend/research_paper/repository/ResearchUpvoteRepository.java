package com.campusconnect.campusconnectbackend.research_paper.repository;

import com.campusconnect.campusconnectbackend.research_paper.entity.ResearchUpvote;
import com.campusconnect.campusconnectbackend.research_paper.entity.id.ResearchUpvoteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ResearchUpvoteRepository extends JpaRepository<ResearchUpvote, ResearchUpvoteId> {
    long countByIdResearchId(Long researchId);
    boolean existsByIdResearchIdAndIdUserId(Long researchId, Long userId);
    void deleteByIdResearchIdAndIdUserId(Long researchId, Long userId);
}
