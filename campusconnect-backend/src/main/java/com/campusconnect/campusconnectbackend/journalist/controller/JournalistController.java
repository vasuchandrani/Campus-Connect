package com.campusconnect.campusconnectbackend.journalist.controller;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistAuth;
import com.campusconnect.campusconnectbackend.newspaper.dto.req.NewsPaperRequestDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistDetailResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistStatResponseDto;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistService;
import com.campusconnect.campusconnectbackend.newspaper.service.NewsPaperService;
import com.campusconnect.campusconnectbackend.newspaper.dto.res.NewsPaperResponseDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.security.security_management.dto.res.JournalistProfileDto;
import com.campusconnect.campusconnectbackend.dto.response.AuthResponseDto;
import com.campusconnect.campusconnectbackend.student.dto.req.SubDashboardLoginRequestDto;
import com.campusconnect.campusconnectbackend.student.service.SubDashboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/campus-connect/journalist")
@RequiredArgsConstructor
public class JournalistController {

    private final JournalistService journalistService;
    private final AuthService authService;
    private final NewsPaperService newsPaperService;
    private final JournalistAuth journalistAuth;
    private final SubDashboardService subDashboardService;

    // return to student dashboard from journalist session
    @PostMapping("/return-to-student")
    public AuthResponseDto returnToStudent(@Valid @RequestBody SubDashboardLoginRequestDto request) {
        Long journalistId = authService.getCurrentUserId();
        try {
            return subDashboardService.returnToStudent(journalistId, request);
        } catch (org.springframework.web.server.ResponseStatusException ex) {
            return AuthResponseDto.failure(ex.getReason() != null ? ex.getReason() : "Invalid student password");
        }
    }

    // get journalist details
    @GetMapping("/journalist-detail")
    public JournalistDetailResponseDto getDetails(){
        return journalistService.getDetails(authService.getCurrentUserId());
    }

    // get all stats of current journalist
    @GetMapping("/stats")
    public JournalistStatResponseDto getStats(){
        return journalistService.getStat(authService.getCurrentUserId());
    }

    // get top 3 newspaper by journalist (ordered by upvotes)
    @GetMapping("/newspapers/latest")
    public List<NewsPaperResponseDto> getLatestNewsPaper(){
        return newsPaperService.getTopNewsPapers(authService.getCurrentUserId());
    }

    // get all published newspaper by journalist
    @GetMapping("/newspapers/published")
    public List<NewsPaperResponseDto> getPublishedNewsPapers(){
        return newsPaperService.getNewsPaperByJournalist(authService.getCurrentUserId());
    }

    // view particular newspaper
    @GetMapping("/newspapers/published/{paperId}")
    public NewsPaperResponseDto getPublishedNewsPaper(@PathVariable Long paperId){
        return newsPaperService.getPublishedNewsPaper(paperId);
    }

    // delete particular newspaper
    @DeleteMapping("/newspapers/published/{paperId}")
    public MessageResponseDto deleteNewsPaper(@PathVariable Long paperId){
        return newsPaperService.unpublishNewsPaper(paperId);
    }

    // get all drafts by journalist
    @GetMapping("/newspapers/drafts")
    public List<NewsPaperResponseDto> getDraftNewsPaper(){
        return newsPaperService.getDraftPaperByJournalistId(authService.getCurrentUserId());
    }

    // delete draft
    @DeleteMapping("/newspapers/drafts/{draftId}")
    public MessageResponseDto deleteDraft(@PathVariable Long draftId){
        return newsPaperService.deleteDraft(draftId);
    }

    // save draft
    @PostMapping(value = "/write/draft", consumes = {"multipart/form-data"})
    public MessageResponseDto saveDraft(
            @RequestPart("newspaper") NewsPaperRequestDto request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestPart(value = "pdf", required = false) MultipartFile pdf
    ){
        return newsPaperService.createDraft(authService.getCurrentUserId(), request, image, images, pdf);
    }

    // modify draft
    @PatchMapping(value = "/write/drafts/{draftId}", consumes = {"multipart/form-data"})
    public MessageResponseDto updateDraft(
            @PathVariable Long draftId,
            @RequestPart("newspaper") NewsPaperRequestDto request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestPart(value = "pdf", required = false) MultipartFile pdf
    ) {
        return newsPaperService.updateDraft(authService.getCurrentUserId(), draftId, request, image, images, pdf);
    }

    // publish draft (publish newspaper and delete draft)
    @PostMapping("/write/drafts/{draftId}")
    public MessageResponseDto publishDraft(@PathVariable Long draftId){
        return newsPaperService.publishDraftPaper(draftId);
    }

    // publish new newspaper
    @PostMapping(value = "/write/publish", consumes = {"multipart/form-data"})
    public MessageResponseDto publishNewsPaper(
            @RequestPart("newspaper") NewsPaperRequestDto request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestPart(value = "pdf", required = false) MultipartFile pdf
    ){
        return newsPaperService.publishNewspaper(request, image, images, pdf);
    }

    // upvote article
    @PostMapping("/newspapers/{paperId}/upvote")
    public MessageResponseDto toggleUpvote(@PathVariable Long paperId) {
        return newsPaperService.toggleUpvote(paperId, authService.getCurrentUserId());
    }

    // request globalization of newspaper article
    @PostMapping("/newspapers/{paperId}/request-global")
    public MessageResponseDto requestGlobalNewsPaper(@PathVariable Long paperId) {
        return newsPaperService.requestGlobalNewsPaper(paperId);
    }

    /* Settings */

    // get journalist profile
    @GetMapping("/profile")
    public JournalistProfileDto getJournalist() {
        return journalistAuth.getProfile(authService.getCurrentUserId());
    }

    // update journalist profile
    @PutMapping("/profile")
    public MessageResponseDto updateJournalist(@RequestBody JournalistProfileDto request) {
        return journalistAuth.updateProfile(authService.getCurrentUserId(), request);
    }
}
