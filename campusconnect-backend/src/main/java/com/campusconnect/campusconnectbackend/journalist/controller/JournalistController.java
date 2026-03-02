package com.campusconnect.campusconnectbackend.journalist.controller;

import com.campusconnect.campusconnectbackend.journalist.dto.req.NewsPaperRequestDto;
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

    // get all stats of current journalist
    @GetMapping("/stats")
    public JournalistStatResponseDto getStats(){
        return journalistService.getState(authService.getCurrentUserId());
    }

    // get all published newspaper by journalist
    @GetMapping("/newspaper/published")
    public List<NewsPaperResponseDto> getPublishedNewsPaper(){
        return newsPaperService.getNewsPaperByJournalistId(authService.getCurrentUserId());
    }

    //get name and collage-name of journalist
    @GetMapping("/journalist-detail")
    public JournalistDetailResponseDto getDetails(){
        return journalistService.getDetails(authService.getCurrentUserId());
    }

    //get drafts of journalist
    @GetMapping("/newspaper/draft")
    public List<NewsPaperResponseDto> getDraftNewsPaper(){
        return draftNewsPaperService.getDraftPaperByJournalistId(authService.getCurrentUserId());
    }

    //delete specific newspaper
    @DeleteMapping("/newspaper/publish/{id}")
    public void deleteNewsPaper(@PathVariable Long id){
        newsPaperService.deleteNewsPaper(id);
    }

    //delete draft
    @DeleteMapping("/newspaper/draft/{id}")
    public void deleteDraft(@PathVariable Long id){
        draftNewsPaperService.deleteDraft(id);
    }

    //publish new newspaper
    @PostMapping("/newspaper/publish")
    public void publishNewsPaper(@RequestBody NewsPaperRequestDto request){
        newsPaperService.publishNewspaper(request);
    }

    //save draft
    @PostMapping("/newspaper/draft")
    public void draftNewsPaper(@RequestBody NewsPaperRequestDto request){
        draftNewsPaperService.draftNewsPaper(request);
    }

    //update draft
    @PatchMapping("/newspaper/draft/{id}")
    public void updateDraft(@PathVariable Long id, @RequestBody NewsPaperRequestDto requestDto){
        draftNewsPaperService.updateDraft(id,requestDto);
    }

    //publish draft
    @PatchMapping("/newspaper/publish/draft/{id}")
    public void PublishDraftpaper(@PathVariable Long id){
        newsPaperService.publishDraftPaper(id);
        
    }

    //get latest 3 newspaper by journalist
    @GetMapping("/newspaper/latest")
    public List<NewsPaperResponseDto> getLatestNewsPaper(){
        return newsPaperService.getTopNewsPaper(authService.getCurrentUserId());
    }
}
