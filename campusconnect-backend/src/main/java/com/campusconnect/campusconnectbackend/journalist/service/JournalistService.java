package com.campusconnect.campusconnectbackend.journalist.service;

import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistDetailResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistResponseDto;
import com.campusconnect.campusconnectbackend.journalist.dto.res.JournalistStatResponseDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.news_paper.entity.DraftNewsPaper;
import com.campusconnect.campusconnectbackend.news_paper.repository.DraftNewsPaperRepository;
import com.campusconnect.campusconnectbackend.news_paper.entity.NewsPaper;
import com.campusconnect.campusconnectbackend.news_paper.repository.NewsPaperRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class JournalistService {
    private final JournalistRepository journalistRepository;
    private final AuthService authService;
    private final DraftNewsPaperRepository draftNewsPaperRepository;
    private final NewsPaperRepository newsPaperRepository;

    // get DTO
    private JournalistResponseDto getDto(Journalist journalists) {
        // create dto
        JournalistResponseDto dto = new JournalistResponseDto();
        // map the data
        dto.setId(journalists.getStudent().getStudentId());
        dto.setFullName(journalists.getFullName());
        dto.setActive(journalists.isActive());
        dto.setCreatedAt(journalists.getCreatedAt());
        dto.setCollegeId(journalists.getCollege().getId());
        dto.setStudentId(journalists.getStudent().getId());

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
    public boolean removeJournalist(Long journalistId) {
        try {
            journalistRepository.deleteById(journalistId);
            return true;
        }
        catch (Exception e) {
            throw new RuntimeException("Remove Journalist Failed!", e);
        }
    }

    //count of draft and publish newspaper
    public JournalistStatResponseDto getState(Long journalistId){
        List<NewsPaper> list = newsPaperRepository.findByJournalist_Id(journalistId);
        List<DraftNewsPaper> list1=draftNewsPaperRepository.findByJournalist_Id(journalistId);

        JournalistStatResponseDto dto = new JournalistStatResponseDto();
        dto.setDraft(list1.size());
        dto.setPublished(list.size());

        return dto;

    }

    //get journalist details
    public JournalistDetailResponseDto getDetails(Long currentUserId) {
        Journalist j=journalistRepository.findById(currentUserId).orElseThrow(()->new RuntimeException("Journalist not found"));
        JournalistDetailResponseDto dto = new JournalistDetailResponseDto();
        dto.setName(j.getFullName());
        dto.setCollageName(j.getCollege().getName());
        return dto;

    }
}
