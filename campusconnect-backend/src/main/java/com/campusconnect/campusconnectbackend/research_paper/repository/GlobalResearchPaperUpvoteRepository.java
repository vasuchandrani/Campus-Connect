package com.campusconnect.campusconnectbackend.research_paper.repository;

import com.campusconnect.campusconnectbackend.research_paper.entity.GlobalResearchPaperUpvote;
import com.campusconnect.campusconnectbackend.research_paper.entity.id.GlobalResearchPaperUpvoteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GlobalResearchPaperUpvoteRepository extends JpaRepository<GlobalResearchPaperUpvote, GlobalResearchPaperUpvoteId> {
    long countByIdGlobalResearchPaperId(Long globalResearchPaperId);
    boolean existsByIdGlobalResearchPaperIdAndIdUserId(Long globalResearchPaperId, Long userId);
    void deleteByIdGlobalResearchPaperIdAndIdUserId(Long globalResearchPaperId, Long userId);
}
