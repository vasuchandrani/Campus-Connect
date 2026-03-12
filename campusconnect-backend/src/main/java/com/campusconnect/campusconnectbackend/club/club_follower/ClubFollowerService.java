package com.campusconnect.campusconnectbackend.club.club_follower;

import com.campusconnect.campusconnectbackend.club.Club;
import com.campusconnect.campusconnectbackend.club.ClubRepository;
import com.campusconnect.campusconnectbackend.club.club_follower.id.ClubFollowerId;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.service.StudentRepoService;
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
    public List<Club> getFollowedClubs() {

        Long studentId = authService.getCurrentUserId();
        return clubFollowerRepository.findFollowedClubsByStudentId(studentId);
    }

    // get follower count
    public int getFollowerCount(Long clubId) {
        return clubFollowerRepository.countByClub_Id(clubId);
    }

    // follow-unfollow
    @Transactional
    public MessageResponseDto changeFollow(Long clubId, boolean follow) {
        // find student
        Long studentId = authService.getCurrentUserId();

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

        Club club =  clubRepository.findById(clubId).orElseThrow(
                () -> new RuntimeException("Club not found")
        );
        if (follow) {
            return new MessageResponseDto("Followed "+ club.getName() +" Successfully");
        }
        return new MessageResponseDto("Unfollowed " + club.getName() + " Successfully");
    }
}
