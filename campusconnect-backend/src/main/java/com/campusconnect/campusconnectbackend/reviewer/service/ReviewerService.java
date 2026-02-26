package com.campusconnect.campusconnectbackend.reviewer.service;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.college.service.CollegeService;
import com.campusconnect.campusconnectbackend.reseach_paper.ResearchPaper;
import com.campusconnect.campusconnectbackend.reseach_paper.ResearchPaperRepository;
import com.campusconnect.campusconnectbackend.reseach_paper.ResearchPaperService;
import com.campusconnect.campusconnectbackend.reviewer.dto.req.AddReviewerRequestDto;
import com.campusconnect.campusconnectbackend.reviewer.dto.res.ReviewerResponseDto;
import com.campusconnect.campusconnectbackend.mail_service.dto.reviewer.ReviewerAssignmentDto;
import com.campusconnect.campusconnectbackend.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.reviewer.Reviewer;
import com.campusconnect.campusconnectbackend.reviewer.ReviewerRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
    private final ResearchPaperService researchPaperService;
    private final ResearchPaperRepository researchPaperRepository;

    // get DTO
    public ReviewerResponseDto getDto(Reviewer reviewer) {
        // create dto
        ReviewerResponseDto dto = new ReviewerResponseDto();
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

    // create reviewer
    @Transactional
    public boolean store(AddReviewerRequestDto request) {
        try {
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
            return true;
        }
        catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    // get reviewer-name
    public String getName(Long userId) {
        Reviewer reviewer = reviewerRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        return reviewer.getFullName();
    }

    // get all reviewers of college
    public List<ReviewerResponseDto> getReviewers() {
        // find college-id
        Long collegeId = authService.getCurrentCollegeId();
        // find reviewers
        List<Reviewer> reviewer = reviewerRepository.findAllByCollege_Id(collegeId);

        return getDtoList(reviewer);
    }

    // remove reviewer
    @Transactional
    public boolean removeReviewer(Long reviewerId) {
        try {
            // delete
            reviewerRepository.deleteById(reviewerId);
            return true;
        }
        catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    // assign-reviewer
    @Transactional
    public String assignReviewer(Long id, AddReviewerRequestDto request) {
        try {
            // find research-paper
            ResearchPaper paper = researchPaperRepository.findById(id).orElseThrow(
                    () -> new RuntimeException("Research Paper not found")
            );
            // find reviewer
            Reviewer reviewer = reviewerRepository.findByEmail(request.getEmail()).orElse(null);

            if (reviewer != null) {
                // modify paper
                paper.setReviewer(reviewer);
                paper.setStatus("UNDER REVIEW");
            }
            else {
                // create new reviewer
                Reviewer newReviewer = new Reviewer();
                newReviewer.setFullName(request.getFullName());
                newReviewer.setEmail(request.getEmail());
                // save in db
                reviewerRepository.save(newReviewer);

                // modify paper
                paper.setReviewer(newReviewer);
                paper.setStatus("UNDER REVIEW");
            }
            researchPaperRepository.save(paper);

            return "Reviewer Assigned";
        }
        catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }
}
