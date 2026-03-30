package com.campusconnect.campusconnectbackend.reviewer.repository;

import com.campusconnect.campusconnectbackend.reviewer.entity.Reviewer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewerRepository extends JpaRepository<Reviewer, Long> {

    Optional<Reviewer> findByEmail(String email);

    List<Reviewer> findAllByCollege_Id(Long collegeId);

}

