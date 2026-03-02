package com.campusconnect.campusconnectbackend.news_paper.service;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.college.CollegeRepository;
import com.campusconnect.campusconnectbackend.journalist.dto.req.NewsPaperRequestDto;
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
    private final DraftNewsPaperRepository repository;
    private final AuthService authService;
    private final CollegeRepository collegeRepository;
    private final JournalistRepository journalistRepository;


    private List<NewsPaperResponseDto> getDtoList(List<DraftNewsPaper> newsPapers) {
        // create response
        List<NewsPaperResponseDto> response = new ArrayList<>();

        for (DraftNewsPaper newsPaper : newsPapers) {
            response.add(getDto(newsPaper));
        }
        return response;
    }

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

        return dto;
    }


    public List<NewsPaperResponseDto> getDraftPaperByJournalistId(Long journalistId){
        List<DraftNewsPaper>list = repository.findByJournalist_Id(journalistId);

        return getDtoList(list);

    }

    @Transactional
    public void deleteDraft(Long id) {
        repository.deleteById(id);
    }

    public void draftNewsPaper(NewsPaperRequestDto request) {
        DraftNewsPaper newsPaper=new DraftNewsPaper();
        newsPaper.setContent(request.getContent());
        newsPaper.setImageUrl(request.getImageUrl());
        newsPaper.setTitle(request.getTitle());
        Long collegeId = authService.getCurrentCollegeId();
        College college = collegeRepository.findById(collegeId).orElseThrow(()->new RuntimeException("College Not Found"));
        Long Id=authService.getCurrentUserId();
        Journalist journalist=journalistRepository.findById(Id).orElseThrow(()->new RuntimeException("Journalist Not Found"));
        newsPaper.setCollege(college);
        newsPaper.setJournalist(journalist);

        repository.save(newsPaper);
    }

    public void updateDraft(Long id, NewsPaperRequestDto requestDto) {
        DraftNewsPaper draftNewsPaper=repository.findById(id).orElseThrow(()->new RuntimeException("Draft Not Found"));
        draftNewsPaper.setContent(requestDto.getContent());
        draftNewsPaper.setImageUrl(requestDto.getImageUrl());
        draftNewsPaper.setTitle(requestDto.getTitle());


        repository.save(draftNewsPaper);

    }
}
