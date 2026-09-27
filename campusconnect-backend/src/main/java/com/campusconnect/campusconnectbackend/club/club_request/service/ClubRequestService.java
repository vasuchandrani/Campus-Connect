package com.campusconnect.campusconnectbackend.club.club_request.service;

import com.campusconnect.campusconnectbackend.club.dto.res.ClubRequestResponseDto;
import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.student.dto.req.ClubRequestDto;
import com.campusconnect.campusconnectbackend.student.entity.Student;

import java.util.List;

public interface ClubRequestService {
    boolean store(ClubRequestDto request, Student student, College college);
    List<ClubRequestResponseDto> getClubRequests(Long collegeId);
    MessageResponseDto acceptRequest(Long clubReqId, Long mentorId);
    MessageResponseDto rejectClubRequest(Long clubReqId);
}