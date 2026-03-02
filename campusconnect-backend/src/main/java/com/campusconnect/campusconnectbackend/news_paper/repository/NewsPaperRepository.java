package com.campusconnect.campusconnectbackend.news_paper.repository;

import com.campusconnect.campusconnectbackend.news_paper.entity.NewsPaper;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.*;

public interface NewsPaperRepository extends JpaRepository<NewsPaper, Long> {

    @Query("""
        select n
        from NewsPaper n
        where n.college.id = :collegeId
        order by n.createdAt desc
    """)
    List<NewsPaper> findLatestByCollegeId(
            Long collegeId,
            Pageable pageable
    );

    List<NewsPaper> findAllByCollege_Id(Long collegeId);

    List<NewsPaper> findByJournalist_Id(Long journalistId);

    List<NewsPaper> findTop3ByJournalist_IdOrderByCreatedAtDesc(Long currentUserId);

    int countByCollege_Id(Long collegeId);
}
