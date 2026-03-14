package com.campusconnect.campusconnectbackend.security.auth;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.college.dto.res.CollegeSubscriptionResponseDto;
import com.campusconnect.campusconnectbackend.college.service.CollegeSubscriptionService;
import com.campusconnect.campusconnectbackend.college_admin.service.CollegeAdminAuth;
import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.SignupRequestDto;
import com.campusconnect.campusconnectbackend.college_admin.dto.req.CollegeAdminSignupRequestDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.reviewer.Reviewer;
import com.campusconnect.campusconnectbackend.student.Student;
import com.campusconnect.campusconnectbackend.student.dto.req.StudentSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistAuth;
import com.campusconnect.campusconnectbackend.reviewer.service.ReviewerAuth;
import com.campusconnect.campusconnectbackend.security.jwt.CustomUserDetails;
import com.campusconnect.campusconnectbackend.student.service.StudentAuth;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StudentAuth studentAuth;
    private final CollegeAdminAuth collegeAdminAuth;
    private final ReviewerAuth reviewerAuth;
    private final JournalistAuth journalistAuth;
    private final CollegeSubscriptionService collegeSubscriptionService;

    // check subscription still active or not
    private boolean checkSubscription (Long collegeId) {

        CollegeSubscriptionResponseDto subscription = collegeSubscriptionService.getSubscription(collegeId);

        return subscription.getEndDate().isAfter(LocalDateTime.now());
    }

    public AuthResponseDto signup(SignupRequestDto request) {

        // extract role from request obj
        String role = request.getRole();

        return
                switch (role) {

            case "STUDENT" ->  {
                StudentSignupRequestDto dto = (StudentSignupRequestDto) request;

                if (checkSubscription(dto.getCollegeId())) {
                    studentAuth.store(dto);
                }
                yield new AuthResponseDto(
                        null,
                        "EXPIRE",
                        "/campus-connect/auth"
                );
            }

            case "COLLEGE_ADMIN" -> collegeAdminAuth.store((CollegeAdminSignupRequestDto) request);

            default -> throw new IllegalArgumentException("Invalid role");
        };
    }


    public AuthResponseDto login(LoginRequestDto request) {

        // extract role from request obj
        String role = request.getRole();

        return
                switch (role) {

            case "STUDENT" -> {
                Student student = studentAuth.getStudentByEmail(request.getEmail());
                College college = student.getCollege();

                if (checkSubscription(college.getId())) {
                    yield studentAuth.authenticate(request);
                }
                yield new AuthResponseDto(
                        null,
                        "EXPIRE",
                        "/campus-connect/auth"
                );
            }

            case "COLLEGE_ADMIN" -> collegeAdminAuth.authenticate(request);

            case "JOURNALIST" -> {
                Journalist journalist = journalistAuth.getJournalistByEmail(request.getEmail());
                College college = journalist.getCollege();

                if (checkSubscription(college.getId())) {
                    yield journalistAuth.authenticate(request);
                }
                yield new AuthResponseDto(
                        null,
                        "EXPIRE",
                        "/campus-connect/auth"
                );
            }

            case "REVIEWER" -> {
                Reviewer reviewer = reviewerAuth.getReviewerByEmail(request.getEmail());
                College college = reviewer.getCollege();

                if (checkSubscription(college.getId())) {
                    yield reviewerAuth.authenticate(request);
                }
                yield new AuthResponseDto(
                        null,
                        "EXPIRE",
                        "/campus-connect/auth"
                );
            }

            default -> throw new IllegalArgumentException("Invalid role");
        };
    }

    // get current authenticate user-principal
    private CustomUserDetails principal() {
        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails p)) {
            throw new IllegalStateException("Unauthenticated access");
        }
        return p;
    }

    public Long getCurrentUserId() {
        return principal().getUserId();
    }
    public Long getCurrentCollegeId() {
        return principal().getCollegeId();
    }
    public String getCurrentRole() {
        return principal().getRole();
    }
}