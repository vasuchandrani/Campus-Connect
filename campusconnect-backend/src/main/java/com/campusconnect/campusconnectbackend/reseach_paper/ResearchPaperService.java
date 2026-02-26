package com.campusconnect.campusconnectbackend.reseach_paper;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.reseach_paper.dto.req.ResearchRequestDto;
import com.campusconnect.campusconnectbackend.reseach_paper.dto.res.ResearchesResponseDto;
import com.campusconnect.campusconnectbackend.reviewer.dto.req.AddReviewerRequestDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResearchPaperService {
    private final ResearchPaperRepository researchPaperRepository;
    private final AuthService authService;
    private final StudentRepoService studentRepoService;

    // get DTO
    private ResearchesResponseDto getDto(ResearchPaper paper) {
        // create
        ResearchesResponseDto dto = new ResearchesResponseDto();
        // map the data
        dto.setId(paper.getId());
        dto.setTitle(paper.getTitle());
        dto.setContent(paper.getContent());
        dto.setImageUrl(paper.getImageUrl());
        dto.setImageUrl(paper.getImageUrl());
        dto.setStatus(paper.getStatus());
        dto.setCreatedAt(paper.getCreatedAt());

        if (paper.getReviewer() != null) {
            dto.setReviewerId(paper.getReviewer().getId());
        }
        if (paper.getReviewerFeedback() != null) {
            dto.setReviewerFeedback(paper.getReviewerFeedback());
        }
        return dto;
    }

    // get DTO -list
    private List<ResearchesResponseDto> getDtoList(List<ResearchPaper> papers) {
        // create
        List<ResearchesResponseDto> response = new ArrayList<>();

        for (ResearchPaper paper : papers) {
            response.add(getDto(paper));
        }
        return response;
    }

    // get my research-papers
    public List<ResearchesResponseDto> getMyResearchPapers() {

        // find student
        Long studentId = authService.getCurrentUserId();
        // find research-papers
        List<ResearchPaper> papers = researchPaperRepository.findAllByStudent_Id(studentId);

        return getDtoList(papers);
    }

    // get all research-papers
    public List<ResearchesResponseDto> getAllResearchPapers() {

        // find college
        Long collegeId = authService.getCurrentUserId();
        // find research-papers
        List<ResearchPaper> papers = researchPaperRepository.findAllByCollege_Id(collegeId);

        return getDtoList(papers);
    }

    // submit(create) new research-paper
    @Transactional
    public String submitPaper(ResearchRequestDto request) {
        try {
            // find student
            Long studentId = authService.getCurrentUserId();
            Student student = studentRepoService.getStudent(studentId);

            // find college
            College college = student.getCollege();

            // create
            ResearchPaper paper = new ResearchPaper();
            paper.setTitle(request.getTitle());
            paper.setContent(request.getContent());
            paper.setSubject(request.getSubject());
            paper.setImageUrl(request.getImageUrl());
            paper.setStudent(student);
            paper.setCollege(college);
            // save in db
            researchPaperRepository.save(paper);

            return "Your Research Paper has been submitted";
        }
        catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }


    /* College-Admin */

    // get all not-reviewed researches
    public List<ResearchesResponseDto> getNotReviewedResearches() {
            // find college-id
            Long collegeId = authService.getCurrentCollegeId();
            // find researches (not-reviewed)
            List<ResearchPaper> papers = researchPaperRepository.findAllByCollege_IdAndStatus(collegeId, "NOT REVIEWED");

            return getDtoList(papers);
    }

    // view particular research
    public ResearchesResponseDto getResearchPaper(Long id) {
        // find research-paper
        ResearchPaper research = researchPaperRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Research Paper not found")
        );

        return getDto(research);
    }
}
