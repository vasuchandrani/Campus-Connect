package com.campusconnect.campusconnectbackend.club;

import com.campusconnect.campusconnectbackend.club.club_member.ClubMember;
import com.campusconnect.campusconnectbackend.club.club_member.ClubMemberRepository;
import com.campusconnect.campusconnectbackend.club.club_member.id.ClubMemberId;
import com.campusconnect.campusconnectbackend.dto.response.MessageResponseDto;
import com.campusconnect.campusconnectbackend.student.Student;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClubMemberManagementService {

    private final ClubMemberRepository clubMemberRepository;

    @Value("${CLUB_MEMBER_MALE}")
    private String maleMemberDefaultImage;

    @Value("${CLUB_MEMBER_FEMALE}")
    private String femaleMemberDefaultImage;

    private ClubMember getClubMember(Club club, Student student, String role) {
        ClubMemberId clubMemberId = new ClubMemberId();
        clubMemberId.setClubId(club.getId());
        clubMemberId.setStudentId(student.getId());

        // create club-member
        ClubMember member = new ClubMember();
        member.setId(clubMemberId);
        member.setClub(club);
        member.setStudent(student);
        member.setRole(role);

        if (student.getGender().equals("MALE")) {
            member.setImage(maleMemberDefaultImage);
        }
        else {
            member.setImage(femaleMemberDefaultImage);
        }
        return member;
    }

    // add club-member
    @Transactional
    public MessageResponseDto addClubMember(Club club, Student student, String role) {

        // check if member exist
        if (clubMemberRepository.existsByStudentAndClub(student, club)) {
            return new MessageResponseDto("Club Member already exists");
        }

        // create club member
        ClubMember member = getClubMember(club, student, role);

        // save in db
        clubMemberRepository.save(member);

        return new MessageResponseDto("ClubMember added successfully");
    }

    // remove club-member
    @Transactional
    public MessageResponseDto removeClubMember(Long clubId, Long studentId) {

        if (!clubMemberRepository.existsByStudent_IdAndClub_Id(studentId, clubId)) {
            return new MessageResponseDto("Club Member does not exist");
        }
        clubMemberRepository.deleteByStudent_IdAndClub_Id(studentId, clubId);

        return new MessageResponseDto("ClubMember removed successfully");
    }
}
