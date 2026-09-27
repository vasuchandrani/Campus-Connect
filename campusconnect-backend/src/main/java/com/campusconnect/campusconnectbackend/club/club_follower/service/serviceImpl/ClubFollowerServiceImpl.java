package com.campusconnect.campusconnectbackend.club.club_follower.service.serviceImpl;

import com.campusconnect.campusconnectbackend.club.club_follower.entity.ClubFollower;
import com.campusconnect.campusconnectbackend.club.club_follower.entity.ClubUserFollower;
import com.campusconnect.campusconnectbackend.club.club_follower.entity.id.ClubFollowerId;
import com.campusconnect.campusconnectbackend.club.club_follower.repository.ClubFollowerRepository;
import com.campusconnect.campusconnectbackend.club.club_follower.repository.ClubUserFollowerRepository;
import com.campusconnect.campusconnectbackend.club.club_follower.service.ClubFollowerService;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.club.repository.ClubRepository;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
import com.campusconnect.campusconnectbackend.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClubFollowerServiceImpl implements ClubFollowerService {

    private final ClubFollowerRepository clubFollowerRepository;
    private final ClubUserFollowerRepository clubUserFollowerRepository;
    private final StudentRepoService studentRepoService;
    private final ClubRepository clubRepository;
    private final AuthService authService;

    @Override
    public List<Club> getFollowedClubs(Long studentId) {
        return clubFollowerRepository.findFollowedClubsByStudentId(studentId);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_dashboard_stats", key = "#clubId", beforeInvocation = true),
            @CacheEvict(value = "club_details", key = "#clubId", beforeInvocation = true)
    })
    public MessageResponseDto changeFollow(Long studentId, Long clubId, boolean follow) {
        Student student = studentRepoService.getStudent(studentId);
        Club club = clubRepository.findById(clubId).orElseThrow(
                () -> new RuntimeException("Club not found")
        );

        if (follow) {
            ClubFollowerId clubFollowerId = new ClubFollowerId();
            clubFollowerId.setClubId(clubId);
            clubFollowerId.setStudentId(studentId);

            ClubFollower follower = new ClubFollower();
            follower.setId(clubFollowerId);
            follower.setStudent(student);
            follower.setClub(club);

            clubFollowerRepository.save(follower);

            if (student.getUser() != null && student.getUser().getId() != null) {
                if (!clubUserFollowerRepository.existsByClub_IdAndUser_Id(clubId, student.getUser().getId())) {
                    clubUserFollowerRepository.save(new ClubUserFollower(club, student.getUser(), "STUDENT"));
                }
            }
        } else {
            if (clubFollowerRepository.existsByClub_IdAndStudent_Id(clubId, studentId)) {
                clubFollowerRepository.deleteByClubAndStudent(clubId, studentId);
            }
            if (student.getUser() != null && student.getUser().getId() != null) {
                clubUserFollowerRepository.deleteByClub_IdAndUser_Id(clubId, student.getUser().getId());
            }
        }

        if (follow) {
            return new MessageResponseDto("Followed " + club.getName() + " Successfully");
        }
        return new MessageResponseDto("Unfollowed " + club.getName() + " Successfully");
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "club_dashboard_stats", key = "#clubId", beforeInvocation = true),
            @CacheEvict(value = "club_details", key = "#clubId", beforeInvocation = true)
    })
    public MessageResponseDto changeFollow(Long clubId, boolean follow) {
        String role = authService.getCurrentRole();
        Long currentEntityId = authService.getCurrentUserId();

        if ("STUDENT".equalsIgnoreCase(role)) {
            return changeFollow(currentEntityId, clubId, follow);
        }

        Club club = clubRepository.findById(clubId).orElseThrow(
                () -> new RuntimeException("Club not found")
        );

        User user = authService.getCurrentUser();
        if (user == null || user.getId() == null) {
            throw new RuntimeException("Authenticated user not found");
        }

        if (follow) {
            if (!clubUserFollowerRepository.existsByClub_IdAndUser_Id(clubId, user.getId())) {
                ClubUserFollower follower = new ClubUserFollower(club, user, role != null ? role : "UNKNOWN");
                clubUserFollowerRepository.save(follower);
            }
            return new MessageResponseDto("Followed " + club.getName() + " Successfully");
        } else {
            clubUserFollowerRepository.deleteByClub_IdAndUser_Id(clubId, user.getId());
            return new MessageResponseDto("Unfollowed " + club.getName() + " Successfully");
        }
    }

    @Override
    public boolean isFollowing(Long clubId) {
        try {
            String role = authService.getCurrentRole();
            if (role == null) return false;

            if ("STUDENT".equalsIgnoreCase(role)) {
                Long studentId = authService.getCurrentUserId();
                if (studentId != null && clubFollowerRepository.existsByClub_IdAndStudent_Id(clubId, studentId)) {
                    return true;
                }
            }

            User user = authService.getCurrentUser();
            if (user != null && user.getId() != null) {
                return clubUserFollowerRepository.existsByClub_IdAndUser_Id(clubId, user.getId());
            }
        } catch (Exception e) {
            log.warn("Error checking follow status for club {}: {}", clubId, e.getMessage());
        }
        return false;
    }

    @Override
    public int getFollowerCount(Long clubId) {
        int studentFollowers = clubFollowerRepository.countByClub_Id(clubId);
        int otherFollowers = clubUserFollowerRepository.countByClub_IdAndRoleIn(clubId, List.of("PROFESSOR", "COLLEGE_ADMIN"));
        return studentFollowers + otherFollowers;
    }
}
