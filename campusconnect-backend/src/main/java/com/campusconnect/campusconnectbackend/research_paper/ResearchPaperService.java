package com.campusconnect.campusconnectbackend.research_paper;

import com.campusconnect.campusconnectbackend.integrations.cloudinary.service.CloudinaryService;
import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.research_paper.dto.req.ResearchRequestDto;
import com.campusconnect.campusconnectbackend.research_paper.dto.res.ResearchesResponseDto;
import com.campusconnect.campusconnectbackend.reviewer.Reviewer;
import com.campusconnect.campusconnectbackend.reviewer.ReviewerRepository;
import com.campusconnect.campusconnectbackend.reviewer.dto.req.ReviewRequestDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResearchPaperService {
    private final ResearchPaperRepository researchPaperRepository;
    private final AuthService authService;
    private final StudentRepoService studentRepoService;
    private final ReviewerRepository reviewerRepository;
    private final CloudinaryService cloudinaryService;

    // get DTO
    private ResearchesResponseDto getDto(ResearchPaper paper) {
        // create
        ResearchesResponseDto dto = new ResearchesResponseDto();
        if (paper == null) return dto;

        // map the data
        dto.setId(paper.getId());
        dto.setTitle(paper.getTitle());
        dto.setOverview(paper.getOverview());
        dto.setPdfUrl(paper.getPdfUrl());
        dto.setStatus(paper.getStatus());
        dto.setSubject(paper.getSubject());
        dto.setDepartment(paper.getDepartment());
        dto.setCreatedAt(paper.getCreatedAt());

        if (paper.getReviewer() != null) {
            dto.setReviewerId(paper.getReviewer().getId());
            dto.setReviewerName(paper.getReviewer().getFullName());
            dto.setReviewerEmail(paper.getReviewer().getEmail());
        }
        if (paper.getReviewerFeedback() != null) {
            dto.setReviewerFeedback(paper.getReviewerFeedback());
        }
        dto.setStudentId(paper.getStudent().getStudentId());
        dto.setStudentName(paper.getStudent().getFullName());
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
        Long collegeId = authService.getCurrentCollegeId();
        // find research-papers
        List<ResearchPaper> papers = researchPaperRepository.findAllByCollege_IdAndStatus(collegeId, "ACCEPTED");

        return getDtoList(papers);
    }

    // submit(create) new research-paper
    @Transactional
    public MessageResponseDto submitPaper(ResearchRequestDto request, MultipartFile pdf) {

        // find student
        Long studentId = authService.getCurrentUserId();
        Student student = studentRepoService.getStudent(studentId);

        // find college
        College college = student.getCollege();

        // store pdf on cloudinary
        String pdfUrl = cloudinaryService.uploadPdf(pdf, studentId);

        // create
        ResearchPaper paper = new ResearchPaper();
        paper.setTitle(request.getTitle());
        paper.setOverview(request.getOverview());
        paper.setSubject(request.getSubject());
        paper.setDepartment(request.getDept());
        paper.setPdfUrl(pdfUrl);
        paper.setStudent(student);
        paper.setCollege(college);
        // save in db
        researchPaperRepository.save(paper);

        return new MessageResponseDto("Your Research Paper has been submitted");
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

    // get all under-reviewed researches
    public List<ResearchesResponseDto> getUnderReviewedResearches() {
        // find college-id
        Long collegeId = authService.getCurrentCollegeId();
        // find researches (not-reviewed)
        List<ResearchPaper> papers = researchPaperRepository.findAllByCollege_IdAndStatus(collegeId, "UNDER REVIEW");

        return getDtoList(papers);
    }

    // get all reviewed researches
    public List<ResearchesResponseDto> getReviewedResearches() {
        // find college-id
        Long collegeId = authService.getCurrentCollegeId();
        // find researches (not-reviewed)
        List<ResearchPaper> papers = researchPaperRepository.findAllByCollege_IdAndStatusIn(collegeId, List.of("ACCEPTED", "REJECTED"));

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


    /* Reviewer */

    // get all researches which are pending to review for reviewer
    public List<ResearchesResponseDto> getAllPendingByReviewer() {

        // find reviewer
        Long reviewerId = authService.getCurrentUserId();
        // find research-papers
        List<ResearchPaper> researches = researchPaperRepository.findAllByReviewer_IdAndStatus(reviewerId, "UNDER REVIEW");

        return getDtoList(researches);
    }

    // get all researches which are reviewed by reviewer
    public List<ResearchesResponseDto> getAllReviewedByReviewer() {

        // find reviewer
        Long reviewerId = authService.getCurrentUserId();
        // find research-papers
        List<ResearchPaper> researches = researchPaperRepository.findAllByReviewer_IdAndStatusIn(reviewerId, List.of("ACCEPTED", "REJECTED"));

        return getDtoList(researches);
    }

    // research paper accepted
    @Transactional
    public MessageResponseDto acceptResearch(Long researchId, ReviewRequestDto request, Long reviewerId) {

        // find reviewer
        Reviewer reviewer = reviewerRepository.findById(reviewerId).orElseThrow(
                () -> new RuntimeException("Reviewer not found")
        );
        // find research-paper
        ResearchPaper research = researchPaperRepository.findById(researchId).orElseThrow(
                () -> new RuntimeException("Research Paper not found")
        );
        // modify research
        research.setReviewer(reviewer);
        research.setReviewerFeedback(request.getFeedback());
        research.setStatus("ACCEPTED");

        researchPaperRepository.save(research);

        return new MessageResponseDto("Research-Paper has been accepted & published");
    }

    // research paper rejected
    @Transactional
    public MessageResponseDto rejectResearch(Long researchId, ReviewRequestDto request, Long reviewerId) {

        // find reviewer
        Reviewer reviewer = reviewerRepository.findById(reviewerId).orElseThrow(
                () -> new RuntimeException("Reviewer not found")
        );
        // find research-paper
        ResearchPaper research = researchPaperRepository.findById(researchId).orElseThrow(
                () -> new RuntimeException("Research Paper not found")
        );
        // modify research
        research.setReviewer(reviewer);
        research.setReviewerFeedback(request.getFeedback());
        research.setStatus("REJECTED");

        researchPaperRepository.save(research);

        return new MessageResponseDto("Research-Paper has been rejected");
    }
}
