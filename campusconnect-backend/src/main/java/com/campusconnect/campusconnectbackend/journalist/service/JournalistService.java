package com.campusconnect.campusconnectbackend.journalist.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistDetailResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistStatResponseDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.newspaper.repository.NewsPaperRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JournalistService {
    private final JournalistRepository journalistRepository;
    private final AuthService authService;
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

    // get journalist-name
    public String getName(Long userId) {
        Journalist journalist = journalistRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        return journalist.getFullName();
    }

    // get count of journalist in college
    public int getJournalistsCountByCollege(Long collegeId) {

        return journalistRepository.countByCollege_Id(collegeId);
    }

    // get all journalist of college
    public List<JournalistResponseDto> getJournalists() {
        // find college-id
        Long collegeId = authService.getCurrentCollegeId();
        // find all journalists
        List<Journalist> journalists = journalistRepository.findAllByCollege_Id(collegeId);

        return getDtoList(journalists);
    }

    // remove journalist
    @Transactional
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
    public JournalistDetailResponseDto getDetails(Long currentUserId) {

        Journalist j = journalistRepository.findById(currentUserId).orElseThrow(
                () -> new RuntimeException("Journalist not found")
        );

        JournalistDetailResponseDto dto = new JournalistDetailResponseDto();
        dto.setName(j.getFullName());
        dto.setCollegeName(j.getCollege().getName());
        return dto;

    }
}