package com.campusconnect.campusconnectbackend.college_admin.repository;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college_admin.entity.CollegeAdmin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CollegeAdminRepository extends JpaRepository<CollegeAdmin, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT a FROM CollegeAdmin a WHERE a.user.email = :email")
    Optional<CollegeAdmin> findByEmail(@org.springframework.data.repository.query.Param("email") String email);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM CollegeAdmin a JOIN FETCH a.user JOIN FETCH a.college c LEFT JOIN FETCH c.location WHERE a.id = :id")
    Optional<CollegeAdmin> findByIdWithDetails(@org.springframework.data.repository.query.Param("id") Long id);

    CollegeAdmin findByCollege(College college);

    Optional<CollegeAdmin> findByUser_Id(Long userId);

    Optional<CollegeAdmin> findFirstByCollege_Id(Long collegeId);
}

