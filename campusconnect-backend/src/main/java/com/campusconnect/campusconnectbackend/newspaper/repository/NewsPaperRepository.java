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
        and CAST(n.status AS string) = :status
        order by n.createdAt desc
    """)
    List<NewsPaper> findLatestByCollegeId(
            @Param("collegeId") Long collegeId,
            @Param("status") String status,
            Pageable pageable
    );

    List<NewsPaper> findAllByCollege_Id(Long collegeId);

    List<NewsPaper> findByJournalist_Id(Long journalistId);

    @Query("""
        SELECT n
        FROM NewsPaper n
        WHERE n.journalist.id = :journalistId
        AND CAST(n.status AS string) = :status
        ORDER BY n.createdAt DESC
    """)
    List<NewsPaper> findLatestNewsPapers(
            @Param("journalistId") Long journalistId,
            @Param("status") String status,
            Pageable pageable
    );

    @Query("""
        SELECT n
        FROM NewsPaper n
        LEFT JOIN NewsUpvote u ON u.newsPaper.id = n.id
        WHERE n.journalist.id = :journalistId
        AND CAST(n.status AS string) IN ('PUBLISHED', 'APPROVED', 'GLOBALLY_PUBLISHED', 'GLOBALIZATION_REQUESTED')
        GROUP BY n
        ORDER BY COUNT(u) DESC, n.createdAt DESC
    """)
    List<NewsPaper> findTopNewsPapersByUpvotes(
            @Param("journalistId") Long journalistId,
            Pageable pageable
    );

    int countByCollege_Id(Long collegeId);

    int countByJournalist_Id(Long journalistId);

    @Query("SELECT n FROM NewsPaper n WHERE n.journalist.id = :journalistId AND CAST(n.status AS string) = :status")
    List<NewsPaper> findAllByJournalist_IdAndStatus(@Param("journalistId") Long journalistId, @Param("status") String status);

    @Query("SELECT n FROM NewsPaper n WHERE n.college.id = :collegeId AND CAST(n.status AS string) = :status")
    List<NewsPaper> findAllByCollege_IdAndStatus(@Param("collegeId") Long collegeId, @Param("status") String status);

    @Query("SELECT COUNT(n) FROM NewsPaper n WHERE n.college.id = :collegeId AND CAST(n.status AS string) = :status")
    int countByCollege_IdAndStatus(@Param("collegeId") Long collegeId, @Param("status") String status);

    @Query("SELECT COUNT(n) FROM NewsPaper n WHERE n.journalist.id = :journalistId AND CAST(n.status AS string) = :status")
    int countByJournalist_IdAndStatus(@Param("journalistId") Long journalistId, @Param("status") String status);

    @Query("""
        SELECT n FROM NewsPaper n
        WHERE CAST(n.status AS string) = 'GLOBALIZATION_REQUESTED'
        ORDER BY n.createdAt DESC
    """)
    List<NewsPaper> findPendingGlobalRequests();

    @Query("""
        SELECT n FROM NewsPaper n
        WHERE n.college.id = :collegeId
        AND CAST(n.status AS string) IN ('PUBLISHED', 'APPROVED', 'GLOBALLY_PUBLISHED', 'GLOBALIZATION_REQUESTED')
        ORDER BY n.createdAt DESC
    """)
    List<NewsPaper> findCampusNewsPapers(@Param("collegeId") Long collegeId);
}
