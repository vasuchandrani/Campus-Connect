package com.campusconnect.campusconnectbackend.reseach_paper;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ResearchPaperRepository extends JpaRepository<ResearchPaper, Long> {

    List<ResearchPaper> findAllByCollege_Id(Long collegeId);

    List<ResearchPaper> findAllByStudent_Id(Long studentId);

    List<ResearchPaper> findAllByCollege_IdAndStatus(Long collegeId, String status);

    int countByReviewer_IdAndStatus(Long reviewerId, String status);

    int countByReviewer_IdAndStatusIn(Long reviewerId, Collection<String> statuses);

    List<ResearchPaper> findAllByReviewer_IdAndStatus(Long reviewerId, String status);

    List<ResearchPaper> findAllByReviewer_IdAndStatusIn(Long reviewerId, Collection<String> statuses);
}
