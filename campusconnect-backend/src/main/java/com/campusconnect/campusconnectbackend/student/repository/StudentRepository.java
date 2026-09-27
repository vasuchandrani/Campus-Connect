package com.campusconnect.campusconnectbackend.student.repository;


import com.campusconnect.campusconnectbackend.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    @org.springframework.data.jpa.repository.Query("SELECT s FROM Student s WHERE s.user.email = :email")
    Optional<Student> findByEmail(@org.springframework.data.repository.query.Param("email") String email);

    Optional<Student> findStudentById(Long studentId);

    int countByCollege_Id(Long collegeId);

    List<Student> findAllByCollege_Id(Long collegeId);

    boolean existsByStudentId(String studentId);

    Optional<Student> findByUser_Id(Long userId);
}

