package com.campusconnect.campusconnectbackend.reviewer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewerRepository extends JpaRepository<Reviewer, Long> {

    Optional<Reviewer> findByEmail(String email);
}

