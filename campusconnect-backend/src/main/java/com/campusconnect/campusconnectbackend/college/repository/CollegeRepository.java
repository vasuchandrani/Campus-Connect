package com.campusconnect.campusconnectbackend.college.repository;

import com.campusconnect.campusconnectbackend.college.entity.College;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CollegeRepository extends JpaRepository<College, Long> {

    Optional<College> findByName(String name);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"location"})
    java.util.List<College> findAll();
}

