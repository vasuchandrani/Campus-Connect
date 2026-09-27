package com.campusconnect.campusconnectbackend.research_paper.repository;

import com.campusconnect.campusconnectbackend.research_paper.entity.ResearchPaper;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ResearchPaperRepository extends JpaRepository<ResearchPaper, Long> {

    List<ResearchPaper> findAllByCollege_Id(Long collegeId);

    List<ResearchPaper> findAllByUser_Id(Long userId);

    int countByUser_Id(Long userId);

    @Query("SELECT rp FROM ResearchPaper rp WHERE rp.user.id = :userId ORDER BY rp.createdAt DESC")
    List<ResearchPaper> findByAuthorUserId(@Param("userId") Long userId);

    @Query("""
        SELECT rp FROM ResearchPaper rp
        WHERE rp.college.id = :collegeId
        AND (
            CAST(rp.status AS string) = :status
            OR REPLACE(CAST(rp.status AS string), '_', ' ') = :status
            OR CAST(rp.status AS string) = REPLACE(:status, ' ', '_')
            OR (:status IN ('NOT REVIEWED', 'NOT_REVIEWED') AND CAST(rp.status AS string) IN ('NOT_REVIEWED', 'STUDENT_SUBMITTED'))
            OR (:status IN ('UNDER REVIEW', 'UNDER_REVIEW') AND CAST(rp.status AS string) IN ('UNDER_REVIEW', 'UNDER REVIEW'))
            OR (:status IN ('ACCEPTED', 'APPROVED') AND CAST(rp.status AS string) IN ('ACCEPTED', 'APPROVED'))
        )
        ORDER BY rp.createdAt DESC
    """)
    List<ResearchPaper> findAllByCollege_IdAndStatus(@Param("collegeId") Long collegeId, @Param("status") String status);

    @Query("""
        SELECT COUNT(rp) FROM ResearchPaper rp
        WHERE rp.professor.id = :professorId
        AND (
            CAST(rp.status AS string) = :status
            OR REPLACE(CAST(rp.status AS string), '_', ' ') = :status
            OR CAST(rp.status AS string) = REPLACE(:status, ' ', '_')
            OR (:status IN ('UNDER REVIEW', 'UNDER_REVIEW') AND CAST(rp.status AS string) IN ('UNDER_REVIEW', 'UNDER REVIEW'))
        )
    """)
    int countByProfessor_IdAndStatus(@Param("professorId") Long professorId, @Param("status") String status);

    @Query("""
        SELECT COUNT(rp) FROM ResearchPaper rp
        WHERE rp.professor.id = :professorId
        AND (
            CAST(rp.status AS string) IN :statuses
            OR REPLACE(CAST(rp.status AS string), '_', ' ') IN :statuses
        )
    """)
    int countByProfessor_IdAndStatusIn(@Param("professorId") Long professorId, @Param("statuses") Collection<String> statuses);

    @Query("""
        SELECT rp FROM ResearchPaper rp
        WHERE rp.professor.id = :professorId
        AND (
            CAST(rp.status AS string) = :status
            OR REPLACE(CAST(rp.status AS string), '_', ' ') = :status
            OR CAST(rp.status AS string) = REPLACE(:status, ' ', '_')
            OR (:status IN ('UNDER REVIEW', 'UNDER_REVIEW') AND CAST(rp.status AS string) IN ('UNDER_REVIEW', 'UNDER REVIEW'))
        )
        ORDER BY rp.createdAt DESC
    """)
    List<ResearchPaper> findAllByProfessor_IdAndStatus(@Param("professorId") Long professorId, @Param("status") String status);

    @Query("""
        SELECT rp FROM ResearchPaper rp
        WHERE rp.professor.id = :professorId
        AND (
            CAST(rp.status AS string) IN :statuses
            OR REPLACE(CAST(rp.status AS string), '_', ' ') IN :statuses
        )
        ORDER BY rp.createdAt DESC
    """)
    List<ResearchPaper> findAllByProfessor_IdAndStatusIn(@Param("professorId") Long professorId, @Param("statuses") Collection<String> statuses);

    @Query("""
        SELECT rp FROM ResearchPaper rp
        WHERE rp.college.id = :collegeId
        AND (
            CAST(rp.status AS string) IN :statuses
            OR REPLACE(CAST(rp.status AS string), '_', ' ') IN :statuses
        )
        ORDER BY rp.createdAt DESC
    """)
    List<ResearchPaper> findAllByCollege_IdAndStatusIn(@Param("collegeId") Long collegeId, @Param("statuses") Collection<String> statuses);

    @Query("""
        SELECT rp FROM ResearchPaper rp
        WHERE CAST(rp.status AS string) = 'GLOBALIZATION_REQUESTED'
        ORDER BY rp.createdAt DESC
    """)
    List<ResearchPaper> findPendingGlobalRequests();

    @Query("""
        SELECT rp FROM ResearchPaper rp
        WHERE rp.college.id = :collegeId
        AND (
            CAST(rp.status AS string) IN ('APPROVED', 'ACCEPTED', 'GLOBALLY_PUBLISHED', 'GLOBALIZATION_REQUESTED', 'PROFESSOR_SUBMITTED')
            OR rp.state = 1
        )
        ORDER BY rp.createdAt DESC
    """)
    List<ResearchPaper> findCampusResearches(@Param("collegeId") Long collegeId);
}
