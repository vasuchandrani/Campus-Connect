package com.campusconnect.campusconnectbackend.student.service;

import com.campusconnect.campusconnectbackend.club.club_member.service.ClubMemberService;
import com.campusconnect.campusconnectbackend.club.club_request.service.ClubRequestService;
import com.campusconnect.campusconnectbackend.college_admin.service.CollegeAdminService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.student.dto.req.ClubRequestDto;
import com.campusconnect.campusconnectbackend.student.dto.res.StudentDashboardStatsDto;
import com.campusconnect.campusconnectbackend.event.service.EventService;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.club_verification.ClubVerificationDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final ClubMemberService clubMemberService;
    private final EventService eventService;
    private final ClubRequestService clubRequestService;
    private final EmailDispatcherService emailDispatcherService;
    private final CollegeAdminService collegeAdminService;
    private final AuthService authService;
    private final StudentRepoService studentRepoService;

    // get student-name
    @Cacheable(value = "student_name", key = "#studentId", sync = true)
    public String getName(Long studentId) {

        Student student = studentRepoService.getStudent(studentId);
        return student.getFullName();
    }

    // get stats
    @Cacheable(value = "student_dashboard_stats", key = "#studentId", sync = true)
    public StudentDashboardStatsDto getStats(Long studentId) {

        int joinedClub = clubMemberService.getJoinedClubCount(studentId);
        int upcomingEvents = eventService.getActiveEventsByCollege(authService.getCurrentCollegeId()).size();

        StudentDashboardStatsDto dto = new StudentDashboardStatsDto();
        dto.setJoinedClubs(joinedClub);
        dto.setUpcomingEvents(upcomingEvents);

        return dto;
    }

    // request for a new club
    @Transactional
    public MessageResponseDto requestForClub(ClubRequestDto request) {

        Student student = studentRepoService.getStudent(authService.getCurrentUserId());

        // store club-request
        boolean reqSaved = clubRequestService.store(request, student, student.getCollege());

        ClubVerificationDto dto = new ClubVerificationDto();
        dto.setAdminEmail(collegeAdminService.getAdmin(student.getCollege()).getEmail());
        dto.setStudentId(student.getStudentId());
        dto.setClubName(request.getClubName());
        dto.setAdminDashboardLink("/campusconnect/college-admin/dashboard");

        if (!reqSaved) {
            return new MessageResponseDto("Failed to save club request, Try again");
        }
        emailDispatcherService.sendClubRequestToAdmin(dto);
        return new MessageResponseDto("Club Request sent successfully");
    }

    // get my club
    public String manageClub(Long clubId) {

        Long studentId = authService.getCurrentUserId();
        String role = clubMemberService.getMyRole(clubId, studentId);

        return
                switch (role) {

            case "ADMIN" -> "/campusconnect/clubAdmin/" + clubId;

            case "MEMBER" -> "/campusconnect/member/" + clubId;

            default -> "You are not authorized";

        };
    }
}
