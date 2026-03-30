package com.campusconnect.campusconnectbackend.reviewer.controller;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.research_paper.service.ResearchPaperService;
import com.campusconnect.campusconnectbackend.research_paper.dto.res.ResearchesResponseDto;
import com.campusconnect.campusconnectbackend.reviewer.dto.req.ReviewRequestDto;
import com.campusconnect.campusconnectbackend.reviewer.dto.res.ReviewerDetailResponseDto;
import com.campusconnect.campusconnectbackend.reviewer.dto.res.ReviewerStatsResponseDto;
import com.campusconnect.campusconnectbackend.reviewer.service.ReviewerAuth;
import com.campusconnect.campusconnectbackend.reviewer.service.ReviewerService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.security.security_management.dto.res.ReviewerProfileDto;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RequestMapping("/campus-connect/reviewer")
@RestController
@RequiredArgsConstructor
public class ReviewerController {

    private final ResearchPaperService researchPaperService;
    private final ReviewerService reviewerService;
    private final AuthService authService;
    private final ReviewerAuth reviewerAuth;

    // get reviewer details
    @GetMapping("/reviewer-detail")
    public ReviewerDetailResponseDto getDetails(){
        return reviewerService.getDetails(authService.getCurrentUserId());
    }


    // get stats
    @GetMapping("/stats")
    public ReviewerStatsResponseDto getReviewerStats() {
        return reviewerService.getStats(authService.getCurrentUserId());
    }

    // get pending reviews
    @GetMapping("/pending")
    public List<ResearchesResponseDto> getPendingResearches() {
        return researchPaperService.getAllPendingByReviewer(authService.getCurrentUserId());
    }

    // accept any research-paper
    @PostMapping("/pending/{researchId}/accept")
    public MessageResponseDto acceptPendingResearch(@PathVariable Long researchId, @RequestBody ReviewRequestDto request) {
        return researchPaperService.acceptResearch(researchId, request, authService.getCurrentUserId());
    }

    // reject any research-paper
    @PostMapping("/pending/{researchId}/reject")
    public MessageResponseDto rejectPendingResearch(@PathVariable Long researchId, @RequestBody ReviewRequestDto request) {
        return researchPaperService.rejectResearch(researchId, request, authService.getCurrentUserId());
    }

    // get reviewed papers
    @GetMapping("/reviewed")
    public List<ResearchesResponseDto> getReviewedResearches() {
        return researchPaperService.getAllReviewedByReviewer(authService.getCurrentUserId());
    }

    // get particular research
    @GetMapping("/researches/{researchId}")
    public ResearchesResponseDto getResearch(@PathVariable Long researchId) {
        return researchPaperService.getResearchPaper(researchId);
    }

    /* Settings */

    // get reviewer profile
    @GetMapping("/profile")
    public ReviewerProfileDto getReviewer() {
        return reviewerAuth.getProfile(authService.getCurrentUserId());
    }

    // update reviewer profile
    @PutMapping("/profile")
    public MessageResponseDto updateReviewer(@RequestBody ReviewerProfileDto request) {
        return reviewerAuth.updateProfile(authService.getCurrentUserId(), request);
    }
}
