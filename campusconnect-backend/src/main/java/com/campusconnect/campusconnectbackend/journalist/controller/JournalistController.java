package com.campusconnect.campusconnectbackend.journalist.controller;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.news_paper.dto.req.NewsPaperRequestDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistDetailResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistStatResponseDto;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistService;
import com.campusconnect.campusconnectbackend.news_paper.service.DraftNewsPaperService;
import com.campusconnect.campusconnectbackend.news_paper.service.NewsPaperService;
import com.campusconnect.campusconnectbackend.news_paper.dto.res.NewsPaperResponseDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("campus-connect/journalist")
@RequiredArgsConstructor
public class JournalistController {

    private final JournalistService journalistService;
    private final AuthService authService;
    private final NewsPaperService newsPaperService;
    private final DraftNewsPaperService draftNewsPaperService;

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
        return newsPaperService.getTopNewsPapers();
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
        return draftNewsPaperService.getDraftPaperByJournalistId(authService.getCurrentUserId());
    }

    // modify draft
    @PutMapping("/newspapers/drafts/{draftId}")
    public MessageResponseDto updateDraft(@PathVariable Long draftId, @RequestBody NewsPaperRequestDto request) {
        return draftNewsPaperService.updateDraft(draftId, request);
    }

    // delete draft
    @DeleteMapping("/newspapers/drafts/{draftId}")
    public MessageResponseDto deleteDraft(@PathVariable Long draftId){
        return draftNewsPaperService.deleteDraft(draftId);
    }

    // publish draft (publish newspaper and delete draft)
    @PostMapping("/newspapers/drafts/{draftId}")
    public MessageResponseDto publishDraft(@PathVariable Long draftId){
        return draftNewsPaperService.publishDraftPaper(draftId);
    }

    // save draft
    @PostMapping("/write/draft")
    public MessageResponseDto saveDraft(@RequestBody NewsPaperRequestDto request){
        return draftNewsPaperService.createDraft(request);
    }

    // publish new newspaper
    @PostMapping("/write/publish")
    public MessageResponseDto publishNewsPaper(@RequestBody NewsPaperRequestDto request){
        return newsPaperService.publishNewspaper(request);
    }
}
