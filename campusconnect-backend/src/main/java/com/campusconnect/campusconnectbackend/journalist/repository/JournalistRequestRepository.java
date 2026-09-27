package com.campusconnect.campusconnectbackend.journalist.repository;

import com.campusconnect.campusconnectbackend.journalist.entity.JournalistRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JournalistRequestRepository extends JpaRepository<JournalistRequest, Long> {

    @Query("SELECT jr FROM JournalistRequest jr LEFT JOIN FETCH jr.student s LEFT JOIN FETCH s.user LEFT JOIN FETCH jr.college WHERE jr.college.id = :collegeId")
    List<JournalistRequest> findAllByCollege_Id(@Param("collegeId") Long collegeId);

    @Query("SELECT jr FROM JournalistRequest jr LEFT JOIN FETCH jr.student s LEFT JOIN FETCH s.user LEFT JOIN FETCH jr.college WHERE jr.id = :id")
    Optional<JournalistRequest> findByIdWithStudentAndCollege(@Param("id") Long id);

    Optional<JournalistRequest> findByStudent_Id(Long studentId);

    boolean existsByStudent_Id(Long studentId);
}
