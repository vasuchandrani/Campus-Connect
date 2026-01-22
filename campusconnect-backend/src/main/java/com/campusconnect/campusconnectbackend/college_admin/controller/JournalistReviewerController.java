package com.campusconnect.campusconnectbackend.college_admin.controller;

import com.campusconnect.campusconnectbackend.college_admin.service.JournalistReviewerService;
import com.campusconnect.campusconnectbackend.dto.request.journalist.JournalistSignupRequestDto;
import com.campusconnect.campusconnectbackend.dto.request.reviewer.ReviewerSignupRequestDto;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/campus-connect/college-admin/dashboard")
public class JournalistReviewerController {

    private final JournalistReviewerService journalistReviewerService;

    JournalistReviewerController(JournalistReviewerService journalistReviewerService) {
        this.journalistReviewerService = journalistReviewerService;
    }

    @PostMapping("/journalist")
    public boolean addJournalist(@RequestBody JournalistSignupRequestDto request) {

        return journalistReviewerService.createJournalist(request);
    }

    @PostMapping("/reviewer")
    public boolean addReviewer(@RequestBody ReviewerSignupRequestDto request) {

        return journalistReviewerService.createReviewer(request);
    }
}
