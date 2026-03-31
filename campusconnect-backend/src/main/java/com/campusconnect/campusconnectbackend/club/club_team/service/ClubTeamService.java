package com.campusconnect.campusconnectbackend.club.club_team.service;

import com.campusconnect.campusconnectbackend.club.club_member.repository.ClubMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_member.entity.ClubMember;
import com.campusconnect.campusconnectbackend.club.club_team.entity.ClubTeam;
import com.campusconnect.campusconnectbackend.club.club_team.entity.ClubTeamMember;
import com.campusconnect.campusconnectbackend.club.club_team.entity.id.ClubTeamMemberId;
import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.club.club_team.repository.ClubTeamMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_team.repository.ClubTeamRepository;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubTeamDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubTeamMemberDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_card.ClubMemberDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.TeamNameDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;

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

    @Value("${CLUB_MEMBER_MALE}")
    private String maleMemberDefaultImage;

    @Value("${CLUB_MEMBER_FEMALE}")
    private String femaleMemberDefaultImage;

    private List<ClubTeamMemberDto> getTeamMembers (ClubTeam team) {
        // find all team-members
        List<ClubTeamMember> teamMembers = clubTeamMemberRepository.findAllByTeam(team);
        // create response
        List<ClubTeamMemberDto> members = new ArrayList<>();

        for (ClubTeamMember teamMember : teamMembers) {

            ClubTeamMemberDto dto = new ClubTeamMemberDto();
            dto.setStudentName(teamMember.getStudent().getFullName());
            dto.setStudentId(teamMember.getStudent().getId());
            dto.setImage(teamMember.getImage());

            members.add(dto);
        }
        return members;
    }

    private List<ClubMemberDto> getClubMembers (Long clubId) {
        // find club-members
        List<ClubMember> clubMembersList = clubMemberRepository.findClubMemberByClub_Id(clubId);
        // create response
        List<ClubMemberDto> clubMembers = new ArrayList<>();

        for (ClubMember clubMember : clubMembersList) {

            ClubMemberDto dto = new ClubMemberDto();
            dto.setStudentName(clubMember.getStudent().getFullName());
            dto.setStudentId(clubMember.getStudent().getId());
            dto.setRole(clubMember.getRole());
            dto.setImage(clubMember.getImage());

            clubMembers.add(dto);

        }
        return clubMembers;
    }

    private List<ClubTeamDto> getClubTeams (Long clubId) {
        // find teams
        List<ClubTeam> teams = clubTeamRepository.findByClub_IdOrderByCreatedAtDesc(clubId);
        // create response
        List<ClubTeamDto> response = new ArrayList<>();

        for (ClubTeam team : teams) {
            // create dto
            ClubTeamDto dto = new ClubTeamDto();
            // map the data
            dto.setId(team.getId());
            dto.setClubId(team.getClub().getId());
            dto.setName(team.getName());
            dto.setDescription(team.getDescription());
            dto.setMembers(getTeamMembers(team));
            dto.setClubMembers(getClubMembers(clubId));
            dto.setMembersCount(getTeamMembers(team).size());

            response.add(dto);
        }
        return response;
    }

    // get teams of club
    @Cacheable(
            value = "club_teams",
            key = "#clubId",
            sync = true
    )
    public List<ClubTeamDto> getTeamsByClub(Long clubId) {

        return getClubTeams(clubId);
    }

    // get count of team in the club
    public int getTeamCount(Long clubId) {
        return clubTeamRepository.countByClub_Id(clubId);
    }

    // get team-names of club
    @Cacheable(
            value = "club_team_names",
            key = "#clubId",
            sync = true
    )
    public List<TeamNameDto> getTeamNames(Long clubId) {
        // find club-teams
        List<ClubTeam> teams = clubTeamRepository.findByClub_IdOrderByCreatedAtDesc(clubId);
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
    @Caching(evict = {
            @CacheEvict(value = "club_teams", key = "#clubId"),
            @CacheEvict(value = "club_team_names", key = "#clubId"),
    })
    public MessageResponseDto createTeam(Long clubId, TeamNameDto request) {
        // create
        ClubTeam team = new ClubTeam();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setClub(clubRepository.findClubById(clubId));
        // save in db
        clubTeamRepository.save(team);

        return new MessageResponseDto("Team created successfully");
    }

    // delete team
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_teams", key = "#clubId"),
            @CacheEvict(value = "club_team_names", key = "#clubId"),
    })
    public MessageResponseDto deleteTeam(Long teamId, Long clubId) {

        if (!clubTeamRepository.existsById(teamId)) {
            throw new RuntimeException("Club Team does not exist");
        }
        clubTeamRepository.deleteById(teamId);

        return new MessageResponseDto("Team deleted successfully");
    }

    // add team member
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_teams", key = "#clubId"),
            @CacheEvict(value = "club_team_names", key = "#clubId"),
    })
    public MessageResponseDto addTeamMember(Long clubId, Long teamId, Long studentId) {

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

        if (student.getStudent().getGender().equals("MALE")) {
            member.setImage(maleMemberDefaultImage);
        }
        else {
            member.setImage(femaleMemberDefaultImage);
        }
        // save in db
        clubTeamMemberRepository.save(member);
        return new MessageResponseDto("Team-member added successfully");
    }

    // delete team member
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_teams", key = "#clubId"),
            @CacheEvict(value = "club_team_names", key = "#clubId"),
    })
    public MessageResponseDto deleteTeamMember(Long clubId, Long teamId, Long studentId) {

        // create id
        ClubTeamMemberId id  = new ClubTeamMemberId();
        id.setTeamId(teamId);
        id.setStudentId(studentId);

        // check if member exist
        if (!clubTeamMemberRepository.existsById(id)) {
            throw new RuntimeException("Team-member does not exist");
        }

        clubTeamMemberRepository.deleteById(id);

        return new MessageResponseDto("Team-member removed successfully");
    }
}
