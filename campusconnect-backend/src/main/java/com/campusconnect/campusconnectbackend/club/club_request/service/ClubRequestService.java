package com.campusconnect.campusconnectbackend.club.club_request.service;

import com.campusconnect.campusconnectbackend.club.club_request.entity.ClubRequest;
import com.campusconnect.campusconnectbackend.club.club_request.repository.ClubRequestRepository;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.club.service.ClubMemberManagementService;
import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.student.dto.req.ClubRequestDto;
import com.campusconnect.campusconnectbackend.club.dto.res.ClubRequestResponseDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.dto.club_verification.ClubVerifiedDto;
import com.campusconnect.campusconnectbackend.integrations.mail_service.service.EmailDispatcherService;
import com.campusconnect.campusconnectbackend.student.entity.Student;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Caching;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClubRequestService {

    private final ClubRequestRepository clubRequestRepository;
    private final ClubRepository clubRepository;
    private final EmailDispatcherService emailDispatcherService;
    private final ClubMemberManagementService clubMemberManagementService;

    @Value("${CLUB_DEFAULT_IMAGE}")
    private String clubDefaultImage;

    // store the club-request
    @Transactional
    @CacheEvict(value = "club_requests", key = "@authService.getCurrentCollegeId()")
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

        } catch (Exception e) {
            return false;
        }
    }

    // get all club-requests made by students of particular college's students
    @Cacheable(
            value = "club_requests",
            key = "#collegeId",
            sync = true
    )
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
    @Caching(evict = {
            @CacheEvict(value = "club_requests", key = "@authService.getCurrentCollegeId()"),
            @CacheEvict(value = "college_dashboard_stats", key = "@authService.getCurrentCollegeId()"),
            @CacheEvict(value = "clubs_college", key = "@authService.getCurrentCollegeId()"),
    })
    public MessageResponseDto acceptRequest(Long clubReqId) {
        // find club-request
        ClubRequest clubRequest = clubRequestRepository.findClubRequestById(clubReqId);
        // create club
        Club club = new Club();
        club.setName(clubRequest.getClubName());
        club.setDescription(clubRequest.getClubDescription());
        club.setCollege(clubRequest.getCollege());
        // set default image/logo of club
        club.setLogoUrl(clubDefaultImage);
        // save club in db
        clubRepository.save(club);

        // create club-admin
        // add club-member with role "ADMIN"

        clubMemberManagementService.addClubMember(club, clubRequest.getStudent(), "ADMIN");

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


    @Transactional
    @CacheEvict(value = "club_requests", key = "@authService.getCurrentCollegeId()")
    public MessageResponseDto rejectClubRequest(Long clubReqId) {

        // check if exist
        if (!clubRequestRepository.existsById(clubReqId)) {
            throw new RuntimeException("Club with id: " + clubReqId + " not found");
        }

        clubRequestRepository.deleteById(clubReqId);
        return new MessageResponseDto("Club-request rejected successfully");
    }
}