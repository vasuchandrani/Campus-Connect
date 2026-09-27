package com.campusconnect.campusconnectbackend.research_paper.repository;

import com.campusconnect.campusconnectbackend.research_paper.entity.GlobalResearchPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GlobalResearchPaperRepository extends JpaRepository<GlobalResearchPaper, Long> {

    @Query("SELECT g FROM GlobalResearchPaper g " +
           "LEFT JOIN FETCH g.researchPaper rp " +
           "LEFT JOIN FETCH rp.user u " +
           "LEFT JOIN FETCH rp.college c " +
           "ORDER BY g.publishedAt DESC")
    List<GlobalResearchPaper> findAllWithDetails();

    List<GlobalResearchPaper> findAllByOrderByPublishedAtDesc();

    boolean existsByResearchPaper_Id(Long researchPaperId);

    java.util.Optional<GlobalResearchPaper> findByResearchPaper_Id(Long researchPaperId);
}
