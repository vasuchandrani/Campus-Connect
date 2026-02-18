package com.campusconnect.campusconnectbackend.security.auth;

import com.campusconnect.campusconnectbackend.college_admin.service.CollegeAdminAuth;
import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.SignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.collegeadmin.CollegeAdminSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.student.StudentRegisterRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistAuth;
import com.campusconnect.campusconnectbackend.reviewer.service.ReviewerAuth;
import com.campusconnect.campusconnectbackend.security.jwt.CustomUserDetails;
import com.campusconnect.campusconnectbackend.student.service.StudentAuth;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final StudentAuth studentAuth;
    private final CollegeAdminAuth collegeAdminAuth;
    private final ReviewerAuth reviewerAuth;
    private final JournalistAuth journalistAuth;

    public AuthResponseDto signup(SignupRequestDto request) {

        // extract role from request obj
        String role = request.getRole();

        return
                switch (role) {

            case "STUDENT" -> studentAuth.store((StudentRegisterRequestDto) request);

            case "COLLEGE_ADMIN" -> collegeAdminAuth.store((CollegeAdminSignupRequestDto) request);

            default -> throw new IllegalArgumentException("Invalid role");
        };
    }


    public AuthResponseDto login(LoginRequestDto request) {

        // extract role from request obj
        String role = request.getRole();

        return
                switch (role) {

            case "STUDENT" -> studentAuth.authenticate(request);

            case "COLLEGE_ADMIN" -> collegeAdminAuth.authenticate(request);

            case "JOURNALIST" -> journalistAuth.authenticate(request);

            case "REVIEWER" -> reviewerAuth.authenticate(request);

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