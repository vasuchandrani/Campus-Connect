package com.campusconnect.campusconnectbackend.college_admin.service.serviceImpl;

import com.campusconnect.campusconnectbackend.club.service.ClubService;
import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college.repository.CollegeRepository;
import com.campusconnect.campusconnectbackend.college_admin.dto.res.CollegeAdminDashboardStatsDto;
import com.campusconnect.campusconnectbackend.college_admin.entity.CollegeAdmin;
import com.campusconnect.campusconnectbackend.college_admin.repository.CollegeAdminRepository;
import com.campusconnect.campusconnectbackend.college_admin.service.CollegeAdminService;
import com.campusconnect.campusconnectbackend.journalist.service.JournalistService;
import com.campusconnect.campusconnectbackend.newspaper.service.NewsPaperService;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CollegeAdminServiceImpl implements CollegeAdminService {

    private final CollegeAdminRepository collegeAdminRepository;
    private final CollegeRepository collegeRepository;
    private final ClubService clubService;
    private final JournalistService journalistService;
    private final StudentRepoService studentRepoService;
    private final NewsPaperService newsPaperService;

    @Override
    @Cacheable(value = "college_name", key = "#collegeId")
    public String getCollegeName(Long collegeId) {
        College college = collegeRepository.findById(collegeId).orElseThrow(
                () -> new RuntimeException("College not found!")
        );
        return college.getName();
    }

    @Override
    @Cacheable(value = "college_adminName", key = "#collegeAdminId")
    public String getName(Long collegeAdminId) {
        CollegeAdmin collegeAdmin = collegeAdminRepository.findById(collegeAdminId)
                .orElseThrow(() -> new RuntimeException("College-Admin not found!"));
        return collegeAdmin.getFullName();
    }

    @Override
    public CollegeAdmin getAdmin(College college) {
        return collegeAdminRepository.findByCollege(college);
    }

    @Override
    public CollegeAdminDashboardStatsDto getStats(Long collegeId) {
        int clubs = clubService.getClubsCountByCollege(collegeId);
        int students = studentRepoService.getStudentCountByCollege(collegeId);
        int journalist = journalistService.getJournalistsCountByCollege(collegeId);
        int publishedPapers = newsPaperService.getNewsPapersCountByCollege(collegeId);

        CollegeAdminDashboardStatsDto dto = new CollegeAdminDashboardStatsDto();
        dto.setClubs(clubs);
        dto.setStudents(students);
        dto.setJournalist(journalist);
        dto.setPublishedPapers(publishedPapers);

        return dto;
    }
}
