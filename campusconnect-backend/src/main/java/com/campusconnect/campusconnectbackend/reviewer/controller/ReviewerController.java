package com.campusconnect.campusconnectbackend.reviewer.controller;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.research_paper.ResearchPaperService;
import com.campusconnect.campusconnectbackend.research_paper.dto.res.ResearchesResponseDto;
import com.campusconnect.campusconnectbackend.reviewer.dto.req.ReviewRequestDto;
import com.campusconnect.campusconnectbackend.reviewer.dto.res.ReviewerStatsResponseDto;
import com.campusconnect.campusconnectbackend.reviewer.service.ReviewerService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController("/campus-connect/reviewer")
@RequiredArgsConstructor
public class ReviewerController {

    private final ResearchPaperService researchPaperService;
    private final ReviewerService reviewerService;
    private final AuthService authService;

    // get stats
    @GetMapping("/stats")
    public ReviewerStatsResponseDto getReviewerStats() {
        return reviewerService.getStats();
    }

    // get pending reviews
    @GetMapping("/pending")
    public List<ResearchesResponseDto> getPendingResearches() {
        return researchPaperService.getAllPendingByReviewer();
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
        return researchPaperService.getAllReviewedByReviewer();
    }

    // get particular research
    @GetMapping("/researches/{researchId}")
    public ResearchesResponseDto getResearch(@PathVariable Long researchId) {
        return researchPaperService.getResearchPaper(researchId);
    }
}
