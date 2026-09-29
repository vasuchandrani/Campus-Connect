package com.campusconnect.campusconnectbackend.club.club_team.service.serviceImpl;

import com.campusconnect.campusconnectbackend.club.club_member.entity.ClubMember;
import com.campusconnect.campusconnectbackend.club.club_member.repository.ClubMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_team.entity.ClubTeam;
import com.campusconnect.campusconnectbackend.club.club_team.entity.ClubTeamMember;
import com.campusconnect.campusconnectbackend.club.club_team.entity.enums.TeamMemberRole;
import com.campusconnect.campusconnectbackend.club.club_team.entity.id.ClubTeamMemberId;
import com.campusconnect.campusconnectbackend.club.club_team.repository.ClubTeamMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_team.repository.ClubTeamRepository;
import com.campusconnect.campusconnectbackend.club.club_team.service.ClubTeamService;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubTeamDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubTeamMemberDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.TeamNameDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_card.ClubMemberDto;
import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClubTeamServiceImpl implements ClubTeamService {

    private final ClubTeamRepository clubTeamRepository;
    private final ClubTeamMemberRepository clubTeamMemberRepository;
    private final ClubMemberRepository clubMemberRepository;
    private final ClubRepository clubRepository;

    @Value("${CLUB_MEMBER_MALE:default_male.png}")
    private String maleMemberDefaultImage;

    @Value("${CLUB_MEMBER_FEMALE:default_female.png}")
    private String femaleMemberDefaultImage;

    private List<ClubTeamMemberDto> getTeamMembers(ClubTeam team) {
        List<ClubTeamMember> teamMembers = clubTeamMemberRepository.findAllByTeam(team);
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

    private List<ClubMemberDto> getClubMembers(Long clubId) {
        List<ClubMember> clubMembersList = clubMemberRepository.findClubMemberByClub_Id(clubId);
        List<ClubMemberDto> clubMembers = new ArrayList<>();

        for (ClubMember clubMember : clubMembersList) {
            ClubMemberDto dto = new ClubMemberDto();
            dto.setStudentName(clubMember.getStudent().getFullName());
            dto.setStudentId(clubMember.getStudent().getId());
            dto.setRole(clubMember.getRole() != null ? clubMember.getRole().name() : "MEMBER");
            dto.setImage(clubMember.getImage());
            clubMembers.add(dto);
        }
        return clubMembers;
    }

    private List<ClubTeamDto> getClubTeams(Long clubId) {
        List<ClubTeam> teams = clubTeamRepository.findByClub_IdOrderByCreatedAtDesc(clubId);
        List<ClubTeamDto> response = new ArrayList<>();

        for (ClubTeam team : teams) {
            ClubTeamDto dto = new ClubTeamDto();
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

    @Override
    @Cacheable(
            value = "club_teams",
            key = "#clubId",
            sync = true
    )
    public List<ClubTeamDto> getTeamsByClub(Long clubId) {
        return getClubTeams(clubId);
    }

    @Override
    public int getTeamCount(Long clubId) {
        return clubTeamRepository.countByClub_Id(clubId);
    }

    @Override
    @Cacheable(
            value = "club_team_names",
            key = "#clubId",
            sync = true
    )
    public List<TeamNameDto> getTeamNames(Long clubId) {
        List<ClubTeam> teams = clubTeamRepository.findByClub_IdOrderByCreatedAtDesc(clubId);
        List<TeamNameDto> teamNames = new ArrayList<>();

        for (ClubTeam team : teams) {
            TeamNameDto teamName = new TeamNameDto();
            teamName.setName(team.getName());
            teamName.setDescription(team.getDescription());
            teamNames.add(teamName);
        }
        return teamNames;
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_teams", key = "#clubId"),
            @CacheEvict(value = "club_team_names", key = "#clubId"),
    })
    public MessageResponseDto createTeam(Long clubId, TeamNameDto request) {
        ClubTeam team = new ClubTeam();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setClub(clubRepository.findClubById(clubId));
        clubTeamRepository.save(team);

        return new MessageResponseDto("Team created successfully");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_teams", key = "#clubId"),
            @CacheEvict(value = "club_team_names", key = "#clubId"),
    })
    public MessageResponseDto updateTeam(Long clubId, Long teamId, TeamNameDto request) {
        ClubTeam team = clubTeamRepository.findById(teamId);
        if (team == null) {
            throw new RuntimeException("Club Team does not exist");
        }
        if (request.getName() != null && !request.getName().isBlank()) {
            team.setName(request.getName());
        }
        if (request.getDescription() != null) {
            team.setDescription(request.getDescription());
        }
        clubTeamRepository.save(team);
        return new MessageResponseDto("Team updated successfully");
    }

    @Override
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

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_teams", key = "#clubId"),
            @CacheEvict(value = "club_team_names", key = "#clubId"),
    })
    public MessageResponseDto addTeamMember(Long clubId, Long teamId, Long studentId) {
        ClubMember student = clubMemberRepository.findStudentByClub_IdAndStudent_Id(clubId, studentId).orElseThrow(
                () -> new RuntimeException("Club Member Not Found")
        );

        ClubTeamMemberId id = new ClubTeamMemberId();
        id.setTeamId(teamId);
        id.setMemberId(student.getId());

        ClubTeamMember member = new ClubTeamMember();
        member.setId(id);
        member.setTeam(clubTeamRepository.findById(teamId));
        member.setClubMember(student);
        member.setRole(TeamMemberRole.MEMBER);

        if (student.getStudent() != null && "MALE".equalsIgnoreCase(student.getStudent().getGender())) {
            member.setImage(maleMemberDefaultImage);
        } else {
            member.setImage(femaleMemberDefaultImage);
        }
        clubTeamMemberRepository.save(member);
        return new MessageResponseDto("Team-member added successfully");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_teams", key = "#clubId"),
            @CacheEvict(value = "club_team_names", key = "#clubId"),
    })
    public MessageResponseDto deleteTeamMember(Long clubId, Long teamId, Long studentId) {
        ClubMember student = clubMemberRepository.findStudentByClub_IdAndStudent_Id(clubId, studentId).orElseThrow(
                () -> new RuntimeException("Club Member Not Found")
        );

        ClubTeamMemberId id = new ClubTeamMemberId();
        id.setTeamId(teamId);
        id.setMemberId(student.getId());

        if (!clubTeamMemberRepository.existsById(id)) {
            throw new RuntimeException("Team-member does not exist");
        }

        clubTeamMemberRepository.deleteById(id);

        return new MessageResponseDto("Team-member removed successfully");
    }
}
