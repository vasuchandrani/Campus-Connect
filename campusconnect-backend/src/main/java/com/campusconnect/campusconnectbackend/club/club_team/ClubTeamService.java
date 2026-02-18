package com.campusconnect.campusconnectbackend.club.club_team;

import com.campusconnect.campusconnectbackend.club.club_member.ClubMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_member.ClubMember;
import com.campusconnect.campusconnectbackend.club.club_team.entity.ClubTeam;
import com.campusconnect.campusconnectbackend.club.club_team.entity.ClubTeamMember;
import com.campusconnect.campusconnectbackend.club.club_team.entity.id.ClubTeamMemberId;
import com.campusconnect.campusconnectbackend.club.ClubRepository;
import com.campusconnect.campusconnectbackend.club.club_team.repository.ClubTeamMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_team.repository.ClubTeamRepository;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubTeamDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubTeamMemberDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_card.ClubMemberDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.TeamNameDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ClubTeamService {

    private final ClubTeamRepository clubTeamRepository;
    private final ClubTeamMemberRepository clubTeamMemberRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final ClubRepository clubRepository;

    // get teams of club
    public List<ClubTeamDto> getTeamsByClub(Long clubId) {
        // find teams
        List<ClubTeam> teams = clubTeamRepository.findByClub_IdOrderByCreatedAtDesc(clubId);
        // create response
        List<ClubTeamDto> response = new ArrayList<>();

        for (ClubTeam team : teams) {
            // find team members
            List<ClubTeamMember> teamMembers = clubTeamMemberRepository.findAllByTeam(team);
            List<ClubTeamMemberDto> members = new ArrayList<>();

            for (ClubTeamMember teamMember : teamMembers) {
                ClubTeamMemberDto dto = new ClubTeamMemberDto();
                dto.setStudentName(teamMember.getStudent().getFullName());
                dto.setStudentId(teamMember.getStudent().getId());
                members.add(dto);
            }
            // team member count
            int memberCount = teamMembers.size();

            // find club members
            List<ClubMember> clubMembersList = clubMemberRepository.findClubMemberByClub_Id(clubId);
            List<ClubMemberDto>  clubMembers = new ArrayList<>();

            for (ClubMember clubMember : clubMembersList) {
                ClubMemberDto dto = new ClubMemberDto();
                dto.setStudentName(clubMember.getStudent().getFullName());
                dto.setStudentId(clubMember.getStudent().getId());
                dto.setRole(clubMember.getRole());
                clubMembers.add(dto);
            }

            ClubTeamDto dto = new ClubTeamDto();
            dto.setId(team.getId());
            dto.setClubId(team.getClub().getId());
            dto.setName(team.getName());
            dto.setDescription(team.getDescription());
            dto.setMembers(members);
            dto.setClubMembers(clubMembers);
            dto.setMembersCount(memberCount);

            response.add(dto);
        }
        return response;
    }

    // get count of team in the club
    public int getTeamCount(Long clubId) {
        return clubTeamRepository.countByClub_Id(clubId);
    }

    // get team-names of club
    public List<TeamNameDto> getTeamNames(Long clubId) {
        // find club-teams
        List<ClubTeam>  teams = clubTeamRepository.findByClub_IdOrderByCreatedAtDesc(clubId);
        // create response
        List<TeamNameDto> teamNames = new ArrayList<>();

        for (ClubTeam team : teams) {
            TeamNameDto teamName = new TeamNameDto();
            teamName.setName(team.getName());
            teamName.setDescription(team.getDescription());
            teamNames.add(teamName);
        }
        return teamNames;
    }

    // create team
    @Transactional
    public boolean createTeam(Long clubId, TeamNameDto request) {
        try {
            // create
            ClubTeam team = new ClubTeam();
            team.setName(request.getName());
            team.setDescription(request.getDescription());
            team.setClub(clubRepository.findClubById(clubId));
            // save in db
            clubTeamRepository.save(team);
            return true;
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }

    // delete team
    @Transactional
    public boolean deleteTeam(Long teamId) {
        try {
            if (!clubTeamRepository.existsById(teamId)) {
                throw new Exception("Club Team does not exist");
            }
            clubTeamRepository.deleteById(teamId);
            return true;
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }

    // add team member
    @Transactional
    public boolean addTeamMember(Long clubId, Long teamId, Long studentId) {
        try {
            // find club member
            ClubMember student = clubMemberRepository.findStudentByClub_IdAndStudent_Id(clubId, studentId).orElseThrow(
                    () -> new RuntimeException("Club Member Not Found")
            );

            // create clubTeamMemberId
            ClubTeamMemberId id  = new ClubTeamMemberId();
            id.setTeamId(teamId);
            id.setStudentId(studentId);

            // create member
            ClubTeamMember member = new ClubTeamMember();
            member.setId(id);
            member.setTeam(clubTeamRepository.findById(teamId));
            member.setStudent(student.getStudent());
            member.setRole(student.getRole());
            // save in db
            clubTeamMemberRepository.save(member);
            return true;
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }

    // delete team member
    @Transactional
    public boolean deleteTeamMember(Long teamId, Long studentId) {
        try {
            // create id
            ClubTeamMemberId id  = new ClubTeamMemberId();
            id.setTeamId(teamId);
            id.setStudentId(studentId);

            // check if member exist
            if (clubTeamMemberRepository.existsById(id)) {
                // delete member
                clubTeamMemberRepository.deleteById(id);
                return true;
            }
            return false;
        }
        catch (Exception e) {
            System.out.println(e.getMessage());
            return false;
        }
    }
}
