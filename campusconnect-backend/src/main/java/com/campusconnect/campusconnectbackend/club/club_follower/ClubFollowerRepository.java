package com.campusconnect.campusconnectbackend.club.club_follower;

import com.campusconnect.campusconnectbackend.club.Club;
import com.campusconnect.campusconnectbackend.club.club_follower.id.ClubFollowerId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ClubFollowerRepository extends JpaRepository<ClubFollower, ClubFollowerId> {

    @Query("""
        select cf.club
        from ClubFollower cf
        where cf.student.id = :studentId
    """)
    List<Club> findFollowedClubsByStudentId(Long studentId);

    int countByClub_Id(Long clubId);

    boolean existsByClub_IdAndStudent_Id(Long clubId, Long studentId);

    @Modifying
    @Query("""
        delete from ClubFollower cf
        where cf.club.id = :clubId
          and cf.student.id = :studentId
    """)
    void deleteByClubAndStudent(Long clubId, Long studentId);
}