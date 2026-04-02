package com.campusconnect.campusconnectbackend.reviewer.service;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college.service.CollegeService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.research_paper.entity.ResearchPaper;
import com.campusconnect.campusconnectbackend.research_paper.repository.ResearchPaperRepository;
import com.campusconnect.campusconnectbackend.reviewer.dto.req.AddReviewerRequestDto;
import com.campusconnect.campusconnectbackend.reviewer.dto.res.ReviewerDetailResponseDto;
import com.campusconnect.campusconnectbackend.reviewer.dto.res.ReviewerResponseDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.reviewer.ReviewerAssignmentDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.reviewer.entity.Reviewer;
import com.campusconnect.campusconnectbackend.reviewer.repository.ReviewerRepository;
import com.campusconnect.campusconnectbackend.reviewer.dto.res.ReviewerStatsResponseDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import org.springframework.cache.annotation.Caching;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewerService {
    private final ReviewerRepository reviewerRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final CollegeService collegeService;
    private final EmailDispatcherService emailDispatcherService;
    private final ResearchPaperRepository researchPaperRepository;
    private final StudentRepoService studentRepoService;

    // get DTO
    public ReviewerResponseDto getDto(Reviewer reviewer) {
        // create dto
        ReviewerResponseDto dto = new ReviewerResponseDto();
        if (reviewer == null) return dto;

        // map the data
        dto.setId(reviewer.getId());
        dto.setFullName(reviewer.getFullName());
        dto.setEmail(reviewer.getEmail());
        dto.setCreatedAt(reviewer.getCreatedAt());
        dto.setCollegeId(reviewer.getCollege().getId());

        return dto;
    }

    // get DTO -list
    public List<ReviewerResponseDto> getDtoList(List<Reviewer> reviewers) {
        // create response
        List<ReviewerResponseDto> response = new ArrayList<>();

        for (Reviewer reviewer : reviewers) {
            response.add(getDto(reviewer));
        }
        return response;
    }

    // generate password
    private String generatePassword() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    /* College-Admin */

    // create reviewer
    @Transactional
    @CacheEvict(value = "reviewers", key = "'college_' + @authService.getCurrentCollegeId()")
    public MessageResponseDto store(AddReviewerRequestDto request) {
        // generate password
        String password = generatePassword();

        // find college
        Long collegeId = authService.getCurrentCollegeId();
        College college = collegeService.getCollegeById(collegeId);

        // create
        Reviewer reviewer = new Reviewer();
        reviewer.setFullName(request.getFullName());
        reviewer.setEmail(request.getEmail());
        reviewer.setPasswordHash(passwordEncoder.encode(password));
        reviewer.setCollege(college);

        // save in db
        reviewerRepository.save(reviewer);

        // send mail
        ReviewerAssignmentDto dto = new ReviewerAssignmentDto();
        dto.setEmail(request.getEmail());
        dto.setPassword(password);
        dto.setDashboardLink("/campusconnect/reviewer/dashboard");
        emailDispatcherService.sendReviewerAssigned(dto);

        return new MessageResponseDto("Reviewer added successfully");
    }

    // get reviewer-name
    @Cacheable(value = "reviewer_name", key = "#reviewerId", sync = true)
    public String getName(Long reviewerId) {
        Reviewer reviewer = reviewerRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        return reviewer.getFullName();
    }

    // get all reviewers of college
    @Cacheable(value = "reviewers", key = "'college_' + #collegeId", sync = true)
    public List<ReviewerResponseDto> getReviewers(Long collegeId) {
        // find reviewers
        List<Reviewer> reviewer = reviewerRepository.findAllByCollege_Id(collegeId);

        return getDtoList(reviewer);
    }

    // remove reviewer
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "reviewer_name", key = "#reviewerId"),
            @CacheEvict(value = "reviewer_stats", key = "#reviewerId"),
            @CacheEvict(value = "reviewer_details", key = "#reviewerId"),
            @CacheEvict(value = "pending_researches", key = "'reviewer' + #reviewerId"),
            @CacheEvict(value = "reviewed_researches", key = "'reviewer' + #reviewerId"),
            @CacheEvict(value = "reviewers", key = "'college_' + @authService.getCurrentCollegeId()"),
    })
    public MessageResponseDto removeReviewer(Long reviewerId) {

        // check if exist
        if (!reviewerRepository.existsById(reviewerId)) {
            throw new RuntimeException("Reviewer not found!");
        }
        // delete
        reviewerRepository.deleteById(reviewerId);

        return new MessageResponseDto("Reviewer removed successfully");
    }

    // assign-reviewer
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "research_papers", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "not_reviewed_researches", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "under_review_researches", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "pending_researches", key = "'reviewer' + #reviewerId"),
            @CacheEvict(value = "reviewer_stats", key = "#reviewerId"),
    })
    public MessageResponseDto assignReviewer(Long id, Long reviewerId) {

        // find research-paper
        ResearchPaper paper = researchPaperRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Research Paper not found")
        );
        // find reviewer
        Reviewer reviewer = reviewerRepository.findById(reviewerId).orElseThrow(
                () -> new RuntimeException("Reviewer not found")
        );

        paper.setReviewer(reviewer);
        paper.setStatus("UNDER REVIEW");
        researchPaperRepository.save(paper);

        studentRepoService.evictStudentResearchCaches(paper.getStudent().getId());

        return new MessageResponseDto("Reviewer assigned successfully");
    }


    /* Reviewer */

    // get stats
    @Cacheable(value = "reviewer_stats", key = "#reviewerId", sync = true)
    public ReviewerStatsResponseDto getStats(Long reviewerId) {

        // find pending and reviewed
        int pending = researchPaperRepository.countByReviewer_IdAndStatus(reviewerId, "UNDER REVIEW");
        int reviewed = researchPaperRepository.countByReviewer_IdAndStatusIn(reviewerId, List.of("ACCEPTED", "REJECTED"));

        ReviewerStatsResponseDto stats = new ReviewerStatsResponseDto();
        stats.setPendingReviews(pending);
        stats.setReviewed(reviewed);

        return stats;
    }

    // get reviewer details
    @Cacheable(value = "reviewer_details", key = "#reviewerId", sync = true)
    public ReviewerDetailResponseDto getDetails(Long reviewerId) {

        Reviewer r = reviewerRepository.findById(reviewerId).orElseThrow(
                () -> new RuntimeException("Reviewer not found")
        );

        ReviewerDetailResponseDto dto = new ReviewerDetailResponseDto();
        dto.setReviewerName(r.getFullName());
        dto.setCollegeName(r.getCollege().getName());
        return dto;
    }
}
