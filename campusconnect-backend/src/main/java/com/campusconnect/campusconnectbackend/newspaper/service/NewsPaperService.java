package com.campusconnect.campusconnectbackend.newspaper.service;

import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.integrations.cloudinary.service.CloudinaryService;
import com.campusconnect.campusconnectbackend.newspaper.dto.req.NewsPaperRequestDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.newspaper.dto.res.NewsPaperResponseDto;
import com.campusconnect.campusconnectbackend.newspaper.entity.NewsPaper;
import com.campusconnect.campusconnectbackend.newspaper.repository.NewsPaperRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;


@Service
@RequiredArgsConstructor
public class NewsPaperService {

    private final NewsPaperRepository newsPaperRepository;
    private final AuthService authService;
    private final JournalistRepository journalistRepository;
    private final CloudinaryService cloudinaryService;

    // upload image on cloudinary and get url
    private String getUploadedImageUrl (MultipartFile image, Long journalistId) {
        // upload image and get url
        String path = "news_papers/" +  journalistId;

        return cloudinaryService.uploadImage(image, path);
    }

    // get DTO
    private NewsPaperResponseDto getDto(NewsPaper newsPaper) {
        // create response dto
        NewsPaperResponseDto dto = new NewsPaperResponseDto();
        if (newsPaper == null) return dto;

        // map data
        dto.setId(newsPaper.getId());
        dto.setTitle(newsPaper.getTitle());
        dto.setContent(newsPaper.getContent());
        dto.setImageUrl(newsPaper.getImageUrl());
        dto.setCreatedAt(newsPaper.getCreatedAt());
        dto.setStatus(newsPaper.getStatus());

        if (newsPaper.getJournalist() != null) {
            dto.setJournalistName(newsPaper.getJournalist().getFullName());
        }
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
        List<NewsPaper> newsPapers = newsPaperRepository.findLatestByCollegeId(collegeId, "PUBLISHED", pageable);

        return getDtoList(newsPapers);
    }

    // get latest one news of college
    public NewsPaperResponseDto getLatestOne() {

        // get college-id
        Long collegeId = authService.getCurrentCollegeId();
        Pageable pageable = PageRequest.of(0, 1);

        // return the latest one
        NewsPaper news = newsPaperRepository
                .findLatestByCollegeId(collegeId, "PUBLISHED", pageable)
                .stream()
                .findFirst()
                .orElse(null);

        return getDto(news);
    }

    // get new-papers of college
    public List<NewsPaperResponseDto> getNewsPapersByCollege() {

        // find college
        Long collegeId = authService.getCurrentCollegeId();

        List<NewsPaper> newsPapers = newsPaperRepository.findAllByCollege_IdAndStatus(collegeId, "PUBLISHED");

        return getDtoList(newsPapers);
    }

    /* College-Admin */

    // unpublish newspaper
    @Transactional
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
        return newsPaperRepository.countByCollege_IdAndStatus(collegeId,  "PUBLISHED");
    }


    /* Journalist */

    // get latest 3 newspaper
    public List<NewsPaperResponseDto> getTopNewsPapers() {

        // find journalist
        Long journalistId = authService.getCurrentUserId();

        // find newspapers
        Pageable page = PageRequest.of(0, 3);
        List<NewsPaper> newsPapers = newsPaperRepository.findLatestNewsPapers(journalistId, "PUBLISHED", page);

        return getDtoList(newsPapers);
    }

    // get all published newspaper by journalist
    public List<NewsPaperResponseDto> getNewsPaperByJournalist(Long journalistId){
        // find all published newspapers
        List<NewsPaper> list = newsPaperRepository.findAllByJournalist_IdAndStatus(journalistId, "PUBLISHED");

        return getDtoList(list);
    }

    // get all drafts of journalist
    public List<NewsPaperResponseDto> getDraftPaperByJournalistId(Long journalistId){
        // find all draft newspapers
        List<NewsPaper> list = newsPaperRepository.findAllByJournalist_IdAndStatus(journalistId, "DRAFT");

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

    // create draft (save as draft)
    @Transactional
    public MessageResponseDto createDraft(NewsPaperRequestDto request, MultipartFile image) {

        // find journalist
        Long journalistId = authService.getCurrentUserId();
        Journalist journalist = journalistRepository.findById(journalistId).orElseThrow(
                () -> new RuntimeException("Journalist Not Found")
        );
        College college = journalist.getCollege();

        // upload image and get url
        String imageUrl = getUploadedImageUrl(image, journalistId);

        // create
        NewsPaper newsPaper = new NewsPaper();

        newsPaper.setTitle(request.getTitle());
        newsPaper.setContent(request.getContent());
        newsPaper.setImageUrl(imageUrl);
        newsPaper.setStatus("DRAFT");
        newsPaper.setJournalist(journalist);
        newsPaper.setCollege(college);

        newsPaperRepository.save(newsPaper);

        return new MessageResponseDto("Draft saved Successfully");
    }

    // modify any draft
    @Transactional
    public MessageResponseDto updateDraft(Long  journalistId, Long draftId, NewsPaperRequestDto request, MultipartFile image) {
        // find draft
        NewsPaper draftNewsPaper = newsPaperRepository.findById(draftId).orElseThrow(
                ()->new RuntimeException("Draft Not Found")
        );

        if (image != null) {
            String imageUrl = getUploadedImageUrl(image, journalistId);
            draftNewsPaper.setImageUrl(imageUrl);
        }
        if (request.getTitle() != null) {
            draftNewsPaper.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            draftNewsPaper.setContent(request.getContent());
        }
        newsPaperRepository.save(draftNewsPaper);

        return new MessageResponseDto("Draft Modified Successfully");
    }

    // delete any draft
    @Transactional
    public MessageResponseDto deleteDraft(Long draftId) {
        // check if exist
        if (!newsPaperRepository.existsById(draftId)) {
            throw new  RuntimeException("Draft Not Found");
        }
        // delete
        newsPaperRepository.deleteById(draftId);
        return new MessageResponseDto("Draft Deleted Successfully");
    }

    // publish draft -(change status to PUBLISHED)
    @Transactional
    public MessageResponseDto publishDraftPaper(Long draftId) {
        // find draft
        NewsPaper draftNewsPaper = newsPaperRepository.findById(draftId).orElseThrow(
                ()->new RuntimeException("Draft Not Found")
        );

        // change status to PUBLISHED
        draftNewsPaper.setStatus("PUBLISHED");
        newsPaperRepository.save(draftNewsPaper);

        return new MessageResponseDto("Draft Published Successfully");
    }

    // publish new newspaper
    @Transactional
    public MessageResponseDto publishNewspaper(NewsPaperRequestDto request, MultipartFile image) {

        // find journalist
        Long journalistId = authService.getCurrentUserId();
        Journalist journalist = journalistRepository.findById(journalistId).orElseThrow(
                () -> new RuntimeException("Journalist Not Found")
        );
        // find college
        College college = journalist.getCollege();

        String imageUrl = getUploadedImageUrl(image, journalistId);

        // create
        NewsPaper newsPaper = new NewsPaper();
        newsPaper.setContent(request.getContent());
        newsPaper.setImageUrl(imageUrl);
        newsPaper.setStatus("PUBLISHED");
        newsPaper.setTitle(request.getTitle());
        newsPaper.setCollege(college);
        newsPaper.setJournalist(journalist);
        // save in db
        newsPaperRepository.save(newsPaper);

        return new MessageResponseDto("News-Paper Published!");
    }
}
