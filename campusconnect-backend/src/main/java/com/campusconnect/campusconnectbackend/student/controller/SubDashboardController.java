package com.campusconnect.campusconnectbackend.student.controller;

import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.dto.req.SubDashboardLoginRequestDto;
import com.campusconnect.campusconnectbackend.student.dto.res.JournalistStatusDto;
import com.campusconnect.campusconnectbackend.student.service.SubDashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/campus-connect/student")
@RequiredArgsConstructor
public class SubDashboardController {

    private final SubDashboardService subDashboardService;
    private final AuthService authService;

    @PostMapping("/sub-login/journalist")
    public AuthResponseDto journalistSubLogin(@Valid @RequestBody SubDashboardLoginRequestDto request) {
        Long studentId = authService.getCurrentUserId();
        try {
            return subDashboardService.journalistSubLogin(studentId, request);
        } catch (org.springframework.web.server.ResponseStatusException ex) {
            return AuthResponseDto.failure(ex.getReason() != null ? ex.getReason() : "Invalid journalist password");
        }
    }

    @PostMapping("/sub-login/club/{clubId}")
    public AuthResponseDto clubSubLogin(@PathVariable Long clubId, @Valid @RequestBody SubDashboardLoginRequestDto request) {
        Long studentId = authService.getCurrentUserId();
        try {
            return subDashboardService.clubSubLogin(studentId, clubId, request);
        } catch (org.springframework.web.server.ResponseStatusException ex) {
            return AuthResponseDto.failure(ex.getReason() != null ? ex.getReason() : "Invalid club password");
        }
    }

    @GetMapping("/journalist-status")
    public JournalistStatusDto getJournalistStatus() {
        Long studentId = authService.getCurrentUserId();
        return subDashboardService.getJournalistStatus(studentId);
    }
}
