package com.campusconnect.campusconnectbackend.security.auth;

import com.campusconnect.campusconnectbackend.college_admin.service.CollegeAdminAuth;
import com.campusconnect.campusconnectbackend.dto.request.SigninRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.SignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.collegeadmin.CollegeAdminSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.student.StudentSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistAuth;
import com.campusconnect.campusconnectbackend.reviewer.service.ReviewerAuth;
import com.campusconnect.campusconnectbackend.student.service.StudentAuth;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final StudentAuth studentAuth;
    private final CollegeAdminAuth collegeAdminAuth;
    private final ReviewerAuth reviewerAuth;
    private final JournalistAuth journalistAuth;

    public AuthService(
            StudentAuth studentAuth,
            CollegeAdminAuth collegeAdminAuth,
            ReviewerAuth reviewerAuth,
            JournalistAuth journalistAuth
    ) {
        this.studentAuth = studentAuth;
        this.collegeAdminAuth = collegeAdminAuth;
        this.reviewerAuth = reviewerAuth;
        this.journalistAuth = journalistAuth;
    }

    public AuthResponseDto signup(SignupRequestDto request) {

        // extract role from request obj
        String role = request.getRole();

        return
                switch (role) {

            case "STUDENT" -> studentAuth.store((StudentSignupRequestDto) request);

            case "COLLEGE_ADMIN" -> collegeAdminAuth.store((CollegeAdminSignupRequestDto) request);

            default -> throw new IllegalArgumentException("Invalid role");
        };
    }


    public AuthResponseDto signin(SigninRequestDto request) {

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
}