package com.campusconnect.campusconnectbackend.journalist.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistDetailResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistStatResponseDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.newspaper.repository.NewsPaperRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JournalistService {

    private final JournalistRepository journalistRepository;
    private final NewsPaperRepository newsPaperRepository;

    // get DTO
    private JournalistResponseDto getDto(Journalist journalist) {
        // create dto
        JournalistResponseDto dto = new JournalistResponseDto();
        if (journalist == null) return dto;

        // map the data
        dto.setId(journalist.getId());
        dto.setFullName(journalist.getFullName());
        dto.setActive(journalist.isActive());
        dto.setCreatedAt(journalist.getCreatedAt());
        dto.setCollegeId(journalist.getCollege().getId());
        dto.setStudentId(journalist.getStudent().getStudentId());

        return dto;
    }

    // get DTO -list
    private List<JournalistResponseDto> getDtoList(List<Journalist> journalists) {
        // create response
        List<JournalistResponseDto> response = new ArrayList<>();

        for (Journalist journalist : journalists) {
            response.add(getDto(journalist));
        }
        return response;
    }

    // get count of journalist in college (for backend-use)
    public int getJournalistsCountByCollege(Long collegeId) {

        return journalistRepository.countByCollege_Id(collegeId);
    }

    @Caching(evict = {
            @CacheEvict(value = "journalist_topNewsPapers", key = "#journalistId"),
            @CacheEvict(value = "journalist_newsPapers", key = "#journalistId"),
            @CacheEvict(value = "journalist_draftPapers", key = "#journalistId"),
            @CacheEvict(value = "journalist_dashboard_stats", key = "#journalistId")
    })
    public void evictJournalistCaches(Long journalistId) {}

    // get all journalist of college
    @Cacheable(value = "journalists", key = "'college_' + #collegeId", sync = true)
    public List<JournalistResponseDto> getJournalists(Long collegeId) {

        // find all journalists
        List<Journalist> journalists = journalistRepository.findAllByCollege_Id(collegeId);

        return getDtoList(journalists);
    }

    // remove journalist
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "journalists", key = "'college_' + @authService.getCurrentCollegeId()"),
            @CacheEvict(value = "journalist_details", key = "#journalistId"),
            @CacheEvict(value = "journalist_topNewsPapers", key = "journalistId"),
            @CacheEvict(value = "journalist_newsPapers", key = "#journalistId"),
            @CacheEvict(value = "journalist_draftPapers", key = "#journalistId"),
            @CacheEvict(value = "journalist_dashboard_stats", key = "#journalistId"),
            @CacheEvict(value = "college_dashboard_stats", key = "@authService.getCurrentCollegeId()"),
    })
    public MessageResponseDto removeJournalist(Long journalistId) {
        // check if exist
        if (!journalistRepository.existsById(journalistId)) {
            throw new RuntimeException("Journalist not found!");
        }
        // delete
        journalistRepository.deleteById(journalistId);

        return new MessageResponseDto("Journalist has been removed successfully!");
    }

    // get stats
    @Cacheable(value = "journalist_dashboard_stats", key = "#journalistId", sync = true)
    public JournalistStatResponseDto getStat(Long journalistId){

        // find stats
        int newsPaperCnt = newsPaperRepository.countByJournalist_IdAndStatus(journalistId, "PUBLISHED");
        int draftCnt = newsPaperRepository.countByJournalist_IdAndStatus(journalistId, "DRAFT");

        // create response
        JournalistStatResponseDto dto = new JournalistStatResponseDto();
        dto.setDraft(draftCnt);
        dto.setPublished(newsPaperCnt);

        return dto;
    }

    // get journalist details
    @Cacheable(value = "journalist_details", key = "#journalistId", sync = true)
    public JournalistDetailResponseDto getDetails(Long journalistId) {

        Journalist j = journalistRepository.findById(journalistId).orElseThrow(
                () -> new RuntimeException("Journalist not found")
        );

        JournalistDetailResponseDto dto = new JournalistDetailResponseDto();
        dto.setName(j.getFullName());
        dto.setCollegeName(j.getCollege().getName());
        return dto;
    }
}