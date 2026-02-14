package com.campusconnect.campusconnectbackend.club.club_follower;

import com.campusconnect.campusconnectbackend.club.Club;
import com.campusconnect.campusconnectbackend.club.ClubRepository;
import com.campusconnect.campusconnectbackend.club.club_follower.id.ClubFollowerId;
import com.campusconnect.campusconnectbackend.security.auth.AuthService;
import com.campusconnect.campusconnectbackend.student.service.StudentService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClubFollowerService {

    private final ClubFollowerRepository clubFollowerRepository;
    private final AuthService authService;
    private final StudentService studentService;
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
    public void changeFollow(Long clubId, boolean follow) {
        // find student
        Long studentId = authService.getCurrentUserId();

        if (follow) {
            ClubFollowerId clubFollowerId = new ClubFollowerId();
            clubFollowerId.setClubId(clubId);
            clubFollowerId.setStudentId(studentId);

            ClubFollower follower = new ClubFollower();
            follower.setId(clubFollowerId);
            follower.setStudent(studentService.getStudent(studentId));
            follower.setClub(clubRepository.findById(clubId).orElse(null));

            clubFollowerRepository.save(follower);
        }
        else {

            if (!clubFollowerRepository.existsByClub_IdAndStudent_Id(clubId, studentId)) {
                return;
            }

            clubFollowerRepository.deleteByClubAndStudent(clubId, studentId);
        }
    }
}
