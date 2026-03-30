package com.campusconnect.campusconnectbackend.college_admin.repository;

import com.campusconnect.campusconnectbackend.college.entity.College;
import com.campusconnect.campusconnectbackend.college_admin.entity.CollegeAdmin;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CollegeAdminRepository extends JpaRepository<CollegeAdmin, Long> {

    Optional<CollegeAdmin> findByEmail(String email);

    CollegeAdmin findByCollege(College college);
}

