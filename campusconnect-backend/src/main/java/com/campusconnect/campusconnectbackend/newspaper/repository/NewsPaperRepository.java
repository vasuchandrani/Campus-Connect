package com.campusconnect.campusconnectbackend.newspaper.repository;

import com.campusconnect.campusconnectbackend.newspaper.entity.NewsPaper;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.*;

public interface NewsPaperRepository extends JpaRepository<NewsPaper, Long> {

    @Query("""
        select n
        from NewsPaper n
        where n.college.id = :collegeId
        and n.status = :status
        order by n.createdAt desc
    """)
    List<NewsPaper> findLatestByCollegeId(
            Long collegeId,
            String status,
            Pageable pageable
    );

    List<NewsPaper> findAllByCollege_Id(Long collegeId);

    List<NewsPaper> findByJournalist_Id(Long journalistId);

    @Query("""
        SELECT n
        FROM NewsPaper n
        WHERE n.journalist.id = :journalistId
        AND n.status = :status
        ORDER BY n.createdAt DESC
    """)
    List<NewsPaper> findLatestNewsPapers(
            @Param("journalistId") Long journalistId,
            @Param("status") String status,
            Pageable pageable
    );

    int countByCollege_Id(Long collegeId);

    int countByJournalist_Id(Long journalistId);

    List<NewsPaper> findAllByJournalist_IdAndStatus(Long journalistId, String status);

    List<NewsPaper> findAllByCollege_IdAndStatus(Long collegeId, String status);

    int countByCollege_IdAndStatus(Long collegeId, String status);

    int countByJournalist_IdAndStatus(Long journalistId, String status);
}
