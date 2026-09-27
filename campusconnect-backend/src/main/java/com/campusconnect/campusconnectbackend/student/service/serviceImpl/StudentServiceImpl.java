package com.campusconnect.campusconnectbackend.student.service.serviceImpl;

import com.campusconnect.campusconnectbackend.club.club_member.service.ClubMemberService;
import com.campusconnect.campusconnectbackend.club.club_request.service.ClubRequestService;
import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.college_admin.service.CollegeAdminService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.event.service.EventService;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.club_verification.ClubVerificationDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.research_paper.repository.ResearchPaperRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.dto.req.ClubRequestDto;
import com.campusconnect.campusconnectbackend.student.dto.res.StudentDashboardStatsDto;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import com.campusconnect.campusconnectbackend.student.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {

    private final ClubMemberService clubMemberService;
    private final EventService eventService;
    private final ClubRequestService clubRequestService;
    private final EmailDispatcherService emailDispatcherService;
    private final CollegeAdminService collegeAdminService;
    private final AuthService authService;
    private final StudentRepoService studentRepoService;
    private final ClubRepository clubRepository;
    private final ResearchPaperRepository researchPaperRepository;

    @Override
    @Cacheable(value = "student_name", key = "#studentId", sync = true)
    public String getName(Long studentId) {
        Student student = studentRepoService.getStudent(studentId);
        return student.getFullName();
    }

    @Override
    public StudentDashboardStatsDto getStats(Long studentId) {
        Student student = studentRepoService.getStudent(studentId);
        Long collegeId = student.getCollege().getId();
        int joinedClub = clubMemberService.getJoinedClubCount(studentId);
        int activeEvents = eventService.getActiveEventsByCollege(collegeId).size();
        int collegeClubs = clubRepository.countByCollege_Id(collegeId);
        int myResearches = researchPaperRepository.countByUser_Id(student.getUser().getId());

        StudentDashboardStatsDto dto = new StudentDashboardStatsDto();
        dto.setJoinedClubs(joinedClub);
        dto.setUpcomingEvents(activeEvents);
        dto.setCollegeClubs(collegeClubs);
        dto.setMyResearches(myResearches);

        return dto;
    }

    @Override
    @Transactional
    public MessageResponseDto requestForClub(ClubRequestDto request) {
        Student student = studentRepoService.getStudent(authService.getCurrentUserId());

        boolean reqSaved = clubRequestService.store(request, student, student.getCollege());

        ClubVerificationDto dto = new ClubVerificationDto();
        if (collegeAdminService.getAdmin(student.getCollege()) != null) {
            dto.setAdminEmail(collegeAdminService.getAdmin(student.getCollege()).getEmail());
        }
        dto.setStudentId(student.getStudentId());
        dto.setClubName(request.getClubName());
        dto.setAdminDashboardLink("/campusconnect/college-admin/dashboard");

        if (!reqSaved) {
            return new MessageResponseDto("Failed to save club request, Try again");
        }
        emailDispatcherService.sendClubRequestToAdmin(dto);
        return new MessageResponseDto("Club Request sent successfully");
    }

    @Override
    public String manageClub(Long clubId) {
        Long studentId = authService.getCurrentUserId();
        String role = clubMemberService.getMyRole(clubId, studentId);

        return switch (role) {
            case "ADMIN" -> "/campusconnect/clubAdmin/" + clubId;
            case "MEMBER" -> "/campusconnect/member/" + clubId;
            default -> "You are not authorized";
        };
    }
}
