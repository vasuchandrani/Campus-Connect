package com.campusconnect.campusconnectbackend.research_paper.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.professor.dto.req.ProfRequestDto;
import com.campusconnect.campusconnectbackend.research_paper.dto.req.ResearchRequestDto;
import com.campusconnect.campusconnectbackend.research_paper.dto.res.ResearchesResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResearchPaperService {

    List<ResearchesResponseDto> getMyResearchPapers(Long studentId);

    List<ResearchesResponseDto> getAllResearchPapers(Long collegeId);

    MessageResponseDto submitPaper(ResearchRequestDto request, MultipartFile pdf, Long studentId);

    List<ResearchesResponseDto> getNotReviewedResearches(Long collegeId);

    List<ResearchesResponseDto> getUnderReviewedResearches(Long collegeId);

    List<ResearchesResponseDto> getReviewedResearches(Long collegeId);

    ResearchesResponseDto getResearchPaper(Long id);

    List<ResearchesResponseDto> getAllPendingByProfessor(Long professorId);

    List<ResearchesResponseDto> getAllReviewedByProfessor(Long professorId);

    MessageResponseDto acceptResearch(Long researchId, ProfRequestDto request, Long professorId);

    MessageResponseDto rejectResearch(Long researchId, ProfRequestDto request, Long professorId);

    List<ResearchesResponseDto> getGlobalResearchPapers();

    MessageResponseDto toggleUpvote(Long researchPaperId, Long userId);

    MessageResponseDto toggleGlobalUpvote(Long globalResearchPaperId, Long userId);

    List<ResearchesResponseDto> getCampusResearches(Long collegeId);

    List<ResearchesResponseDto> getPendingGlobalRequests();

    MessageResponseDto approveGlobalResearch(Long researchId, Long adminUserId);

    MessageResponseDto rejectGlobalResearch(Long researchId);

    MessageResponseDto requestGlobalResearch(Long researchId);

    MessageResponseDto submitProfessorPaper(ResearchRequestDto request, MultipartFile pdf, Long professorId);

    List<ResearchesResponseDto> getMyProfessorResearches(Long professorId);
}
