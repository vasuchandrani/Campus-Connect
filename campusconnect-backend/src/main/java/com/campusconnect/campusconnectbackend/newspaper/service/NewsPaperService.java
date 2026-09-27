package com.campusconnect.campusconnectbackend.newspaper.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.newspaper.dto.req.NewsPaperRequestDto;
import com.campusconnect.campusconnectbackend.newspaper.dto.res.NewsPaperResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface NewsPaperService {

    List<NewsPaperResponseDto> getTopNewsPaper(Long collegeId);

    NewsPaperResponseDto getLatestOne(Long collegeId);

    List<NewsPaperResponseDto> getNewsPapersByCollege(Long collegeId);

    MessageResponseDto unpublishNewsPaper(Long newsPaperId);

    int getNewsPapersCountByCollege(Long collegeId);

    List<NewsPaperResponseDto> getTopNewsPapers(Long journalistId);

    List<NewsPaperResponseDto> getNewsPaperByJournalist(Long journalistId);

    List<NewsPaperResponseDto> getDraftPaperByJournalistId(Long journalistId);

    NewsPaperResponseDto getPublishedNewsPaper(Long paperId);

    MessageResponseDto createDraft(Long journalistId, NewsPaperRequestDto request, MultipartFile image);

    MessageResponseDto createDraft(Long journalistId, NewsPaperRequestDto request, MultipartFile image, List<MultipartFile> images, MultipartFile pdf);

    MessageResponseDto updateDraft(Long journalistId, Long draftId, NewsPaperRequestDto request, MultipartFile image);

    MessageResponseDto updateDraft(Long journalistId, Long draftId, NewsPaperRequestDto request, MultipartFile image, List<MultipartFile> images, MultipartFile pdf);

    MessageResponseDto deleteDraft(Long draftId);

    MessageResponseDto publishDraftPaper(Long draftId);

    MessageResponseDto publishNewspaper(NewsPaperRequestDto request, MultipartFile image);

    MessageResponseDto publishNewspaper(NewsPaperRequestDto request, MultipartFile image, List<MultipartFile> images, MultipartFile pdf);

    List<NewsPaperResponseDto> getGlobalNewsPapers();

    MessageResponseDto toggleUpvote(Long newsPaperId, Long userId);

    MessageResponseDto toggleGlobalUpvote(Long globalNewsPaperId, Long userId);

    List<NewsPaperResponseDto> getCampusNewspapers(Long collegeId);

    List<NewsPaperResponseDto> getPendingGlobalRequests();

    MessageResponseDto approveGlobalNewsPaper(Long newsPaperId, Long adminUserId);

    MessageResponseDto rejectGlobalNewsPaper(Long newsPaperId);

    MessageResponseDto requestGlobalNewsPaper(Long newsPaperId);
}