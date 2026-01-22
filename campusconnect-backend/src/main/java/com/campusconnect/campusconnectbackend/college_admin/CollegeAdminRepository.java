package com.campusconnect.campusconnectbackend.college_admin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CollegeAdminRepository extends JpaRepository<CollegeAdmin, Long> {

    Optional<CollegeAdmin> findByEmail(String email);
}

