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
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("campus-connect/journalist")
@RequiredArgsConstructor
public class JournalistController {

    private final JournalistService journalistService;
    private final AuthService authService;
    private final NewsPaperService newsPaperService;
    private final JournalistAuth journalistAuth;

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

    // get latest 3 newspaper by journalist
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
    @PostMapping("/write/draft")
    public MessageResponseDto saveDraft(
            @RequestPart("newspaper") NewsPaperRequestDto request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ){
        return newsPaperService.createDraft(authService.getCurrentUserId(), request, image);
    }

    // modify draft
    @PatchMapping("/write/drafts/{draftId}")
    public MessageResponseDto updateDraft(
            @PathVariable Long draftId,
            @RequestPart("newspaper") NewsPaperRequestDto request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        return newsPaperService.updateDraft(authService.getCurrentUserId(), draftId, request, image);
    }

    // publish draft (publish newspaper and delete draft)
    @PostMapping("/write/drafts/{draftId}")
    public MessageResponseDto publishDraft(@PathVariable Long draftId){
        return newsPaperService.publishDraftPaper(draftId);
    }

    // publish new newspaper
    @PostMapping("/write/publish")
    public MessageResponseDto publishNewsPaper(
            @RequestPart("newspaper") NewsPaperRequestDto request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ){
        return newsPaperService.publishNewspaper(request, image);
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
