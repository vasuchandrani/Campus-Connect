package com.campusconnect.campusconnectbackend.professor.repository;

import com.campusconnect.campusconnectbackend.professor.entity.Professor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Professor p WHERE p.user.email = :email")
    Optional<Professor> findByEmail(@org.springframework.data.repository.query.Param("email") String email);

    List<Professor> findAllByCollege_Id(Long collegeId);

    Optional<Professor> findByUser_Id(Long userId);
}

