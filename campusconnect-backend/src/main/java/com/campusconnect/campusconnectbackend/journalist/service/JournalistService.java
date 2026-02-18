package com.campusconnect.campusconnectbackend.journalist.service;

import com.campusconnect.campusconnectbackend.dto.response.journalist.JournalistResponseDto;
import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
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

    // get DTO
    private JournalistResponseDto getDto(Journalist journalists) {
        // create dto
        JournalistResponseDto dto = new JournalistResponseDto();
        // map the data
        dto.setId(journalists.getId());
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
}
