package com.campusconnect.campusconnectbackend.club.club_member;

import com.campusconnect.campusconnectbackend.club.club_follower.ClubFollowerRepository;
import com.campusconnect.campusconnectbackend.club.club_team.repository.ClubTeamRepository;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubDashboardStatsDto;
import com.campusconnect.campusconnectbackend.club.event.service.EventService;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClubMemberService {

    private final ClubMemberRepository clubMemberRepository;
    private final AuthService authService;
    private final EventService eventService;
    private final ClubTeamRepository clubTeamRepository;
    private final ClubFollowerRepository clubFollowerRepository;

    // get my role in club
    public String getMyRole(Long clubId, Long studentId) {
        return clubMemberRepository.findRoleByClubIdAndStudentId(clubId, studentId).orElse("You are not authorized");
    }

    // get joined clubs
    public int getJoinedClubCount() {
        Long id = authService.getCurrentUserId();
        return clubMemberRepository.countByStudent_Id(id);
    }

    // get joined members in club
    public int getJoinedMemberCount(Long clubId) {
        return clubMemberRepository.countByClub_Id(clubId);
    }

    // get stats
    public ClubDashboardStatsDto getStats(Long clubId) {

        ClubDashboardStatsDto dto = new ClubDashboardStatsDto();
        dto.setEvents(eventService.getUpcomingEventsCountByCollege());
        dto.setMembers(getJoinedMemberCount(clubId));
        dto.setTeams(clubTeamRepository.countByClub_Id(clubId));
        dto.setFollowers(clubFollowerRepository.countByClub_Id(clubId));
        return dto;
    }
}