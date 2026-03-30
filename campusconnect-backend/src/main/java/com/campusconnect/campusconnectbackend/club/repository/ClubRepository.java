package com.campusconnect.campusconnectbackend.club.repository;

import com.campusconnect.campusconnectbackend.club.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ClubRepository extends JpaRepository<Club,Long> {


    List<Club> findAllByCollege_Id(Long collegeId);

    int countByCollege_Id(Long collegeId);

    Club findClubById(Long id);
}
