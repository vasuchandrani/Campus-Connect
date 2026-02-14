package com.campusconnect.campusconnectbackend.journalist.service;

import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import com.campusconnect.campusconnectbackend.journalist.repository.JournalistRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JournalistService {
    private final JournalistRepository journalistRepository;
    private final AuthService authService;

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
    public List<Journalist> getJournalists() {
        // find college-id
        Long collegeId = authService.getCurrentCollegeId();

        return journalistRepository.findAllByCollege_Id(collegeId);
    }
}
