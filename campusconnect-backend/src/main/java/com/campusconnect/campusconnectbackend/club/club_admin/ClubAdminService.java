package com.campusconnect.campusconnectbackend.club.club_admin;

import com.campusconnect.campusconnectbackend.club.club_member.ClubMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_member.ClubMemberService;
import com.campusconnect.campusconnectbackend.club.club_member.ClubMember;
import com.campusconnect.campusconnectbackend.club.club_member.id.ClubMemberId;
import com.campusconnect.campusconnectbackend.club.Club;
import com.campusconnect.campusconnectbackend.club.club_follower.ClubFollowerService;
import com.campusconnect.campusconnectbackend.club.ClubService;
import com.campusconnect.campusconnectbackend.club.club_team.ClubTeamService;
import com.campusconnect.campusconnectbackend.dto.request.club.AddMemberRequestDto;
import com.campusconnect.campusconnectbackend.dto.response.club.ClubDashboardStatsDto;
import com.campusconnect.campusconnectbackend.club.event.service.EventService;
import com.campusconnect.campusconnectbackend.student.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ClubAdminService {
    private final EventService eventService;
    private final ClubMemberService clubMemberService;
    private final ClubTeamService clubTeamService;
    private final ClubFollowerService clubFollowerService;
    private final StudentService studentService;
    private final ClubService clubService;
    private final ClubMemberRepository clubMemberRepository;

    // get stats
    public ClubDashboardStatsDto getStats(Long clubId) {
        ClubDashboardStatsDto dto = new ClubDashboardStatsDto();
        dto.setEvents(eventService.getEventsCountByStatus("UPCOMING"));
        dto.setMembers(clubMemberService.getJoinedMemberCount(clubId));
        dto.setTeams(clubTeamService.getTeamCount(clubId));
        dto.setFollowers(clubFollowerService.getFollowerCount(clubId));
        return dto;
    }

    // add student as club-member
    @Transactional
    public boolean addMember(Long clubId, AddMemberRequestDto request) {
        try {
            // get the student
            Student student = studentService.getStudentByEmail(request.getEmail());
            Club club = clubService.getClubById(clubId);

            // create embedded id
            ClubMemberId clubMemberId = new ClubMemberId();
            clubMemberId.setClubId(clubId);
            clubMemberId.setStudentId(student.getId());

            // create club-member
            ClubMember member = new ClubMember();
            member.setId(clubMemberId);
            member.setClub(club);
            member.setStudent(student);
            member.setRole(request.getRole());

            // save in db
            clubMemberRepository.save(member);
            return true;
        }
        catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("Student is already a member");
        }
    }

    // remove club-member
    @Transactional
    public boolean removeMember(Long clubId, Long studentId) {
        // create club-member id
        ClubMemberId clubMemberId = new ClubMemberId();
        clubMemberId.setClubId(clubId);
        clubMemberId.setStudentId(studentId);

        if (clubMemberRepository.existsById(clubMemberId)) {
            clubMemberRepository.deleteById(clubMemberId);
            return true;
        }
        return false;
    }
}
