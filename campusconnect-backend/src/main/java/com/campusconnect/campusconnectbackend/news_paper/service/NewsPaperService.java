package com.campusconnect.campusconnectbackend.news_paper.service;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.college.CollegeRepository;
import com.campusconnect.campusconnectbackend.journalist.dto.req.NewsPaperRequestDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.news_paper.dto.res.NewsPaperResponseDto;
import com.campusconnect.campusconnectbackend.news_paper.entity.DraftNewsPaper;
import com.campusconnect.campusconnectbackend.news_paper.entity.NewsPaper;
import com.campusconnect.campusconnectbackend.news_paper.repository.DraftNewsPaperRepository;
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
    private final CollegeRepository collegeRepository;
    private final JournalistRepository journalistRepository;
    private final DraftNewsPaperRepository draftNewsPaperRepository;

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

    // get new-papers of college
    public List<NewsPaperResponseDto> getNewsPapersByCollege() {

        // find college
        Long collegeId = authService.getCurrentCollegeId();

        List<NewsPaper> newsPapers = newsPaperRepository.findAllByCollege_Id(collegeId);

        return getDtoList(newsPapers);
    }

    /* College-Admin */

    // unpublish newspaper
    public String unpublishNewsPaper(Long newsPaperId) {
        try {
            // delete if exist
            if (newsPaperRepository.existsById(newsPaperId)) {
                newsPaperRepository.deleteById(newsPaperId);
                return "Newspaper unpublished";
            }
            return "Newspaper not found";
        }
        catch (Exception e) {
            throw  new RuntimeException(e.getMessage());
        }
    }

    //get all newspaper by journalist
    public List<NewsPaperResponseDto> getNewsPaperByJournalistId(Long JournalistId){
        List<NewsPaper> list = newsPaperRepository.findByJournalist_Id(JournalistId);

        return getDtoList(list);
    }

    //delete newspaper
    @Transactional
    public void deleteNewsPaper(Long id) {
        try {
            newsPaperRepository.deleteById(id);
        }
        catch (Exception e){
            throw new RuntimeException(e.getMessage());
        }
    }

    //publish new newspaper
    @Transactional
    public void publishNewspaper(NewsPaperRequestDto request) {
        NewsPaper newsPaper = new NewsPaper();
        newsPaper.setContent(request.getContent());
        newsPaper.setImageUrl(request.getImageUrl());
        newsPaper.setTitle(request.getTitle());
        Long collegeId = authService.getCurrentCollegeId();
        College college = collegeRepository.findById(collegeId).orElseThrow(()->new RuntimeException("College Not Found"));
        Long Id=authService.getCurrentUserId();
        Journalist journalist=journalistRepository.findById(Id).orElseThrow(()->new RuntimeException("Journalist Not Found"));
        newsPaper.setCollege(college);
        newsPaper.setJournalist(journalist);

        newsPaperRepository.save(newsPaper);
    }

    //publish draft newspaper
    @Transactional
    public void publishDraftPaper(Long id) {
        NewsPaper newsPaper=new NewsPaper();
        DraftNewsPaper draftNewsPaper=draftNewsPaperRepository.findById(id).orElseThrow(()->new RuntimeException("Draft Not Found"));

        newsPaper.setJournalist(draftNewsPaper.getJournalist());
        newsPaper.setContent(draftNewsPaper.getContent());
        newsPaper.setTitle(draftNewsPaper.getTitle());
        newsPaper.setImageUrl(draftNewsPaper.getImageUrl());
        newsPaper.setCollege(draftNewsPaper.getCollege());

        newsPaperRepository.save(newsPaper);

        draftNewsPaperRepository.deleteById(id);

    }

    //get top newspaper
    public List<NewsPaperResponseDto> getTopNewsPaper(Long currentUserId) {
        List<NewsPaper> list =
                newsPaperRepository.findTop3ByJournalist_IdOrderByCreatedAtDesc(currentUserId);


        return getDtoList(list);
    }

    //get no of publish newspaper by college
    public int getNewsPapersCountByCollege(Long collegeId) {
        return newsPaperRepository.countByCollege_Id(collegeId);
    }
}
