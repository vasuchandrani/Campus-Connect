package com.campusconnect.campusconnectbackend.club.club_request;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClubRequestRepository extends JpaRepository<ClubRequest, Long> {
    List<ClubRequest> findByCollege_Id(Long collegeId);

    ClubRequest findClubRequestById(Long id);
}
