package com.campusconnect.campusconnectbackend.reseach_paper;

import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResearchPaperService {
    private final ResearchPaperRepository researchPaperRepository;
    private final AuthService authService;

    // get my research-papers count
    public int getResearchPaperCount() {

        Long studentId = authService.getCurrentUserId();
        return researchPaperRepository.countByStudent_Id(studentId);
    }

    // get my research-papers
    public List<ResearchPaper> getMyResearchPapers() {

        Long studentId = authService.getCurrentUserId();
        return researchPaperRepository.findAllByStudent_Id(studentId);
    }

    // get all research-papers
    public List<ResearchPaper> getAllResearchPapers() {

        Long collegeId = authService.getCurrentUserId();
        return researchPaperRepository.findAllByCollege_Id(collegeId);
    }
}
