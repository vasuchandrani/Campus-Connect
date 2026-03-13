package com.campusconnect.campusconnectbackend.security.auth;

import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.college_admin.dto.req.CollegeAdminSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.student.dto.req.StudentSignupRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/campus-connect")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // student
    @PostMapping("/student/signup")
    public AuthResponseDto studentSignup(
            @RequestBody StudentSignupRequestDto request) {
        return authService.signup(request);
    }
    @PostMapping("/student/login")
    public AuthResponseDto studentLogin(
            @RequestBody LoginRequestDto request) {
        return authService.login(request);
    }

    // college-admin
    @PostMapping("/college-admin/signup")
    public AuthResponseDto collegeAdminSignup(
            @RequestBody CollegeAdminSignupRequestDto request
    ) {
        if (request.isPaid()) {
            return authService.signup(request);
        }
        return new AuthResponseDto(
                null,
                "Payment required before signup",
                "/campus-connect/auth"
        );
    }
    @PostMapping("/college-admin/login")
    public AuthResponseDto collegeAdminLogin(
            @RequestBody LoginRequestDto request
    ) {
        return authService.login(request);
    }

    // journalist
    @PostMapping("/journalist/login")
    public AuthResponseDto journalistLogin(
            @RequestBody LoginRequestDto request
    ) {
        return authService.login(request);
    }

    // reviewer
    @PostMapping("/reviewer/login")
    public AuthResponseDto reviewerLogin(
            @RequestBody LoginRequestDto request
    ) {
        return authService.login(request);
    }

    // get current auth
    // get current user
    @GetMapping("/curr-user")
    public Long getCurrentUserId() {
        return authService.getCurrentUserId();
    }
    // get current college
    @GetMapping("/curr-college")
    public Long getCurrentCollegeId() {
        return authService.getCurrentCollegeId();
    }
    // get current role
    @GetMapping("/curr-role")
    public  String getCurrentRole() {
        return authService.getCurrentRole();
    }

    // testing
    @GetMapping("/student/dashboard")
    public String studentDashboard() {
        return "Student Dashboard";
    }

    @GetMapping("/college-admin/dashboard")
    public String collegeAdminDashboard() { return "College Admin Dashboard"; }

    @GetMapping("/journalist/dashboard")
    public String journalistDashboard() {
        return "Journalist Dashboard";
    }

    @GetMapping("/reviewer/dashboard")
    public String reviewerDashboard() {
        return "Reviewer Dashboard";
    }
}