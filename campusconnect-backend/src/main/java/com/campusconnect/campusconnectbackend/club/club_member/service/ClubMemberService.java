package com.campusconnect.campusconnectbackend.club.club_member.service;

import com.campusconnect.campusconnectbackend.club.club_follower.repository.ClubFollowerRepository;
import com.campusconnect.campusconnectbackend.club.club_member.repository.ClubMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_team.repository.ClubTeamRepository;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubDashboardStatsDto;
import com.campusconnect.campusconnectbackend.event.service.EventService;

import lombok.RequiredArgsConstructor;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClubMemberService {

    private final ClubMemberRepository clubMemberRepository;
    private final EventService eventService;
    private final ClubTeamRepository clubTeamRepository;
    private final ClubFollowerRepository clubFollowerRepository;

    // get my role in club
    public String getMyRole(Long clubId, Long studentId) {
        return clubMemberRepository.findRoleByClubIdAndStudentId(clubId, studentId).orElse("You are not authorized");
    }

    // get joined clubs
    public int getJoinedClubCount(Long studentId) {
        return clubMemberRepository.countByStudent_Id(studentId);
    }

    // get stats
    @Cacheable(
            value = "club_dashboard_stats",
            key = "#clubId",
            sync = true
    )
    public ClubDashboardStatsDto getStats(Long clubId) {

        ClubDashboardStatsDto dto = new ClubDashboardStatsDto();
        dto.setEvents(eventService.getActiveEventsByClub(clubId).size());
        dto.setMembers(clubMemberRepository.countByClub_Id(clubId));
        dto.setTeams(clubTeamRepository.countByClub_Id(clubId));
        dto.setFollowers(clubFollowerRepository.countByClub_Id(clubId));
        return dto;
    }
}