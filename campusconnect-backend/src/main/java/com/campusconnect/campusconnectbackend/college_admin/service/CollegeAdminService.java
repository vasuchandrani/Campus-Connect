package com.campusconnect.campusconnectbackend.college_admin.service;

import com.campusconnect.campusconnectbackend.club.ClubService;
import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.college.CollegeRepository;
import com.campusconnect.campusconnectbackend.college_admin.CollegeAdmin;
import com.campusconnect.campusconnectbackend.college_admin.CollegeAdminRepository;
import com.campusconnect.campusconnectbackend.college_admin.dto.res.CollegeAdminDashboardStatsDto;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistService;
import com.campusconnect.campusconnectbackend.news_paper.service.NewsPaperService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CollegeAdminService {

    private final CollegeAdminRepository collegeAdminRepository;
    private final CollegeRepository collegeRepository;
    private final AuthService authService;
    private final ClubService clubService;
    private final JournalistService journalistService;
    private final StudentRepoService studentRepoService;
    private final NewsPaperService newsPaperService;

    // get college name
    public String getCollegeName() {
        // find college-id
        Long  collegeId = authService.getCurrentCollegeId();
        // find college
        College college = collegeRepository.findById(collegeId).orElseThrow(
                () -> new RuntimeException("College not found!")
        );

        return college.getName();
    }

    // get college-admin name
    public String getName(Long userId) {
        // find college-admin
        CollegeAdmin collegeAdmin = collegeAdminRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        return collegeAdmin.getFullName();
    }

    // get college-admin
    public CollegeAdmin getAdmin(College college) {

        return collegeAdminRepository.findByCollege(college);
    }

    // get stats
    public CollegeAdminDashboardStatsDto getStats() {

        // find college-id
        Long collegeId = authService.getCurrentCollegeId();

        int clubs           = clubService.getClubsCountByCollege(collegeId);
        int students        = studentRepoService.getStudentCountByCollege(collegeId);
        int journalist      = journalistService.getJournalistsCountByCollege(collegeId);
        int publishedPapers = newsPaperService.getNewsPapersCountByCollege(collegeId);

        // create
        CollegeAdminDashboardStatsDto dto = new CollegeAdminDashboardStatsDto();
        dto.setClubs(clubs);
        dto.setStudents(students);
        dto.setJournalist(journalist);
        dto.setPublishedPapers(publishedPapers);

        return dto;
    }
}
