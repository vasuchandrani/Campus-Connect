package com.campusconnect.campusconnectbackend.club.club_mentor.repository;

import com.campusconnect.campusconnectbackend.club.club_mentor.entity.ClubMentor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClubMentorRepository extends JpaRepository<ClubMentor, Long> {

    Optional<ClubMentor> findByClub_IdAndProfessor_Id(Long clubId, Long professorId);

    List<ClubMentor> findByProfessor_Id(Long professorId);

    List<ClubMentor> findByClub_Id(Long clubId);

    boolean existsByClub_IdAndProfessor_Id(Long clubId, Long professorId);

    @Query("SELECT cm FROM ClubMentor cm JOIN FETCH cm.club c JOIN FETCH cm.professor p WHERE c.id = :clubId AND p.id = :profId")
    Optional<ClubMentor> findWithDetailsByClubIdAndProfessorId(@Param("clubId") Long clubId, @Param("profId") Long profId);

    @Query("SELECT cm.club.id FROM ClubMentor cm WHERE cm.professor.id = :profId AND cm.isActive = true")
    List<Long> findClubIdsByProfessorId(@Param("profId") Long profId);
}
