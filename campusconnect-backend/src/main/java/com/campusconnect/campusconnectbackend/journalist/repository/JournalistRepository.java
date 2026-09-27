package com.campusconnect.campusconnectbackend.journalist.repository;

import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JournalistRepository extends JpaRepository<Journalist, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT j FROM Journalist j WHERE j.student.user.email = :studentEmail")
    Optional<Journalist> findByStudent_Email(@org.springframework.data.repository.query.Param("studentEmail") String studentEmail);

    Optional<Journalist> findByStudent_Id(Long studentId);

    boolean existsByStudent_Id(Long studentId);

    int countByCollege_Id(Long collegeId);

    List<Journalist> findAllByCollege_Id(Long collegeId);
}
