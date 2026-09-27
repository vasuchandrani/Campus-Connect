package com.campusconnect.campusconnectbackend.club.club_member.repository;

import com.campusconnect.campusconnectbackend.club.club_member.entity.ClubMember;
import com.campusconnect.campusconnectbackend.club.entity.Club;
import com.campusconnect.campusconnectbackend.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.*;
import java.util.Optional;

public interface ClubMemberRepository extends JpaRepository<ClubMember, Long> {

    @Query("""
        select cm.student
        from ClubMember cm
        where cm.club.id = :clubId and CAST(cm.role AS string) = :role
    """)
    Optional<Student> findStudentByClubAndRole(@Param("clubId") Long clubId, @Param("role") String role);

    int countByStudent_Id(Long studentId);

    @Query("""
        select cm.club
        from ClubMember cm
        where cm.student.id = :studentId
    """)
    List<Club> findJoinedClubs(@Param("studentId") Long studentId);

    int countByClub_Id(Long clubId);

    List<ClubMember> findClubMemberByClub_Id(Long clubId);

    @Query("""
        select CAST(cm.role AS string)
        from ClubMember cm
        where cm.club.id = :clubId
          and cm.student.id = :studentId
    """)
    Optional<String> findRoleByClubIdAndStudentId(
            @Param("clubId") Long clubId,
            @Param("studentId") Long studentId
    );

    Optional<ClubMember> findStudentByClub_IdAndStudent_Id(Long clubId, Long studentId);

    ClubMember findClubMemberByClub_IdAndStudent_Id(Long clubId, Long studentId);

    boolean existsByStudentAndClub(Student student, Club club);

    boolean existsByStudent_IdAndClub_Id(Long studentId, Long clubId);

    void deleteByStudent_IdAndClub_Id(Long studentId, Long clubId);
}
