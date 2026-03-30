package com.campusconnect.campusconnectbackend.college_admin.service;

import com.campusconnect.campusconnectbackend.club.service.ClubService;
import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college.repository.CollegeRepository;
import com.campusconnect.campusconnectbackend.college_admin.entity.CollegeAdmin;
import com.campusconnect.campusconnectbackend.college_admin.repository.CollegeAdminRepository;
import com.campusconnect.campusconnectbackend.college_admin.dto.res.CollegeAdminDashboardStatsDto;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistService;
import com.campusconnect.campusconnectbackend.newspaper.service.NewsPaperService;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;

@Service
@RequiredArgsConstructor
public class CollegeAdminService {

    private final CollegeAdminRepository collegeAdminRepository;
    private final CollegeRepository collegeRepository;
    private final ClubService clubService;
    private final JournalistService journalistService;
    private final StudentRepoService studentRepoService;
    private final NewsPaperService newsPaperService;

    // get college name
    @Cacheable(value = "college_name", key = "#collegeId")
    public String getCollegeName(Long collegeId) {
        // find college
        College college = collegeRepository.findById(collegeId).orElseThrow(
                () -> new RuntimeException("College not found!")
        );

        return college.getName();
    }

    // get college-admin name
    @Cacheable(value = "college_adminName", key = "#collegeAdminId")
    public String getName(Long collegeAdminId) {
        // find college-admin
        CollegeAdmin collegeAdmin = collegeAdminRepository.findById(collegeAdminId)
                .orElseThrow(() -> new RuntimeException("College-Admin not found!"));

        return collegeAdmin.getFullName();
    }

    // get college-admin (for backend-use)
    public CollegeAdmin getAdmin(College college) {

        return collegeAdminRepository.findByCollege(college);
    }

    // get stats
    @Cacheable(value = "college_dashboard_stats", key = "#collegeId")
    public CollegeAdminDashboardStatsDto getStats(Long collegeId) {

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
