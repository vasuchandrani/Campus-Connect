package com.campusconnect.campusconnectbackend.news_paper.service;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.news_paper.dto.req.NewsPaperRequestDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.news_paper.dto.res.NewsPaperResponseDto;
import com.campusconnect.campusconnectbackend.news_paper.entity.DraftNewsPaper;
import com.campusconnect.campusconnectbackend.news_paper.repository.DraftNewsPaperRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DraftNewsPaperService {
    private final DraftNewsPaperRepository draftNewsPaperRepository;
    private final AuthService authService;
    private final JournalistRepository journalistRepository;
    private final NewsPaperService newsPaperService;

    // get DTO
    private NewsPaperResponseDto getDto(DraftNewsPaper newsPaper) {
        // create response dto
        NewsPaperResponseDto dto = new NewsPaperResponseDto();
        // map data
        dto.setId(newsPaper.getId());
        dto.setTitle(newsPaper.getTitle());
        dto.setContent(newsPaper.getContent());
        dto.setImageUrl(newsPaper.getImageUrl());
        dto.setCreatedAt(newsPaper.getCreatedAt());
        dto.setJournalistName(newsPaper.getJournalist().getFullName());
        dto.setCollegeName(newsPaper.getCollege().getName());

        return dto;
    }

    // get DTO -list
    private List<NewsPaperResponseDto> getDtoList(List<DraftNewsPaper> newsPapers) {
        // create response
        List<NewsPaperResponseDto> response = new ArrayList<>();

        for (DraftNewsPaper newsPaper : newsPapers) {
            response.add(getDto(newsPaper));
        }
        return response;
    }

    // get all drafts of journalist
    public List<NewsPaperResponseDto> getDraftPaperByJournalistId(Long journalistId){
        // find all drafts
        List<DraftNewsPaper> list = draftNewsPaperRepository.findByJournalist_Id(journalistId);

        return getDtoList(list);
    }

    // modify any draft
    @Transactional
    public MessageResponseDto updateDraft(Long draftId, NewsPaperRequestDto request) {
        // find draft
        DraftNewsPaper draftNewsPaper = draftNewsPaperRepository.findById(draftId).orElseThrow(
                ()->new RuntimeException("Draft Not Found")
        );

        draftNewsPaper.setTitle(request.getTitle());
        draftNewsPaper.setContent(request.getContent());
        draftNewsPaper.setImageUrl(request.getImageUrl());

        draftNewsPaperRepository.save(draftNewsPaper);

        return new MessageResponseDto("Draft Modified Successfully");
    }

    // delete any draft
    @Transactional
    public MessageResponseDto deleteDraft(Long draftId) {
        // check if exist
        if (!draftNewsPaperRepository.existsById(draftId)) {
            throw new  RuntimeException("Draft Not Found");
        }
        // delete
        draftNewsPaperRepository.deleteById(draftId);
        return new MessageResponseDto("Draft Deleted Successfully");
    }

    // publish any draft
    public MessageResponseDto publishDraftPaper(Long draftId) {
        // find draft-paper
        DraftNewsPaper draft = draftNewsPaperRepository.findById(draftId).orElseThrow(
                () -> new RuntimeException("Draft Not Found")
        );

        NewsPaperRequestDto request = new NewsPaperRequestDto();
        request.setTitle(draft.getTitle());
        request.setContent(draft.getContent());
        request.setImageUrl(draft.getImageUrl());

        return newsPaperService.publishNewspaper(request);
    }

    // create draft (save as draft)
    @Transactional
    public MessageResponseDto createDraft(NewsPaperRequestDto request) {

        // find journalist
        Long journalistId = authService.getCurrentUserId();
        Journalist journalist = journalistRepository.findById(journalistId).orElseThrow(
                () -> new RuntimeException("Journalist Not Found")
        );
        College college = journalist.getCollege();

        // create
        DraftNewsPaper draft = new DraftNewsPaper();

        draft.setTitle(request.getTitle());
        draft.setContent(request.getContent());
        draft.setImageUrl(request.getImageUrl());
        draft.setJournalist(journalist);
        draft.setCollege(college);

        draftNewsPaperRepository.save(draft);

        return new MessageResponseDto("Draft saved Successfully");
    }
}
