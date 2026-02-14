package com.campusconnect.campusconnectbackend.club.club_team.repository;

import com.campusconnect.campusconnectbackend.club.club_team.entity.ClubTeam;
import com.campusconnect.campusconnectbackend.club.club_team.entity.ClubTeamMember;
import com.campusconnect.campusconnectbackend.club.club_team.entity.id.ClubTeamMemberId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClubTeamMemberRepository extends JpaRepository<ClubTeamMember, ClubTeamMemberId> {
    List<ClubTeamMember> findAllByTeam(ClubTeam team);
}
