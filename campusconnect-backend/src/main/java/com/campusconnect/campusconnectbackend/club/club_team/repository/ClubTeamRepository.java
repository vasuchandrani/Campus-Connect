package com.campusconnect.campusconnectbackend.club.club_team.repository;

import com.campusconnect.campusconnectbackend.club.club_team.entity.ClubTeam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClubTeamRepository extends JpaRepository<ClubTeam, Integer> {
    int countByClub_Id(Long clubId);

    List<ClubTeam> findByClub_IdOrderByCreatedAtDesc(Long clubId);

    ClubTeam findById(Long id);

    boolean existsById(Long id);

    void deleteById(Long id);
}
