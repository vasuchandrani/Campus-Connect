package com.campusconnect.campusconnectbackend.news_paper.service;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.news_paper.dto.req.NewsPaperRequestDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.news_paper.dto.res.NewsPaperResponseDto;
import com.campusconnect.campusconnectbackend.news_paper.entity.NewsPaper;
import com.campusconnect.campusconnectbackend.news_paper.repository.NewsPaperRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;


@Service
@RequiredArgsConstructor
public class NewsPaperService {

    private final NewsPaperRepository newsPaperRepository;
    private final AuthService authService;
    private final JournalistRepository journalistRepository;

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
        dto.setCollegeName(newsPaper.getCollege().getName());

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

    // get new-papers of college
    public List<NewsPaperResponseDto> getNewsPapersByCollege() {

        // find college
        Long collegeId = authService.getCurrentCollegeId();

        List<NewsPaper> newsPapers = newsPaperRepository.findAllByCollege_Id(collegeId);

        return getDtoList(newsPapers);
    }

    /* College-Admin */

    // unpublish newspaper
    public MessageResponseDto unpublishNewsPaper(Long newsPaperId) {
        // check if exist
        if (!newsPaperRepository.existsById(newsPaperId)) {
            throw new RuntimeException("News Paper Not Found!");
        }
        // delete
        newsPaperRepository.deleteById(newsPaperId);

        return new MessageResponseDto("News Paper Unpublished!");
    }

    // get count of publish newspaper by college
    public int getNewsPapersCountByCollege(Long collegeId) {
        return newsPaperRepository.countByCollege_Id(collegeId);
    }


    /* Journalist */

    // get latest 3 newspaper
    public List<NewsPaperResponseDto> getTopNewsPapers() {

        // find journalist
        Long journalistId = authService.getCurrentUserId();

        // find newspapers
        Pageable page = PageRequest.of(0, 3);
        List<NewsPaper> newsPapers = newsPaperRepository.findLatestNewsPapers(journalistId, page);

        return getDtoList(newsPapers);
    }

    // get all newspaper by journalist
    public List<NewsPaperResponseDto> getNewsPaperByJournalist(Long JournalistId){
        // find all newspapers
        List<NewsPaper> list = newsPaperRepository.findByJournalist_Id(JournalistId);

        return getDtoList(list);
    }

    // get particular news-paper
    public NewsPaperResponseDto getPublishedNewsPaper(Long paperId) {
        // find news-paper
        NewsPaper news = newsPaperRepository.findById(paperId).orElseThrow(
                ()->new RuntimeException("News Paper Not Found")
        );

        return getDto(news);
    }

    // publish new newspaper
    @Transactional
    public MessageResponseDto publishNewspaper(NewsPaperRequestDto request) {

        // find journalist
        Long journalistId = authService.getCurrentUserId();
        Journalist journalist = journalistRepository.findById(journalistId).orElseThrow(
                () -> new RuntimeException("Journalist Not Found")
        );
        // find college
        College college = journalist.getCollege();

        // create
        NewsPaper newsPaper = new NewsPaper();
        newsPaper.setContent(request.getContent());
        newsPaper.setImageUrl(request.getImageUrl());
        newsPaper.setTitle(request.getTitle());
        newsPaper.setCollege(college);
        newsPaper.setJournalist(journalist);
        // save in db
        newsPaperRepository.save(newsPaper);

        return new MessageResponseDto("News-Paper Published!");
    }
}
