package com.campusconnect.campusconnectbackend.club.service;

import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.student.entity.Student;

public interface ClubMemberManagementService {
    MessageResponseDto addClubMember(Club club, Student student, String role);
    MessageResponseDto addClubMember(Club club, Student student, String role, String rawPassword);
    MessageResponseDto removeClubMember(Long clubId, Long studentId);
    String getRole(Long clubId);
}
