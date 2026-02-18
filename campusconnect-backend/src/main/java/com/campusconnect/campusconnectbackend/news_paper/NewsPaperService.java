package com.campusconnect.campusconnectbackend.news_paper;

import com.campusconnect.campusconnectbackend.dto.response.news_paper.NewsPaperResponseDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;


@Service
@RequiredArgsConstructor
public class NewsPaperService {

    private final NewsPaperRepository newsPaperRepository;
    private final AuthService authService;

    // get DTO
    private NewsPaperResponseDto getDto(NewsPaper newsPaper) {
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

    // get DTO -list
    private List<NewsPaperResponseDto> getDtoList(List<NewsPaper> newsPapers) {
        // create response
        List<NewsPaperResponseDto> response = new ArrayList<>();

        for (NewsPaper newsPaper : newsPapers) {
            response.add(getDto(newsPaper));
        }
        return response;
    }

    // get latest 4 news-papers of college
    public List<NewsPaperResponseDto> getTopNewsPaper() {

        // get college-id
        Long collegeId = authService.getCurrentCollegeId();
        Pageable pageable = PageRequest.of(0, 4);
        // find all newspapers
        List<NewsPaper> newsPapers = newsPaperRepository.findLatestByCollegeId(collegeId, pageable);

        return getDtoList(newsPapers);
    }

    // get latest one news of college
    public NewsPaperResponseDto getLatestOne() {

        // get college-id
        Long collegeId = authService.getCurrentCollegeId();

        // return the latest one
        NewsPaper news = newsPaperRepository
                .findLatestByCollegeId(collegeId, PageRequest.of(0, 1))
                .stream()
                .findFirst()
                .orElse(null);

        assert news != null;
        return getDto(news);
    }
}
