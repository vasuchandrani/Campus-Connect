package com.campusconnect.campusconnectbackend.journalist.repository;

import com.campusconnect.campusconnectbackend.journalist.entity.Journalist;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JournalistRepository extends JpaRepository<Journalist, Long> {

    Optional<Journalist> findByStudent_Email(String studentEmail);

    int countByCollege_Id(Long collegeId);


    List<Journalist> findAllByCollege_Id(Long collegeId);
}
