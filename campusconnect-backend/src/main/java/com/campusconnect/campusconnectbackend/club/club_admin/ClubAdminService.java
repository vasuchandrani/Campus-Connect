package com.campusconnect.campusconnectbackend.club.club_admin;

import com.campusconnect.campusconnectbackend.club.ClubMemberManagementService;
import com.campusconnect.campusconnectbackend.club.club_member.ClubMemberService;
import com.campusconnect.campusconnectbackend.club.Club;
import com.campusconnect.campusconnectbackend.club.club_follower.ClubFollowerService;
import com.campusconnect.campusconnectbackend.club.ClubService;
import com.campusconnect.campusconnectbackend.club.club_team.ClubTeamService;
import com.campusconnect.campusconnectbackend.club.dto.req.AddMemberRequestDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubDashboardStatsDto;
import com.campusconnect.campusconnectbackend.club.event.service.EventService;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.student.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClubAdminService {
    private final EventService eventService;
    private final ClubMemberService clubMemberService;
    private final ClubTeamService clubTeamService;
    private final ClubFollowerService clubFollowerService;
    private final ClubService clubService;
    private final StudentRepoService studentRepoService;
    private final ClubMemberManagementService clubMemberManagementService;

    // get stats
    public ClubDashboardStatsDto getStats(Long clubId) {
        ClubDashboardStatsDto dto = new ClubDashboardStatsDto();
        dto.setEvents(eventService.getUpcomingEventsCountByCollege());
        dto.setMembers(clubMemberService.getJoinedMemberCount(clubId));
        dto.setTeams(clubTeamService.getTeamCount(clubId));
        dto.setFollowers(clubFollowerService.getFollowerCount(clubId));
        return dto;
    }

    // add student as club-member
    @Transactional
    public MessageResponseDto addMember(Long clubId, AddMemberRequestDto request) {

        Student student = studentRepoService.getStudentByEmail(request.getEmail());
        Club club = clubService.getClubById(clubId);

        return clubMemberManagementService.addClubMember(club, student, request.getRole());
    }

    // remove club-member
    @Transactional
    public MessageResponseDto removeMember(Long clubId, Long studentId) {

        return clubMemberManagementService.removeClubMember(clubId, studentId);
    }
}
