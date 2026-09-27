package com.campusconnect.campusconnectbackend.student.service;

import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.student.dto.req.ClubRequestDto;
import com.campusconnect.campusconnectbackend.student.dto.res.StudentDashboardStatsDto;

public interface StudentService {

    String getName(Long studentId);

    StudentDashboardStatsDto getStats(Long studentId);

    MessageResponseDto requestForClub(ClubRequestDto request);

    String manageClub(Long clubId);
}
