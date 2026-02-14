package com.campusconnect.campusconnectbackend.reviewer.service;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.college.service.CollegeService;
import com.campusconnect.campusconnectbackend.dto.request.reviewer.AddReviewerRequestDto;
import com.campusconnect.campusconnectbackend.mail_service.dto.reviewer.ReviewerAssignmentDto;
import com.campusconnect.campusconnectbackend.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.reviewer.Reviewer;
import com.campusconnect.campusconnectbackend.reviewer.ReviewerRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewerService {
    private final ReviewerRepository reviewerRepository;
    private final AuthService authService;
    private final PasswordEncoder passwordEncoder;
    private final CollegeService collegeService;
    private final EmailDispatcherService emailDispatcherService;

    // create reviewer
    @Transactional
    public boolean store(AddReviewerRequestDto request) {
        try {
            // find college
            Long collegeId = authService.getCurrentCollegeId();
            College college = collegeService.getCollegeById(collegeId);

            // create
            Reviewer reviewer = new Reviewer();
            reviewer.setFullName(request.getFullName());
            reviewer.setEmail(request.getEmail());
            reviewer.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            reviewer.setCollege(college);

            // save in db
            reviewerRepository.save(reviewer);

            // send mail
            ReviewerAssignmentDto dto = new ReviewerAssignmentDto();
            dto.setEmail(request.getEmail());
            dto.setPassword(request.getPassword());
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
    public List<Reviewer> getReviewers() {
        // find college-id
        Long collegeId = authService.getCurrentCollegeId();

        return reviewerRepository.findAllByCollege_Id(collegeId);
    }
}
