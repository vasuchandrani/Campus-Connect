package com.campusconnect.campusconnectbackend.club.club_request;

import com.campusconnect.campusconnectbackend.club.club_member.ClubMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_member.ClubMember;
import com.campusconnect.campusconnectbackend.club.club_member.id.ClubMemberId;
import com.campusconnect.campusconnectbackend.club.Club;
import com.campusconnect.campusconnectbackend.club.ClubRepository;
import com.campusconnect.campusconnectbackend.college.College;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.student.dto.req.ClubRequestDto;
import com.campusconnect.campusconnectbackend.club.dto.res.ClubRequestResponseDto;
import com.campusconnect.campusconnectbackend.mail_service.dto.club_verification.ClubVerifiedDto;
import com.campusconnect.campusconnectbackend.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.student.Student;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClubRequestService {

    private final ClubRequestRepository clubRequestRepository;
    private final ClubRepository clubRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final EmailDispatcherService emailDispatcherService;

    // store the club-request
    public boolean store(ClubRequestDto request, Student student, College college) {
        try {
            // create
            ClubRequest clubRequest = new ClubRequest();
            clubRequest.setClubName(request.getClubName());
            clubRequest.setClubDescription(request.getClubDescription());
            clubRequest.setStatus("pending");
            clubRequest.setCollege(college);
            clubRequest.setStudent(student);

            // save in db
            clubRequestRepository.save(clubRequest);

            return true;
        }
        catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    // get all club-requests made by students of particular college
    public List<ClubRequestResponseDto> getClubRequests(Long collegeId) {
        // find all club-requests of college
        List<ClubRequest> requests = clubRequestRepository.findByCollege_Id(collegeId);
        // create response
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

    // accept the club request
    @Transactional
    public MessageResponseDto acceptRequest(Long clubReqId) {
        // find club-request
        ClubRequest clubRequest = clubRequestRepository.findClubRequestById(clubReqId);
        // create club
        Club club = new Club();
        club.setName(clubRequest.getClubName());
        club.setDescription(clubRequest.getClubDescription());
        club.setCollege(clubRequest.getCollege());
        // set default image/logo of club
        club.setLogoUrl("http://localhost:8080/images/default-club.png");
        // save club in db
        clubRepository.save(club);

        // create club-admin
        // add club-member with role "ADMIN"

        ClubMemberId id = new ClubMemberId();
        id.setClubId(club.getId());
        id.setStudentId(clubRequest.getStudent().getId());

        ClubMember member = new ClubMember();
        member.setId(id);
        member.setClub(club);
        member.setStudent(clubRequest.getStudent());
        member.setRole("ADMIN");
        // set default image of member
//            if (clubRequest.getStudent().getGender() == "male") {
//                member.setImage("http://localhost:8080/images/default-male-member.png");
//            }
//            else {
//                member.setImage("http://localhost:8080/images/default-female.png");
//            }
        // save member(admin) in db
        clubMemberRepository.save(member);
        // delete club-request
        clubRequestRepository.deleteById(clubReqId);

        // send mail to student
        // create dto
        ClubVerifiedDto dto = new ClubVerifiedDto();
        dto.setClubName(clubRequest.getClubName());
        dto.setStudentEmail(clubRequest.getStudent().getEmail());
        Long clubId = club.getId();
        dto.setClubDashboardLink("/campusconnect/clubs/" + clubId + "/admin");
        // send
        emailDispatcherService.sendClubApprovedToStudent(dto);

        return new MessageResponseDto("Club-request approved successfully");
    }

    // reject the club request
    @Transactional
    public MessageResponseDto rejectClubRequest(Long clubReqId) {

        // check if exist
        if (!clubRequestRepository.existsById(clubReqId)) {
            throw new RuntimeException("Club with id: " + clubReqId + " not found");
        }

        clubRequestRepository.deleteById(clubReqId);
        return new MessageResponseDto("Club-request rejected successfully");
    }
}
