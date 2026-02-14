package com.campusconnect.campusconnectbackend.journalist;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JournalistRepository extends JpaRepository<Journalist, Long> {

    Optional<Journalist> findByStudent_Email(String studentEmail);

    int countByCollege_Id(Long collegeId);
}
