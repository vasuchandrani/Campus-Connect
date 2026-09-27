package com.campusconnect.campusconnectbackend.college.repository;

import com.campusconnect.campusconnectbackend.college.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {

    List<Department> findByCollege_IdOrderByNameAsc(Long collegeId);

    List<Department> findByCollege_Id(Long collegeId);

    Optional<Department> findByCollege_IdAndNameIgnoreCase(Long collegeId, String name);

    boolean existsByCollege_IdAndNameIgnoreCase(Long collegeId, String name);

    void deleteByCollege_Id(Long collegeId);
}
