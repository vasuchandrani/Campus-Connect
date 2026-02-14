package com.campusconnect.campusconnectbackend.club.club_member;

import com.campusconnect.campusconnectbackend.club.Club;
import com.campusconnect.campusconnectbackend.club.club_member.id.ClubMemberId;
import com.campusconnect.campusconnectbackend.student.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.*;
import java.util.Optional;

public interface ClubMemberRepository extends JpaRepository<ClubMember, ClubMemberId> {

    @Query("""
        select cm.student
        from ClubMember cm
        where cm.club.id = :clubId and cm.role = :role
    """)
    Optional<Student> findStudentByClubAndRole(Long clubId, String role);

    int countByStudent_Id(Long studentId);

    @Query("""
        select cm.club
        from ClubMember cm
        where cm.student.id = :studentId
    """)
    List<Club> findJoinedClubs(Long studentId);

    int countByClub_Id(Long clubId);

    List<ClubMember> findClubMemberByClub_Id(Long clubId);

    @Query("""
        select cm.role
        from ClubMember cm
        where cm.club.id = :clubId
          and cm.student.id = :studentId
    """)
    Optional<String> findRoleByClubIdAndStudentId(
            Long clubId,
            Long studentId
    );

    Optional<ClubMember> findStudentByClub_IdAndStudent_Id(Long clubId, Long studentId);
}
