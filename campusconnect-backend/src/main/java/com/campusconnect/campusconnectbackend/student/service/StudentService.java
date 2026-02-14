package com.campusconnect.campusconnectbackend.student.service;

import com.campusconnect.campusconnectbackend.club.club_member.ClubMemberService;
import com.campusconnect.campusconnectbackend.club.club_request.ClubRequestService;
import com.campusconnect.campusconnectbackend.college_admin.service.CollegeAdminService;
import com.campusconnect.campusconnectbackend.dto.request.student.ClubRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.student.StudentDashboardStatsDto;
import com.campusconnect.campusconnectbackend.club.event.service.EventService;
import com.campusconnect.campusconnectbackend.mail_service.dto.club_verification.ClubVerificationDto;
import com.campusconnect.campusconnectbackend.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.Student;
import com.campusconnect.campusconnectbackend.student.StudentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final ClubMemberService clubMemberService;
    private final EventService eventService;
    private final ClubRequestService clubRequestService;
    private final EmailDispatcherService emailDispatcherService;
    private final CollegeAdminService collegeAdminService;
    private final AuthService authService;

    // get student by id
    public Student getStudent(Long studentId) {
        return studentRepository.findStudentById(studentId);
    }

    // get student by email
    public Student getStudentByEmail (String email) {
        return studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found!"));
    }

    // get student-name
    public String getName(Long userId) {
        Student student = studentRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found!"));

        return student.getFullName();
    }

    // get stats
    public StudentDashboardStatsDto getStats() {

        int joinedClub = clubMemberService.getJoinedClubCount();
        int upcomingEvents = eventService.getEventsCountByStatus("UPCOMING");

        StudentDashboardStatsDto dto = new StudentDashboardStatsDto();
        dto.setJoinedClubs(joinedClub);
        dto.setUpcomingEvents(upcomingEvents);

        return dto;
    }

    // request for a new club
    @Transactional
    public boolean requestForClub(ClubRequestDto request) {
        try {
            Student student = studentRepository.findById(authService.getCurrentUserId()).orElseThrow(
                    () -> new RuntimeException("User not found!")
            );
            // store club-request
            clubRequestService.store(request, student, student.getCollege());

            ClubVerificationDto dto = new ClubVerificationDto();
            dto.setAdminEmail(collegeAdminService.getAdmin(student.getCollege()).getEmail());
            dto.setStudentId(student.getStudentId());
            dto.setClubName(request.getClubName());
            dto.setAdminDashboardLink("/campusconnect/college-admin/dashboard");

            emailDispatcherService.sendClubRequestToAdmin(dto);

            return true;
        }
        catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
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
