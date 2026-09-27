package com.campusconnect.campusconnectbackend.club.club_follower.repository;

import com.campusconnect.campusconnectbackend.club.club_follower.entity.ClubUserFollower;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ClubUserFollowerRepository extends JpaRepository<ClubUserFollower, Long> {

    boolean existsByClub_IdAndUser_Id(Long clubId, Long userId);

    @Modifying
    @Query("DELETE FROM ClubUserFollower cuf WHERE cuf.club.id = :clubId AND cuf.user.id = :userId")
    void deleteByClub_IdAndUser_Id(@Param("clubId") Long clubId, @Param("userId") Long userId);

    int countByClub_Id(Long clubId);

    int countByClub_IdAndRoleIn(Long clubId, Collection<String> roles);

    @Query("SELECT cuf.club FROM ClubUserFollower cuf WHERE cuf.user.id = :userId ORDER BY cuf.createdAt DESC")
    List<Club> findFollowedClubsByUserId(@Param("userId") Long userId);
}
