package com.campusconnect.campusconnectbackend.student.repository;


import com.campusconnect.campusconnectbackend.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);

    Optional<Student> findStudentById(Long studentId);

    int countByCollege_Id(Long collegeId);

    List<Student> findAllByCollege_Id(Long collegeId);

    boolean existsByStudentId(String studentId);
}

