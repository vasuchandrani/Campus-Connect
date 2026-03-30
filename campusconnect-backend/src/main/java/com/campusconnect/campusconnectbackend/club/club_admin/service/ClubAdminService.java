package com.campusconnect.campusconnectbackend.club.club_admin.service;

import com.campusconnect.campusconnectbackend.club.service.ClubMemberManagementService;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.service.ClubService;
import com.campusconnect.campusconnectbackend.club.dto.req.AddMemberRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;

import lombok.RequiredArgsConstructor;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClubAdminService {
    private final ClubService clubService;
    private final StudentRepoService studentRepoService;
    private final ClubMemberManagementService clubMemberManagementService;

    // add student as club-member
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_dashboard_stats", key = "#clubId"),
            @CacheEvict(value = "club_member_count", key = "#clubId")
    })
    public MessageResponseDto addMember(Long clubId, AddMemberRequestDto request) {

        Student student = studentRepoService.getStudentByEmail(request.getEmail());
        Club club = clubService.getClubById(clubId);

        return clubMemberManagementService.addClubMember(club, student, request.getRole());
    }

    // remove club-member
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_dashboard_stats", key = "#clubId"),
            @CacheEvict(value = "club_member_count", key = "#clubId"),
            @CacheEvict(value = "club_member_role", key = "#clubId + '_' + #studentId")
    })
    public MessageResponseDto removeMember(Long clubId, Long studentId) {

        return clubMemberManagementService.removeClubMember(clubId, studentId);
    }
}