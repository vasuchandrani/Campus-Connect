package com.campusconnect.campusconnectbackend.reseach_paper;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResearchPaperRepository extends JpaRepository<ResearchPaper, Long> {
    int countByStudent_Id(Long studentId);

    List<ResearchPaper> findAllByCollege_Id(Long collegeId);

    List<ResearchPaper> findAllByStudent_Id(Long studentId);

    List<ResearchPaper> findAllByCollege_IdAndStatus(Long collegeId, String status);
}
