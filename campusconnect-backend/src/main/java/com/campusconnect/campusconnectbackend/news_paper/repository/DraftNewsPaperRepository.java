package com.campusconnect.campusconnectbackend.news_paper.repository;

import com.campusconnect.campusconnectbackend.news_paper.entity.DraftNewsPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DraftNewsPaperRepository extends JpaRepository<DraftNewsPaper,Long> {
    List<DraftNewsPaper> findByJournalist_Id(Long journalistId);

    int countByJournalist_Id(Long journalistId);
}
