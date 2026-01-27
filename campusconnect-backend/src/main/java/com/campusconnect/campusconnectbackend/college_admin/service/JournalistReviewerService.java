package com.campusconnect.campusconnectbackend.college_admin.service;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.college_admin.CollegeAdmin;
import com.campusconnect.campusconnectbackend.college_admin.CollegeAdminRepository;
import com.campusconnect.campusconnectbackend.dto.request.journalist.JournalistSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.reviewer.ReviewerSignupRequestDto;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistAuth;
import com.campusconnect.campusconnectbackend.reviewer.service.ReviewerAuth;
import com.campusconnect.campusconnectbackend.student.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JournalistReviewerService {

    private final CollegeAdminRepository collegeAdminRepository;
    private final StudentService studentService;
    private final JournalistAuth journalistAuth;
    private final ReviewerAuth reviewerAuth;

    public College getCollege () {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Unauthorized");
        }

        Long admin_id = (Long) authentication.getPrincipal();
        assert admin_id != null;
        CollegeAdmin admin = collegeAdminRepository.findById(admin_id)
                .orElseThrow(() ->
                        new AccessDeniedException("College admin not found or unauthorized")
                );

        return  admin.getCollege();
    }

    public Student getStudentByEmail (String email) {
        return studentService.getStudentByEmail(email);
    }

    public boolean createJournalist(JournalistSignupRequestDto request) {
        College college = getCollege();
        Student student = getStudentByEmail(request.getEmail());

        return journalistAuth.store(request, college, student);
    }

    public boolean createReviewer(ReviewerSignupRequestDto request) {
        College college = getCollege();

        return reviewerAuth.store(request, college);
    }
}
