package com.campusconnect.campusconnectbackend.club.club_follower.service;

import com.campusconnect.campusconnectbackend.club.club_follower.entity.ClubFollower;
import com.campusconnect.campusconnectbackend.club.club_follower.repository.ClubFollowerRepository;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.club.club_follower.entity.id.ClubFollowerId;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClubFollowerService {

    private final ClubFollowerRepository clubFollowerRepository;
    private final AuthService authService;
    private final StudentRepoService studentRepoService;
    private final ClubRepository clubRepository;

    // get all followed clubs
    @Cacheable(
            value = "followed_clubs",
            key = "#studentId",
            sync = true
    )
    public List<Club> getFollowedClubs(Long studentId) {
        return clubFollowerRepository.findFollowedClubsByStudentId(studentId);
    }

    // follow-unfollow
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "followed_clubs", key = "#studentId"),
            @CacheEvict(value = "club_dashboard_stats", key = "#clubId")
    })
    public MessageResponseDto changeFollow(Long studentId, Long clubId, boolean follow) {

        if (follow) {
            ClubFollowerId clubFollowerId = new ClubFollowerId();
            clubFollowerId.setClubId(clubId);
            clubFollowerId.setStudentId(studentId);

            ClubFollower follower = new ClubFollower();
            follower.setId(clubFollowerId);
            follower.setStudent(studentRepoService.getStudent(studentId));
            follower.setClub(clubRepository.findById(clubId).orElse(null));

            clubFollowerRepository.save(follower);
        }
        else {

            if (!clubFollowerRepository.existsByClub_IdAndStudent_Id(clubId, studentId)) {
                throw new RuntimeException("Something went wrong, Reload the page");
            }

            clubFollowerRepository.deleteByClubAndStudent(clubId, studentId);
        }

        Club club = clubRepository.findById(clubId).orElseThrow(
                () -> new RuntimeException("Club not found")
        );

        if (follow) {
            return new MessageResponseDto("Followed " + club.getName() + " Successfully");
        }

        return new MessageResponseDto("Unfollowed " + club.getName() + " Successfully");
    }
}