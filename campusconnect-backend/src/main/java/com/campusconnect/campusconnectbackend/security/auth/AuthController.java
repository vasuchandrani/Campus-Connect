package com.campusconnect.campusconnectbackend.security.auth;

import com.campusconnect.campusconnectbackend.dto.request.LoginRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.SignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.collegeadmin.CollegeAdminSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.student.StudentSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/campus-connect")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // student
    @PostMapping("/student/signup")
    public AuthResponseDto studentSignup(
            @RequestBody StudentSignupRequestDto request) {
        return authService.signup((SignupRequestDto) request);
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
        return authService.signup(request);
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