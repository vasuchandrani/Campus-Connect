package com.campusconnect.campusconnectbackend.club.club_request.service.serviceImpl;

import com.campusconnect.campusconnectbackend.club.club_request.entity.ClubRequest;
import com.campusconnect.campusconnectbackend.club.club_request.entity.enums.ClubRequestStatus;
import com.campusconnect.campusconnectbackend.club.club_request.repository.ClubRequestRepository;
import com.campusconnect.campusconnectbackend.club.club_request.service.ClubRequestService;
import com.campusconnect.campusconnectbackend.club.dto.res.ClubRequestResponseDto;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.club.service.ClubMemberManagementService;
import com.campusconnect.campusconnectbackend.club.service.ClubService;
import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.club_verification.ClubVerifiedDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.professor.entity.Professor;
import com.campusconnect.campusconnectbackend.professor.repository.ProfessorRepository;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.dto.req.ClubRequestDto;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.club.club_mentor.entity.ClubMentor;
import com.campusconnect.campusconnectbackend.club.club_mentor.repository.ClubMentorRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClubRequestServiceImpl implements ClubRequestService {

    private final ClubRequestRepository clubRequestRepository;
    private final ClubRepository clubRepository;
    private final ProfessorRepository professorRepository;
    private final EmailDispatcherService emailDispatcherService;
    private final ClubMemberManagementService clubMemberManagementService;
    private final ClubMentorRepository clubMentorRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthService authService;
    private final ClubService clubService;

    @Value("${CLUB_DEFAULT_IMAGE:club_default.png}")
    private String clubDefaultImage;

    @Override
    @Transactional
    @CacheEvict(value = "club_requests", key = "@authService.getCurrentCollegeId()")
    public boolean store(ClubRequestDto request, Student student, College college) {
        try {
            ClubRequest clubRequest = new ClubRequest();
            clubRequest.setClubName(request.getClubName());
            clubRequest.setClubDescription(request.getClubDescription());
            clubRequest.setProposal(request.getClubDescription());
            clubRequest.setStatus(ClubRequestStatus.PENDING);
            clubRequest.setCollege(college);
            clubRequest.setStudent(student);

            clubRequestRepository.save(clubRequest);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Cacheable(
            value = "club_requests",
            key = "#collegeId",
            sync = true
    )
    public List<ClubRequestResponseDto> getClubRequests(Long collegeId) {
        List<ClubRequest> requests = clubRequestRepository.findByCollege_Id(collegeId);
        List<ClubRequestResponseDto> response = new ArrayList<>();

        for (ClubRequest request : requests) {
            ClubRequestResponseDto dto = new ClubRequestResponseDto();
            dto.setId(request.getId());
            dto.setClubName(request.getClubName());
            dto.setClubDescription(request.getClubDescription());
            dto.setCreatedAt(request.getCreatedAt());
            dto.setStudentName(request.getStudent().getFullName());
            response.add(dto);
        }

        return response;
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_requests", key = "@authService.getCurrentCollegeId()"),
            @CacheEvict(value = "college_dashboard_stats", allEntries = true),
            @CacheEvict(value = "clubs", key = "'college_' + @authService.getCurrentCollegeId()"),
    })
    public MessageResponseDto acceptRequest(Long clubReqId, Long mentorId) {
        ClubRequest clubRequest = clubRequestRepository.findById(clubReqId).orElseThrow(
                () -> new RuntimeException("Club request with id " + clubReqId + " not found")
        );

        if (mentorId == null) {
            throw new RuntimeException("A faculty mentor must be selected to approve a club");
        }

        Professor mentor = professorRepository.findById(mentorId).orElseThrow(
                () -> new RuntimeException("Selected professor mentor not found")
        );

        if (mentor.getCollege() == null || !mentor.getCollege().getId().equals(clubRequest.getCollege().getId())) {
            throw new RuntimeException("Mentor must belong to the same college as the club");
        }

        Club club = new Club();
        club.setName(clubRequest.getClubName());
        club.setDescription(clubRequest.getClubDescription());
        club.setCollege(clubRequest.getCollege());
        club.setLogoUrl(clubDefaultImage);
        club.setMentor(mentor);
        club.setAdmin(clubRequest.getStudent());
        String founderName = clubRequest.getStudent().getFullName();
        if (founderName == null || founderName.isBlank()) {
            founderName = clubRequest.getStudent().getEmail();
        }
        club.setFoundedBy(founderName);
        club.setActive(true);
        clubRepository.save(club);

        String password = UUID.randomUUID().toString().substring(0, 8);
        clubMemberManagementService.addClubMember(club, clubRequest.getStudent(), "ADMIN", password);

        // Generate dedicated password for faculty mentor and create ClubMentor record
        String mentorPassword = UUID.randomUUID().toString().substring(0, 8);
        ClubMentor clubMentor = new ClubMentor();
        clubMentor.setClub(club);
        clubMentor.setProfessor(mentor);
        clubMentor.setPasswordHash(passwordEncoder.encode(mentorPassword));
        clubMentor.setRole("PRIMARY_MENTOR");
        clubMentor.setActive(true);
        clubMentorRepository.save(clubMentor);

        clubRequestRepository.delete(clubRequest);

        ClubVerifiedDto dto = new ClubVerifiedDto();
        dto.setClubName(clubRequest.getClubName());
        dto.setStudentEmail(clubRequest.getStudent().getEmail());
        dto.setPassword(password);
        Long clubId = club.getId();
        dto.setClubDashboardLink("/campusconnect/clubs/" + clubId + "/admin");
        try {
            emailDispatcherService.sendClubApprovedToStudent(dto);
        } catch (Exception e) {
            System.err.println("Failed to send club approval email: " + e.getMessage());
        }

        // Send appointment and credentials email to faculty mentor
        String mentorEmail = mentor.getEmail();
        if (mentorEmail != null && !mentorEmail.isBlank()) {
            try {
                emailDispatcherService.sendClubMentorAssigned(
                        mentorEmail,
                        mentor.getFullName(),
                        club.getName(),
                        mentorPassword,
                        "/campus-connect/professor/clubs/" + club.getId() + "/mentor-dashboard"
                );
            } catch (Exception e) {
                System.err.println("Failed to send club mentor assignment email: " + e.getMessage());
            }
        }

        return new MessageResponseDto("Club-request approved successfully");
    }

    @Override
    @Transactional
    @CacheEvict(value = "club_requests", key = "@authService.getCurrentCollegeId()")
    public MessageResponseDto rejectClubRequest(Long clubReqId) {
        ClubRequest clubRequest = clubRequestRepository.findById(clubReqId).orElseThrow(
                () -> new RuntimeException("Club request with id: " + clubReqId + " not found")
        );

        clubRequestRepository.delete(clubRequest);
        return new MessageResponseDto("Club-request rejected successfully");
    }
}
