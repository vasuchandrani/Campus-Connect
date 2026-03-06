package com.campusconnect.campusconnectbackend.student.service;

import com.campusconnect.campusconnectbackend.club.club_member.ClubMemberService;
import com.campusconnect.campusconnectbackend.club.club_request.ClubRequestService;
import com.campusconnect.campusconnectbackend.college_admin.service.CollegeAdminService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.student.dto.req.ClubRequestDto;
import com.campusconnect.campusconnectbackend.student.dto.res.StudentDashboardStatsDto;
import com.campusconnect.campusconnectbackend.club.event.service.EventService;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.club_verification.ClubVerificationDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.Student;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
    public String getName(Long userId) {
        Student student = studentRepoService.getStudent(userId);
        return student.getFullName();
    }

    // get stats
    public StudentDashboardStatsDto getStats() {

        int joinedClub = clubMemberService.getJoinedClubCount();
        int upcomingEvents = eventService.getUpcomingEventsCountByCollege();

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

        if (reqSaved) {
            emailDispatcherService.sendClubRequestToAdmin(dto);
        }

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
