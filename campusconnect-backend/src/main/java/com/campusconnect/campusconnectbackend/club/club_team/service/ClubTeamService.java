package com.campusconnect.campusconnectbackend.club.club_team.service;

import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.ClubTeamDto;
import com.campusconnect.campusconnectbackend.club.dto.res.club_admin_member.TeamNameDto;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;

import java.util.List;

public interface ClubTeamService {
    List<ClubTeamDto> getTeamsByClub(Long clubId);
    int getTeamCount(Long clubId);
    List<TeamNameDto> getTeamNames(Long clubId);
    MessageResponseDto createTeam(Long clubId, TeamNameDto request);
    MessageResponseDto updateTeam(Long clubId, Long teamId, TeamNameDto request);
    MessageResponseDto deleteTeam(Long teamId, Long clubId);
    MessageResponseDto addTeamMember(Long clubId, Long teamId, Long studentId);
    MessageResponseDto deleteTeamMember(Long clubId, Long teamId, Long studentId);
}
